/**
 * Prompt templates và JSON schema cho AI analysis của TOEIC result.
 * Spec gốc: KE_HOACH_DO_AN_TOEIC_AI.md §8.2
 *
 * Phiên bản prompt được track bằng PROMPT_VERSION — bump mỗi khi đổi nội dung
 * để có thể trace lại analysis nào sinh ra từ prompt nào.
 */

export const PROMPT_VERSION = 'v1.0';

const PART_LABELS = {
  part1: 'Part 1 — Mô tả tranh (Listening)',
  part2: 'Part 2 — Hỏi đáp (Listening)',
  part3: 'Part 3 — Đoạn hội thoại (Listening)',
  part4: 'Part 4 — Bài nói ngắn (Listening)',
  part5: 'Part 5 — Hoàn thành câu (Reading)',
  part6: 'Part 6 — Hoàn thành đoạn văn (Reading)',
  part7: 'Part 7 — Đọc hiểu (Reading)',
};

const SYSTEM_PROMPT = `Bạn là một chuyên gia luyện thi TOEIC nhiều năm kinh nghiệm, am hiểu sâu cấu trúc bài thi TOEIC Listening & Reading (200 câu, thang điểm 10-990).

Nhiệm vụ: Dựa trên dữ liệu bài làm của học viên, đưa ra phân tích cá nhân hóa.

Quy tắc:
- Ngôn ngữ trả về: TIẾNG VIỆT, văn phong thân thiện nhưng chuyên nghiệp.
- Mỗi gợi ý phải CỤ THỂ và HÀNH ĐỘNG ĐƯỢC (ví dụ: "Luyện 20 câu Part 5 mỗi ngày tập trung vào thì hiện tại hoàn thành" thay vì "Học ngữ pháp nhiều hơn").
- Đánh giá điểm mạnh/yếu dựa trên tỉ lệ đúng theo Part và so với mục tiêu.
- estimatedTargetWeeks: ước lượng số tuần để đạt mục tiêu nếu duy trì học 5 buổi/tuần, mỗi buổi 60-90 phút. Trả 0 nếu đã đạt mục tiêu.
- Tuyệt đối KHÔNG bịa thông tin về tên đề/năm thi không có trong dữ liệu.
- Trả về JSON đúng schema được cung cấp, không kèm markdown hay text giải thích bên ngoài JSON.`;

/**
 * JSON Schema cho Structured Outputs (response_format).
 * gpt-4o-mini hỗ trợ strict mode từ 2024-08.
 * Strict mode yêu cầu: additionalProperties=false, mọi field đều required.
 */
export const ANALYSIS_JSON_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'toeic_analysis',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        strengths: {
          type: 'array',
          description: '3-5 điểm mạnh cụ thể của học viên, mỗi câu 1 ý.',
          items: { type: 'string' },
        },
        weaknesses: {
          type: 'array',
          description: '3-5 điểm yếu cụ thể, mỗi câu 1 ý.',
          items: { type: 'string' },
        },
        recommendations: {
          type: 'array',
          description: '4-6 gợi ý hành động cụ thể, sắp xếp theo độ ưu tiên.',
          items: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'Chủ đề ngắn (vd: "Part 5 — Ngữ pháp thì").',
              },
              action: {
                type: 'string',
                description: 'Hành động cụ thể, đo lường được.',
              },
              priority: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
              },
            },
            required: ['topic', 'action', 'priority'],
            additionalProperties: false,
          },
        },
        estimatedTargetWeeks: {
          type: 'integer',
          description: 'Số tuần ước lượng để đạt mục tiêu (0 nếu đã đạt).',
          minimum: 0,
          maximum: 52,
        },
      },
      required: ['strengths', 'weaknesses', 'recommendations', 'estimatedTargetWeeks'],
      additionalProperties: false,
    },
  },
};

function formatPartBreakdown(partBreakdown) {
  if (!partBreakdown) return '(không có dữ liệu)';
  return Object.entries(partBreakdown)
    .filter(([, v]) => v && v.total > 0)
    .map(([key, v]) => {
      const pct = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
      return `- ${PART_LABELS[key] || key}: ${v.correct}/${v.total} đúng (${pct}%)`;
    })
    .join('\n');
}

/**
 * Build prompt for OpenAI analysis.
 *
 * @param {Object} params
 * @param {Object} params.result    - Result document (lean)
 * @param {Object} [params.user]    - User document (lean), to get targetScore
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildAnalysisPrompt({ result, user }) {
  const targetScore = user?.targetScore ?? 700;
  const partLines = formatPartBreakdown(result.partBreakdown);

  const scoreLine =
    result.testType === 'full'
      ? `- Điểm tổng: ${result.scoreTotal}/990 (Listening: ${result.scoreListening}/495, Reading: ${result.scoreReading}/495)`
      : `- Tỉ lệ đúng: ${result.accuracy}% (${result.correctCount}/${result.totalQuestions} câu)`;

  const durationMin = Math.round((result.durationSec || 0) / 60);

  const userPrompt = `Dữ liệu bài làm của học viên:

- Loại bài: ${result.testType === 'full' ? 'Full Test (200 câu)' : 'Practice'}
- Mục tiêu điểm TOEIC: ${targetScore}
${scoreLine}
- Thời gian làm bài: ${durationMin} phút

Tỉ lệ đúng theo từng Part:
${partLines}

Yêu cầu phân tích:
1. Liệt kê 3-5 ĐIỂM MẠNH cụ thể của học viên dựa trên dữ liệu trên.
2. Liệt kê 3-5 ĐIỂM YẾU cần cải thiện.
3. Đưa 4-6 GỢI Ý HÀNH ĐỘNG (mỗi gợi ý phải cụ thể, ưu tiên giải quyết điểm yếu trước).
4. Ước lượng SỐ TUẦN cần thiết để đạt mục tiêu ${targetScore} nếu duy trì học đều đặn.

Trả về JSON đúng schema được cung cấp.`;

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
