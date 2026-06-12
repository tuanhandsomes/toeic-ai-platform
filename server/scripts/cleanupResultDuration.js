/**
 * One-off cleanup: clamp Result.durationSec cho các bản ghi cũ vượt giới hạn
 * hợp lý của đề. Phát sinh do bug Full Test draft cũ → startedAt từ nhiều ngày
 * trước → durationSec vài ngày, làm KPI "Tổng thời gian" + biểu đồ "Thời gian
 * học" bị nhiễm.
 *
 * Quy tắc cap (khớp resultService.submit sau fix):
 *   - Full Test: durationMinutes * 60 + 300s buffer
 *   - Practice : max(durationMinutes * 60 * 4, 4h)
 *
 * Run: `node server/scripts/cleanupResultDuration.js`
 *
 * Idempotent — chạy nhiều lần OK, chỉ update khi value vượt cap.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { Result } from '../src/models/Result.js';
import { Test } from '../src/models/Test.js';

async function run() {
  await connectDB();
  console.log('\n🔄 Cleaning up Result.durationSec outliers...\n');

  const tests = await Test.find().select('_id type durationMinutes').lean();
  const testMap = new Map(tests.map((t) => [String(t._id), t]));

  const results = await Result.find()
    .select('_id testId durationSec userId submittedAt')
    .lean();

  let updated = 0;
  let skipped = 0;
  let orphaned = 0;

  for (const r of results) {
    const t = testMap.get(String(r.testId));
    if (!t) {
      console.log(`  ⚠️  Skip ${r._id} — test không còn tồn tại`);
      orphaned++;
      continue;
    }
    const maxDurationSec =
      t.type === 'full'
        ? t.durationMinutes * 60 + 300
        : Math.max(t.durationMinutes * 60 * 4, 4 * 3600);

    if ((r.durationSec || 0) <= maxDurationSec) {
      skipped++;
      continue;
    }

    await Result.updateOne(
      { _id: r._id },
      { $set: { durationSec: maxDurationSec } },
    );
    const beforeH = (r.durationSec / 3600).toFixed(1);
    const afterMin = Math.round(maxDurationSec / 60);
    console.log(
      `  ✅  ${r._id} (${t.type}): ${beforeH}h → ${afterMin}p`,
    );
    updated++;
  }

  console.log(
    `\n📊 Done: ${updated} clamped, ${skipped} ok, ${orphaned} orphan\n`,
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
