/**
 * Cấu trúc TOEIC L&R — câu hỏi đầu tiên của mỗi Part trong đề Full Test.
 * Dùng để compute global question number cho cả Full Test + Practice.
 *
 * Vd: Practice Part 7 có 54 câu hiển thị 147-200 (thay vì 1-54), khớp với
 * số câu hỏi trong đề thi thật.
 */
export const PART_OFFSETS = { 1: 1, 2: 7, 3: 32, 4: 71, 5: 101, 6: 131, 7: 147 };

/**
 * Hướng dẫn ngắn từng Part — render 1 lần ở câu đầu tiên của Part trong test.
 * Dịch tiếng Việt từ directions chuẩn ETS.
 */
export const PART_DIRECTIONS = {
  1: 'Bạn sẽ nghe các câu mô tả về một bức ảnh. Chọn câu mô tả phù hợp nhất với hình ảnh.',
  2: 'Bạn sẽ nghe một câu hỏi/câu nói và 3 phản hồi. Chọn phản hồi phù hợp nhất.',
  3: 'Bạn sẽ nghe các đoạn hội thoại ngắn. Mỗi đoạn hội thoại theo sau bởi 3 câu hỏi.',
  4: 'Bạn sẽ nghe các đoạn nói (thông báo, quảng cáo, bài giảng). Mỗi đoạn theo sau bởi 3 câu hỏi.',
  5: 'Chọn từ/cụm từ thích hợp nhất để hoàn thành câu.',
  6: 'Chọn từ/cụm từ thích hợp nhất cho mỗi chỗ trống trong đoạn văn.',
  7: 'Đọc các đoạn văn (bài báo, email, thông báo, biểu mẫu, tin nhắn) và chọn đáp án đúng nhất.',
};

export const PART_TITLES = {
  1: 'Part 1 — Mô tả tranh',
  2: 'Part 2 — Hỏi đáp',
  3: 'Part 3 — Đoạn hội thoại',
  4: 'Part 4 — Bài nói ngắn',
  5: 'Part 5 — Hoàn thành câu',
  6: 'Part 6 — Hoàn thành đoạn văn',
  7: 'Part 7 — Đọc hiểu',
};

/**
 * Compute mảng global question numbers theo thứ tự câu trong test.
 * Hỗ trợ cả Full Test (questions span all parts) và Practice (1 part duy nhất).
 *
 * Vd: Practice Part 7 với 54 questions → trả về [147, 148, ..., 200]
 *      Full Test với 200 questions → trả về [1, 2, ..., 200]
 */
export function computeGlobalNumbers(questions) {
  const counters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  return questions.map((q) => {
    const num = PART_OFFSETS[q.part] + counters[q.part];
    counters[q.part] += 1;
    return num;
  });
}

/**
 * Parse range câu hỏi từ filename của imageUrl. Hỗ trợ multi-passage (semicolon-joined).
 *
 * "passage-q147-148.PNG" → { type: 'passage', start: 147, end: 148 }
 * "graphic-q62-64.PNG"   → { type: 'graphic', start: 62, end: 64 }
 * "passage-q176-180-a.PNG;...-b.PNG" → { type: 'passage', start: 176, end: 180 }
 */
export function parsePassageRange(imageUrl) {
  if (!imageUrl) return null;
  const firstPath = imageUrl.split(';')[0].trim();
  const filename = firstPath.split('/').pop() || '';
  const m = filename.match(/(passage|graphic)-q(\d+)-(\d+)/);
  if (!m) return null;
  return {
    type: m[1],
    start: parseInt(m[2], 10),
    end: parseInt(m[3], 10),
  };
}

/**
 * Văn bản prompt phía trên ảnh passage/graphic.
 *
 * @param {{ type: string, start: number, end: number }} range
 */
export function buildPassagePrompt(range) {
  if (!range) return null;
  const rangeText = range.start === range.end ? `Câu ${range.start}` : `Câu ${range.start}–${range.end}`;
  if (range.type === 'graphic') {
    return `${rangeText} dựa vào hình ảnh sau:`;
  }
  return `${rangeText} dựa vào đoạn văn sau:`;
}
