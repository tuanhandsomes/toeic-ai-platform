import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Question } from "../src/models/Question.js";
import { Test } from "../src/models/Test.js";
import { allQuestions, partCounts } from "./data/questions.js";

const seed = async () => {
  await connectDB();

  console.log("\n🌱 Seeding TOEIC questions...\n");

  // 1. Clear existing
  const deletedQuestions = await Question.deleteMany({});
  const deletedTests = await Test.deleteMany({});
  console.log(
    `  Cleared ${deletedQuestions.deletedCount} questions, ${deletedTests.deletedCount} tests`,
  );

  // 2. Insert questions
  const inserted = await Question.insertMany(allQuestions);
  console.log(`\n✓ Inserted ${inserted.length} questions:`);
  console.log(`  Part 1 (Photographs):           ${partCounts.part1} câu`);
  console.log(`  Part 2 (Question-Response):     ${partCounts.part2} câu`);
  console.log(`  Part 3 (Conversations):         ${partCounts.part3} câu`);
  console.log(`  Part 4 (Talks):                  ${partCounts.part4} câu`);
  console.log(`  Part 5 (Incomplete Sentences):  ${partCounts.part5} câu`);
  console.log(`  Part 6 (Text Completion):        ${partCounts.part6} câu`);
  console.log(`  Part 7 (Reading Comprehension): ${partCounts.part7} câu`);

  // 3. Group by part for building tests
  const byPart = inserted.reduce((acc, q) => {
    acc[q.part] ??= [];
    acc[q.part].push(q._id);
    return acc;
  }, {});

  // 4. Build Practice tests — 1 set per Part
  // Duration calibrate theo Full Test 120 phút (tổng 122 phút, ~61 LC/RC).
  // Match với testImportService + seedRealTest PART_META.
  const practiceTests = [
    { part: 1, title: "Part 1 — Mô tả tranh (Set 01)", duration: 4 },
    { part: 2, title: "Part 2 — Hỏi đáp (Set 01)", duration: 15 },
    { part: 3, title: "Part 3 — Hội thoại (Set 01)", duration: 24 },
    { part: 4, title: "Part 4 — Bài nói ngắn (Set 01)", duration: 18 },
    { part: 5, title: "Part 5 — Hoàn thành câu (Set 01)", duration: 18 },
    { part: 6, title: "Part 6 — Hoàn thành đoạn (Set 01)", duration: 10 },
    { part: 7, title: "Part 7 — Đọc hiểu (Set 01)", duration: 33 },
  ];

  const practiceTestDocs = practiceTests.map(({ part, title, duration }) => ({
    title,
    description: `Bài luyện tập Part ${part}. Toàn bộ câu hỏi mẫu được soạn theo format TOEIC chuẩn.`,
    type: "part",
    part,
    questionIds: byPart[part] || [],
    durationMinutes: duration,
    totalQuestions: (byPart[part] || []).length,
    difficulty: "medium",
    series: "TOEIC AI Practice",
    year: 2026,
    isPublished: true,
  }));

  // 5. Build 1 Full Test demo — mix all parts
  const fullTestDoc = {
    title: "Full Test Demo — TOEIC AI 2026",
    description:
      "Đề thi mô phỏng Full Test bám sát định dạng TOEIC L&R 2018. Lưu ý: đề demo có số câu giảm so với 200 câu chuẩn để phục vụ kiểm thử hệ thống.",
    type: "full",
    part: null,
    questionIds: inserted.map((q) => q._id), // tất cả câu hỏi
    durationMinutes: 120,
    totalQuestions: inserted.length,
    difficulty: "medium",
    series: "TOEIC AI Mock",
    year: 2026,
    isPublished: true,
  };

  const allTests = await Test.insertMany([...practiceTestDocs, fullTestDoc]);
  console.log(`\n✓ Inserted ${allTests.length} tests:`);
  allTests.forEach((t) => {
    console.log(
      `  [${t.type}] ${t.title} (${t.totalQuestions} câu, ${t.durationMinutes} phút)`,
    );
  });

  console.log("\n✅ Seed completed successfully\n");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
