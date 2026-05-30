import mongoose from "mongoose";
import { Question } from "../models/Question.js";
import { Test } from "../models/Test.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/**
 * Import a full test bundle (testInfo + 200 questions) in one shot.
 * Creates 200 Question docs + 1 Full Test + 7 Practice Sets (one per Part)
 * sharing the same questionIds. Auto-fills audioUrl/imageUrl using the
 * naming convention so JSON files don't have to enumerate every URL.
 *
 * Mirrors logic from scripts/seedRealTest.js so the seed CLI and the
 * admin UI import endpoint stay in sync.
 */

const PART_TYPE = {
  1: "photograph",
  2: "question_response",
  3: "conversation",
  4: "talk",
  5: "incomplete_sentence",
  6: "text_completion",
  7: "reading_comprehension",
};

const PART_META = {
  1: { name: "Mô tả tranh", duration: 4 },
  2: { name: "Hỏi đáp", duration: 15 },
  3: { name: "Đoạn hội thoại", duration: 24 },
  4: { name: "Bài nói ngắn", duration: 18 },
  5: { name: "Hoàn thành câu", duration: 18 },
  6: { name: "Hoàn thành đoạn", duration: 10 },
  7: { name: "Đọc hiểu", duration: 33 },
};

/**
 * Derive testCode (e.g. "T02") from title "ETS 2026 — Full Test 02" if not
 * provided explicitly in testInfo.
 */
function resolveTestCode(testInfo) {
  if (testInfo.testCode) return testInfo.testCode.toUpperCase();
  const match = testInfo.title?.match(/Test\s+(\d+)/i);
  if (!match) {
    throw ApiError.badRequest(
      'Không xác định được testCode. Thêm field testInfo.testCode (vd "T02") hoặc đặt title theo pattern "... Test 02".',
    );
  }
  return `T${match[1].padStart(2, "0")}`;
}

/** "T02" → "test-02" for folder naming */
function testCodeToFolder(testCode) {
  return `test-${testCode.slice(1).padStart(2, "0")}`;
}

/**
 * Audio URL auto-fill — only for listening parts (1-4).
 * Pattern matches what migrate scripts and Cloudinary uploads expect.
 */
function buildAudioUrl(qNum, testCode, folder) {
  if (qNum >= 1 && qNum <= 31) {
    const padded = String(qNum).padStart(2, "0");
    return `/audio/ets-2026/${folder}/E26-${testCode}-${padded}.mp3`;
  }
  if (qNum >= 32 && qNum <= 70) {
    const groupStart = 32 + Math.floor((qNum - 32) / 3) * 3;
    const groupEnd = groupStart + 2;
    return `/audio/ets-2026/${folder}/E26-${testCode}-${groupStart}-${groupEnd}.mp3`;
  }
  if (qNum >= 71 && qNum <= 100) {
    const groupStart = 71 + Math.floor((qNum - 71) / 3) * 3;
    const groupEnd = groupStart + 2;
    return `/audio/ets-2026/${folder}/E26-${testCode}-${groupStart}-${groupEnd}.mp3`;
  }
  return "";
}

/** Image URL auto-fill ONLY for Part 1 photo. Part 3/4 graphic and Part 6/7 passages must have explicit imageUrl in JSON. */
function buildPart1ImageUrl(qNum, folder) {
  if (qNum >= 1 && qNum <= 6) {
    return `/images/ets-2026/${folder}/${String(qNum).padStart(2, "0")}.PNG`;
  }
  return "";
}

export const testImportService = {
  /**
   * Import a full test bundle.
   *
   * @param {Object} bundle
   * @param {Object} bundle.testInfo - { title, series, year, difficulty, description, testCode? }
   * @param {Array}  bundle.questions - 200 questions matching the seed JSON schema
   * @param {string} createdBy        - admin user _id
   * @returns {Promise<{ test, practiceSets, questionCount }>}
   */
  async importBundle(bundle, createdBy) {
    const { testInfo, questions: rawQuestions } = bundle;
    if (!testInfo?.title) {
      throw ApiError.badRequest("testInfo.title bắt buộc");
    }
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw ApiError.badRequest("questions phải là array có ít nhất 1 phần tử");
    }

    const testCode = resolveTestCode(testInfo);
    const folder = testCodeToFolder(testCode);

    // Refuse to import if a test with the same title already exists — avoids
    // accidental double-insert. Admin must delete old test via UI first.
    const existing = await Test.findOne({ title: testInfo.title });
    if (existing) {
      throw ApiError.conflict(
        `Đề "${testInfo.title}" đã tồn tại trong cơ sở dữ liệu. Xóa đề cũ trước khi import lại.`,
      );
    }

    // ─── 1. Build question docs with auto-filled URLs ────────────────────
    const seriesTag = (testInfo.series || "ets-2026")
      .toLowerCase()
      .replace(/\s+/g, "-");
    const questionsToInsert = rawQuestions.map((q) => {
      const qNum = q.questionNumber;
      return {
        part: q.part,
        type: PART_TYPE[q.part] || "photograph",
        content: {
          text: q.text || "",
          audioUrl:
            q.audioUrl !== undefined
              ? q.audioUrl
              : buildAudioUrl(qNum, testCode, folder),
          imageUrl:
            q.imageUrl !== undefined
              ? q.imageUrl
              : buildPart1ImageUrl(qNum, folder),
          passageId: null,
        },
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        vocab: q.vocab || [],
        difficulty: q.difficulty || "medium",
        tags: Array.from(
          new Set([...(q.tags || []), seriesTag, `part${q.part}`]),
        ),
      };
    });

    // ─── 2. Insert all questions in one batch ────────────────────────────
    const inserted = await Question.insertMany(questionsToInsert, {
      ordered: true,
    });
    logger.info("Test import: questions inserted", {
      count: inserted.length,
      testTitle: testInfo.title,
    });

    // ─── 3. Build ordered ID arrays (full + per-part) ────────────────────
    const ordered = inserted
      .map((q, idx) => ({
        id: q._id,
        num: rawQuestions[idx].questionNumber,
        part: q.part,
      }))
      .sort((a, b) => a.num - b.num);
    const fullIds = ordered.map((x) => x.id);
    const byPart = ordered.reduce((acc, x) => {
      (acc[x.part] ||= []).push(x.id);
      return acc;
    }, {});

    // ─── 4. Create Full Test doc ─────────────────────────────────────────
    const fullTest = await Test.create({
      title: testInfo.title,
      description:
        testInfo.description ||
        `Đề thi TOEIC full ${testInfo.year || ""} — 200 câu, 120 phút.`,
      type: "full",
      part: null,
      questionIds: fullIds,
      durationMinutes: 120,
      totalQuestions: fullIds.length,
      difficulty: testInfo.difficulty || "medium",
      series: testInfo.series || "ETS 2026",
      year: testInfo.year || null,
      isPublished: true,
      createdBy: createdBy ? new mongoose.Types.ObjectId(createdBy) : null,
    });

    // ─── 5. Create 7 Practice Sets sharing the same question IDs ─────────
    const practiceSets = [];
    for (let p = 1; p <= 7; p += 1) {
      const partIds = byPart[p] || [];
      if (partIds.length === 0) continue;
      const practice = await Test.create({
        title: `${testInfo.title} — Part ${p}: ${PART_META[p].name}`,
        description: `Luyện tập riêng Part ${p} từ đề ${testInfo.title}.`,
        type: "part",
        part: p,
        questionIds: partIds,
        durationMinutes: PART_META[p].duration,
        totalQuestions: partIds.length,
        difficulty: testInfo.difficulty || "medium",
        series: testInfo.series || "ETS 2026",
        year: testInfo.year || null,
        isPublished: true,
        createdBy: createdBy ? new mongoose.Types.ObjectId(createdBy) : null,
      });
      practiceSets.push(practice);
    }

    logger.info("Test import complete", {
      testTitle: testInfo.title,
      questionCount: inserted.length,
      practiceCount: practiceSets.length,
    });

    return {
      test: fullTest.toObject(),
      practiceSets: practiceSets.map((p) => p.toObject()),
      questionCount: inserted.length,
    };
  },
};
