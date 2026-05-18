import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['full', 'part'], required: true, index: true },
    part: { type: Number, min: 1, max: 7, default: null, index: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
    durationMinutes: { type: Number, required: true, min: 1 },
    totalQuestions: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    series: { type: String, default: '', index: true }, // e.g., "ETS 2024", "Hacker TOEIC"
    year: { type: Number, default: null, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

testSchema.index({ type: 1, part: 1, isPublished: 1 });
testSchema.index({ year: 1, series: 1 });

export const Test = mongoose.model('Test', testSchema);
