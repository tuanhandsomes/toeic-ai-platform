import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selected: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    isCorrect: { type: Boolean, default: false },
    timeSpentSec: { type: Number, default: 0 },
  },
  { _id: false },
);

const partStatSchema = new mongoose.Schema(
  {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false },
);

const resultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true, index: true },
    testType: { type: String, enum: ['full', 'part'], required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: Date.now },
    durationSec: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
    // Counts
    totalQuestions: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    // Scores (only full-type tests have these populated)
    scoreListening: { type: Number, default: 0 },
    scoreReading: { type: Number, default: 0 },
    scoreTotal: { type: Number, default: 0 },
    // For practice tests, accuracy is the main metric
    accuracy: { type: Number, default: 0 }, // 0-100
    // Breakdown per Part
    partBreakdown: {
      part1: { type: partStatSchema, default: () => ({}) },
      part2: { type: partStatSchema, default: () => ({}) },
      part3: { type: partStatSchema, default: () => ({}) },
      part4: { type: partStatSchema, default: () => ({}) },
      part5: { type: partStatSchema, default: () => ({}) },
      part6: { type: partStatSchema, default: () => ({}) },
      part7: { type: partStatSchema, default: () => ({}) },
    },
  },
  { timestamps: true },
);

resultSchema.index({ userId: 1, createdAt: -1 });
resultSchema.index({ userId: 1, testId: 1, createdAt: -1 });

export const Result = mongoose.model('Result', resultSchema);
