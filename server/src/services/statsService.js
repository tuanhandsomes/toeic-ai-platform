import mongoose from "mongoose";
import { Result } from "../models/Result.js";

/**
 * Statistics service — aggregate user's learning progress from Result collection.
 * All methods take userId and return plain objects ready to JSON-serialize.
 * Heavy compute uses MongoDB aggregation pipelines (server-side) to avoid
 * pulling thousands of result docs into Node memory.
 */

const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

function rangeStartDate(range) {
  if (!range || range === "all") return null;
  const days = RANGE_TO_DAYS[range];
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Streak = consecutive days from today (or yesterday if no result today)
 * where the user has at least one result.
 */
function computeStreak(activeDateStrings) {
  if (activeDateStrings.length === 0) return 0;
  const set = new Set(activeDateStrings);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(today);
  // Allow grace: if no result today but yesterday, start counting from yesterday
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(cursor.toISOString().slice(0, 10))) return 0;
  }

  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const statsService = {
  /**
   * Overview KPIs for the Dashboard.
   *
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async overview(userId) {
    // Single aggregation pipeline — one DB roundtrip for all KPIs.
    const [agg] = await Result.aggregate([
      { $match: { userId: toObjectId(userId) } },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                totalFullTests: {
                  $sum: { $cond: [{ $eq: ["$testType", "full"] }, 1, 0] },
                },
                totalPractice: {
                  $sum: { $cond: [{ $eq: ["$testType", "part"] }, 1, 0] },
                },
                totalDurationSec: { $sum: "$durationSec" },
              },
            },
          ],
          fullScores: [
            { $match: { testType: "full", scoreTotal: { $gt: 0 } } },
            { $sort: { createdAt: -1 } },
            {
              $group: {
                _id: null,
                latest: { $first: "$scoreTotal" },
                highest: { $max: "$scoreTotal" },
                average: { $avg: "$scoreTotal" },
              },
            },
          ],
          activeDays: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            { $sort: { _id: -1 } },
          ],
        },
      },
    ]);

    const counts = agg?.counts?.[0] || {};
    const fullScores = agg?.fullScores?.[0] || {};
    const activeDates = (agg?.activeDays || []).map((d) => d._id);

    return {
      totalAttempts: counts.totalAttempts || 0,
      totalFullTests: counts.totalFullTests || 0,
      totalPractice: counts.totalPractice || 0,
      totalDurationSec: counts.totalDurationSec || 0,
      latestFullScore: fullScores.latest ?? null,
      highestFullScore: fullScores.highest ?? null,
      averageFullScore: fullScores.average
        ? Math.round(fullScores.average)
        : null,
      daysActive: activeDates.length,
      currentStreak: computeStreak(activeDates),
    };
  },

  /**
   * Time-series of full-test scores for LineChart.
   *
   * @param {string} userId
   * @param {string} range  '7d' | '30d' | '90d' | 'all'
   */
  async progress(userId, range = "30d") {
    const startDate = rangeStartDate(range);
    const match = {
      userId: toObjectId(userId),
      testType: "full",
      scoreTotal: { $gt: 0 },
    };
    if (startDate) match.createdAt = { $gte: startDate };

    const results = await Result.find(match)
      .populate("testId", "title")
      .sort({ createdAt: 1 })
      .select("createdAt scoreTotal scoreListening scoreReading testId")
      .lean();

    return {
      range,
      series: results.map((r) => ({
        date: r.createdAt.toISOString().slice(0, 10),
        scoreTotal: r.scoreTotal,
        scoreListening: r.scoreListening,
        scoreReading: r.scoreReading,
        testTitle: r.testId?.title || "Unknown",
        resultId: r._id,
      })),
    };
  },

  /**
   * Accuracy per Part across all attempts — for RadarChart.
   *
   * @param {string} userId
   * @param {string} testType  'full' | 'part' | 'all'
   */
  async parts(userId, testType = "all") {
    const match = { userId: toObjectId(userId) };
    if (testType === "full" || testType === "part") match.testType = testType;

    // Sum correct + total across all results, per Part.
    // partBreakdown is an embedded object, so we project each part separately.
    const [agg] = await Result.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          part1Correct: { $sum: "$partBreakdown.part1.correct" },
          part1Total: { $sum: "$partBreakdown.part1.total" },
          part2Correct: { $sum: "$partBreakdown.part2.correct" },
          part2Total: { $sum: "$partBreakdown.part2.total" },
          part3Correct: { $sum: "$partBreakdown.part3.correct" },
          part3Total: { $sum: "$partBreakdown.part3.total" },
          part4Correct: { $sum: "$partBreakdown.part4.correct" },
          part4Total: { $sum: "$partBreakdown.part4.total" },
          part5Correct: { $sum: "$partBreakdown.part5.correct" },
          part5Total: { $sum: "$partBreakdown.part5.total" },
          part6Correct: { $sum: "$partBreakdown.part6.correct" },
          part6Total: { $sum: "$partBreakdown.part6.total" },
          part7Correct: { $sum: "$partBreakdown.part7.correct" },
          part7Total: { $sum: "$partBreakdown.part7.total" },
        },
      },
    ]);

    const sums = agg || {};
    const parts = [1, 2, 3, 4, 5, 6, 7].map((n) => {
      const correct = sums[`part${n}Correct`] || 0;
      const total = sums[`part${n}Total`] || 0;
      return {
        part: n,
        correct,
        total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });

    return { testType, parts };
  },
};

function toObjectId(id) {
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
}
