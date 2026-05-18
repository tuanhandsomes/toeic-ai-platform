import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const vocabSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    meaning: { type: String, required: true },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    part: { type: Number, required: true, min: 1, max: 7, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'photograph',
        'question_response',
        'conversation',
        'talk',
        'incomplete_sentence',
        'text_completion',
        'reading_comprehension',
      ],
    },
    content: {
      text: { type: String, default: '' },
      audioUrl: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      passageId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    },
    // Part 2 has only 3 options (A/B/C), all other parts have 4 (A/B/C/D)
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator(v) {
          if (this.part === 2) return v.length === 3;
          return v.length === 4;
        },
        message: 'Part 2 phải có 3 đáp án (A/B/C), các Part khác phải có 4 (A/B/C/D)',
      },
    },
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    explanation: { type: String, default: '' },
    vocab: { type: [vocabSchema], default: [] },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

questionSchema.index({ part: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

export const Question = mongoose.model('Question', questionSchema);
