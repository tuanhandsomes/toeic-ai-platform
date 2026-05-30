/**
 * One-time migration: update mọi Practice test (type='part') trong DB
 * → durationMinutes match với calibration 120 phút Full Test.
 *
 * Trước migration: Part 1=5, 2=9, 3=17, 4=12, 5=12, 6=8, 7=25 (tổng 88 phút)
 * Sau migration:   Part 1=4, 2=15, 3=24, 4=18, 5=18, 6=10, 7=33 (tổng 122 phút)
 *
 * Run: `node server/scripts/migratePracticeDuration.js`
 *
 * Idempotent — chạy nhiều lần OK, chỉ update khi value khác.
 */
import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import { Test } from '../src/models/Test.js';
import mongoose from 'mongoose';

const NEW_DURATION = {
  1: 4,
  2: 15,
  3: 24,
  4: 18,
  5: 18,
  6: 10,
  7: 33,
};

async function run() {
  await connectDB();
  console.log('\n🔄 Migrating Practice test durations...\n');

  const practiceTests = await Test.find({ type: 'part' }).select(
    '_id title part durationMinutes',
  );

  let updated = 0;
  let skipped = 0;

  for (const t of practiceTests) {
    const target = NEW_DURATION[t.part];
    if (!target) {
      console.log(`  ⚠️  Skip ${t.title} — không có Part hợp lệ`);
      skipped++;
      continue;
    }
    if (t.durationMinutes === target) {
      console.log(`  ✓  Skip ${t.title} — đã đúng (${target} phút)`);
      skipped++;
      continue;
    }
    await Test.updateOne(
      { _id: t._id },
      { $set: { durationMinutes: target } },
    );
    console.log(
      `  ✅  Updated ${t.title}: ${t.durationMinutes} → ${target} phút`,
    );
    updated++;
  }

  console.log(`\n📊 Done: ${updated} updated, ${skipped} skipped\n`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
