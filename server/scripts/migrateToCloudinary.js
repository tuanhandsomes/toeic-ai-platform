/**
 * Migrate audio + image files from server/public/ to Cloudinary, then update
 * Question.content.{audioUrl,imageUrl} in MongoDB to point at the CDN URLs.
 *
 * Usage:
 *   cd server
 *   node scripts/migrateToCloudinary.js [--dry-run]
 *
 * --dry-run: scan files + show what would change, don't upload or touch DB.
 *
 * Idempotent: re-runs with overwrite=true, safe to retry on failure.
 *
 * Side effects:
 * - Creates folder structure on Cloudinary mirroring server/public/
 * - Updates Question docs in batches (per-resource)
 * - Multi-image hack (semicolon-separated imageUrl) is preserved — script
 *   splits, uploads each piece, then re-joins with ';' for storage.
 */
import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { getCloudinary } from '../src/config/cloudinary.js';
import { Question } from '../src/models/Question.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DRY_RUN = process.argv.includes('--dry-run');
const CONCURRENCY = 5; // parallel uploads — avoid Cloudinary free tier rate limits

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Walk a directory recursively, yielding { absPath, relPath } for each file.
 * relPath is relative to PUBLIC_DIR (e.g. "audio/ets-2026/test-01/E26-T01-01.mp3").
 */
async function* walkFiles(absDir, baseDir = absDir) {
  let entries;
  try {
    entries = await fs.readdir(absDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const abs = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(abs, baseDir);
    } else if (entry.isFile()) {
      yield {
        absPath: abs,
        relPath: path.relative(baseDir, abs).replaceAll('\\', '/'),
      };
    }
  }
}

/**
 * Strip extension, lowercase folder names where Cloudinary cares.
 * Local path "audio/ets-2026/test-01/E26-T01-01.mp3"
 *  → Cloudinary public_id "toeic-ai/audio/ets-2026/test-01/E26-T01-01"
 */
function pathToPublicId(relPath) {
  const noExt = relPath.replace(/\.[^.]+$/, '');
  return `toeic-ai/${noExt}`;
}

function resourceTypeFor(relPath) {
  // mp3/wav → 'video' (Cloudinary lumps audio under video resource_type)
  // png/jpg → 'image'
  if (/\.(mp3|wav|m4a|ogg)$/i.test(relPath)) return 'video';
  return 'image';
}

async function uploadFile(cld, { absPath, relPath }) {
  const publicId = pathToPublicId(relPath);
  const resourceType = resourceTypeFor(relPath);
  const result = await cld.uploader.upload(absPath, {
    public_id: publicId,
    resource_type: resourceType,
    overwrite: true,
    use_filename: false,
  });
  return { relPath, publicId, secureUrl: result.secure_url, resourceType };
}

/** Limited parallelism — process items in chunks of `concurrency`. */
async function mapWithConcurrency(items, concurrency, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const settled = await Promise.allSettled(chunk.map(fn));
    settled.forEach((r, idx) => {
      const item = chunk[idx];
      if (r.status === 'fulfilled') {
        results.push({ ok: true, item, value: r.value });
        console.log(`  ✓ ${item.relPath}`);
      } else {
        results.push({ ok: false, item, error: r.reason });
        console.error(`  ✗ ${item.relPath}: ${r.reason?.message || r.reason}`);
      }
    });
  }
  return results;
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no uploads, no DB writes\n' : '🚀 LIVE migration\n');

  const cld = getCloudinary();
  if (!cld && !DRY_RUN) {
    console.error('✗ Cloudinary not configured (check .env)');
    process.exit(1);
  }

  // 1. Discover files
  console.log('1️⃣  Scanning public/ ...');
  const files = [];
  for await (const file of walkFiles(PUBLIC_DIR)) {
    const basename = path.basename(file.relPath);
    // Skip dotfiles (.gitkeep, .DS_Store, ...) and README
    if (basename.startsWith('.') || basename === 'README.md') continue;
    files.push(file);
  }
  const audioCount = files.filter((f) => resourceTypeFor(f.relPath) === 'video').length;
  const imageCount = files.length - audioCount;
  console.log(`   Found ${files.length} files (${audioCount} audio, ${imageCount} image)\n`);

  if (DRY_RUN) {
    console.log('Sample mapping (first 5):');
    files.slice(0, 5).forEach((f) => {
      console.log(`   ${f.relPath} → ${pathToPublicId(f.relPath)} [${resourceTypeFor(f.relPath)}]`);
    });
    console.log('\n(Re-run without --dry-run to actually upload.)');
    return;
  }

  // 2. Upload
  console.log('2️⃣  Uploading to Cloudinary (5 parallel)...');
  const uploadResults = await mapWithConcurrency(files, CONCURRENCY, (f) => uploadFile(cld, f));
  const successCount = uploadResults.filter((r) => r.ok).length;
  const failCount = uploadResults.length - successCount;
  console.log(`   ${successCount} uploaded, ${failCount} failed\n`);

  if (failCount > 0) {
    console.error('✗ Some uploads failed. Fix and re-run (script is idempotent).');
    process.exit(1);
  }

  // 3. Build mapping: local URL prefix → Cloudinary URL
  // DB stores URL like "/audio/ets-2026/test-01/E26-T01-01.mp3" — match by suffix.
  const mapping = new Map(); // localUrl (e.g. "/audio/...") → cloudUrl
  for (const r of uploadResults) {
    if (!r.ok) continue;
    const localUrl = `/${r.item.relPath}`; // e.g. /audio/ets-2026/test-01/E26-T01-01.mp3
    mapping.set(localUrl, r.value.secureUrl);
  }

  // 4. Update Question docs
  console.log('3️⃣  Connecting MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('   Connected');

  console.log('\n4️⃣  Updating Question docs...');
  const questions = await Question.find({}).select('_id content').lean();
  let audioUpdates = 0;
  let imageUpdates = 0;
  let skipped = 0;

  for (const q of questions) {
    const updates = {};
    const currentAudio = q.content?.audioUrl || '';
    const currentImage = q.content?.imageUrl || '';

    // Audio: simple 1:1 replace
    if (currentAudio && mapping.has(currentAudio)) {
      updates['content.audioUrl'] = mapping.get(currentAudio);
      audioUpdates++;
    }

    // Image: may be semicolon-separated for Part 7 multi-passage
    if (currentImage) {
      const parts = currentImage.split(';').map((s) => s.trim()).filter(Boolean);
      const mapped = parts.map((p) => mapping.get(p) || p);
      const newImageUrl = mapped.join(';');
      if (newImageUrl !== currentImage) {
        updates['content.imageUrl'] = newImageUrl;
        imageUpdates++;
      }
    }

    if (Object.keys(updates).length === 0) {
      skipped++;
      continue;
    }

    await Question.updateOne({ _id: q._id }, { $set: updates });
  }

  console.log(`   Audio URLs updated: ${audioUpdates}`);
  console.log(`   Image URLs updated: ${imageUpdates}`);
  console.log(`   Questions skipped (no local URL):  ${skipped}`);
  console.log(`\n✓ Migration complete. Old local files in server/public/ can stay for now`);
  console.log(`  (they will be ignored — DB now points at Cloudinary CDN).`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
