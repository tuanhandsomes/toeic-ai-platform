/**
 * Seed 1 đề TOEIC thật từ JSON file.
 *
 * Usage:
 *   node seeds/seedRealTest.js ets-2026-test-01.json
 *
 * Sẽ tạo:
 *   - 200 Question docs
 *   - 1 Test doc (type='full', 200 questionIds)
 *   - 7 Test docs (type='part', mỗi cái filter theo Part 1-7)
 *
 * Format JSON: xem seeds/data/ets-2026-test-01.template.json
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Question } from "../src/models/Question.js";
import { Test } from "../src/models/Test.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Map question number → audio URL theo naming convention của ETS 2026:
 * - Part 1 (1-6): E26-T01-01.mp3 ... E26-T01-06.mp3
 * - Part 2 (7-31): E26-T01-07.mp3 ... E26-T01-31.mp3
 * - Part 3 (32-70): E26-T01-32-34.mp3, 35-37.mp3, ... 68-70.mp3 (13 conversations × 3)
 * - Part 4 (71-100): E26-T01-71-73.mp3, ... 98-100.mp3 (10 talks × 3)
 * - Part 5-7 (101-200): không có audio
 */
function getAudioUrl(qNum, testCode = "T01") {
  if (qNum >= 1 && qNum <= 31) {
    const padded = String(qNum).padStart(2, "0");
    return `/audio/ets-2026/test-01/E26-${testCode}-${padded}.mp3`;
  }
  if (qNum >= 32 && qNum <= 70) {
    const groupStart = 32 + Math.floor((qNum - 32) / 3) * 3;
    const groupEnd = groupStart + 2;
    return `/audio/ets-2026/test-01/E26-${testCode}-${groupStart}-${groupEnd}.mp3`;
  }
  if (qNum >= 71 && qNum <= 100) {
    const groupStart = 71 + Math.floor((qNum - 71) / 3) * 3;
    const groupEnd = groupStart + 2;
    return `/audio/ets-2026/test-01/E26-${testCode}-${groupStart}-${groupEnd}.mp3`;
  }
  return "";
}

function getImageUrl(qNum) {
  // Chỉ Part 1 có image (questions 1-6)
  if (qNum >= 1 && qNum <= 6) {
    return `/images/ets-2026/test-01/${String(qNum).padStart(2, "0")}.PNG`;
  }
  return "";
}

const PART_TYPE = {
  1: "photograph",
  2: "question_response",
  3: "conversation",
  4: "talk",
  5: "incomplete_sentence",
  6: "text_completion",
  7: "reading_comprehension",
};

async function seed(jsonFilename) {
  await connectDB();

  const filePath = path.join(__dirname, "data", jsonFilename);
  if (!fs.existsSync(filePath)) {
    console.error(`✗ File không tồn tại: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const { testInfo, questions: rawQuestions } = data;

  console.log(`\n🌱 Seeding ${testInfo.title}...\n`);

  // 1. Xóa data cũ của test này (nếu seed lại)
  const existingTest = await Test.findOne({ title: testInfo.title });
  if (existingTest) {
    await Question.deleteMany({ _id: { $in: existingTest.questionIds } });
    await Test.deleteMany({
      $or: [
        { title: testInfo.title },
        { title: { $regex: `^${testInfo.title} — Part`, $options: "i" } },
      ],
    });
    console.log(`  Cleared old data of "${testInfo.title}"`);
  }

  // 2. Build questions with auto-computed audioUrl/imageUrl
  const questionsToInsert = rawQuestions.map((q) => {
    const qNum = q.questionNumber;
    return {
      part: q.part,
      type: PART_TYPE[q.part] || "photograph",
      content: {
        text: q.text || "",
        audioUrl: q.audioUrl !== undefined ? q.audioUrl : getAudioUrl(qNum),
        imageUrl: q.imageUrl !== undefined ? q.imageUrl : getImageUrl(qNum),
        passageId: null,
      },
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      vocab: q.vocab || [],
      difficulty: q.difficulty || "medium",
      tags: [
        ...(q.tags || []),
        testInfo.series.toLowerCase().replace(/\s+/g, "-"),
        `part${q.part}`,
      ],
    };
  });

  // 3. Insert all questions
  const inserted = await Question.insertMany(questionsToInsert);
  console.log(`✓ Inserted ${inserted.length} questions`);

  // 4. Group by part
  const byPart = inserted.reduce((acc, q, idx) => {
    acc[q.part] ??= [];
    acc[q.part].push({ _id: q._id, qNum: rawQuestions[idx].questionNumber });
    return acc;
  }, {});

  // Sort each part by original questionNumber to preserve order
  Object.values(byPart).forEach((arr) => arr.sort((a, b) => a.qNum - b.qNum));

  // 5. Create 1 Full Test (200 questions in original order)
  const orderedIds = inserted
    .map((q, idx) => ({ id: q._id, num: rawQuestions[idx].questionNumber }))
    .sort((a, b) => a.num - b.num)
    .map((x) => x.id);

  const fullTest = await Test.create({
    title: testInfo.title,
    description:
      testInfo.description ||
      `Đề thi TOEIC full ${testInfo.year || ""} — 200 câu, 120 phút.`,
    type: "full",
    part: null,
    questionIds: orderedIds,
    durationMinutes: 120,
    totalQuestions: orderedIds.length,
    difficulty: testInfo.difficulty || "medium",
    series: testInfo.series,
    year: testInfo.year,
    isPublished: true,
  });
  console.log(
    `✓ Created Full Test: ${fullTest.title} (${orderedIds.length} câu)`,
  );

  const PART_META = {
    1: { name: "Mô tả tranh", duration: 4 },
    2: { name: "Hỏi đáp", duration: 15 },
    3: { name: "Đoạn hội thoại", duration: 24 },
    4: { name: "Bài nói ngắn", duration: 18 },
    5: { name: "Hoàn thành câu", duration: 18 },
    6: { name: "Hoàn thành đoạn", duration: 10 },
    7: { name: "Đọc hiểu", duration: 33 },
  };

  for (let p = 1; p <= 7; p++) {
    const partQuestions = (byPart[p] || []).map((x) => x._id);
    if (partQuestions.length === 0) continue;

    const practiceTest = await Test.create({
      title: `${testInfo.title} — Part ${p}: ${PART_META[p].name}`,
      description: `Luyện tập riêng Part ${p} từ đề ${testInfo.title}.`,
      type: "part",
      part: p,
      questionIds: partQuestions,
      durationMinutes: PART_META[p].duration,
      totalQuestions: partQuestions.length,
      difficulty: testInfo.difficulty || "medium",
      series: testInfo.series,
      year: testInfo.year,
      isPublished: true,
    });
    console.log(
      `✓ Created Practice: ${practiceTest.title} (${partQuestions.length} câu)`,
    );
  }

  console.log("\n✅ Seed completed successfully\n");
  await mongoose.disconnect();
  process.exit(0);
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node seeds/seedRealTest.js <filename.json>");
  console.error("Example: node seeds/seedRealTest.js ets-2026-test-01.json");
  process.exit(1);
}

seed(arg).catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
