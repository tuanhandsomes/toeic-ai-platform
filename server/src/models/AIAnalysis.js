import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    action: { type: String, required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  },
  { _id: false },
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Result',
      required: true,
      unique: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    model: { type: String, default: 'gpt-4o-mini' },
    promptVersion: { type: String, default: 'v1.0' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [recommendationSchema], default: [] },
    estimatedTargetWeeks: { type: Number, default: 0 },
    rawResponse: { type: String, default: '' }, // raw JSON từ OpenAI để debug
    tokensUsed: { type: Number, default: 0 },
    isFallback: { type: Boolean, default: false }, // true nếu dùng heuristic thay vì OpenAI
  },
  { timestamps: true },
);

export const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);
