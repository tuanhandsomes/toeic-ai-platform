/**
 * Prompt templates và JSON schema cho AI analysis của TOEIC result.
 * Spec gốc: KE_HOACH_DO_AN_TOEIC_AI.md §8.2
 *
 * PROMPT_VERSION track mỗi khi đổi nội dung để trace analysis nào từ prompt nào.
 *
 * v1.3 (2026-05-26):
 *   - Loại bỏ topic-specific examples ("văn phòng", "công xưởng") khỏi PART_DETAILS
 *     để AI không parrot vào recommendation
 *   - Thêm score-conditional analysis: điểm cao (≥90%) → KHÔNG bịa weakness, focus
 *     duy trì + đa dạng hóa thay vì kê khai lỗi tưởng tượng
 *   - Schema description cho weaknesses cho phép mảng rỗng
 *
 * v1.4 (2026-05-26):
 *   - Khi điểm cao: BẮT BUỘC strength đầu tiên celebrate kết quả với ngôn từ tích
 *     cực ("xuất sắc", "tuyệt vời", "hoàn hảo")
 *   - Tách recommendation cho Practice vs Full Test khi điểm cao: Practice tập
 *     trung nâng cao TRONG Part đó (tốc độ, dạng khó), KHÔNG ép Full Test cadence
 *     (Full Test 5 lần/tuần là dành cho người đang ôn Full Test, không phải đang
 *     luyện 1 Part)
 *
 * v1.5 (2026-05-31):
 *   - Inject error-level data (errorBreakdown) vào prompt: per-Part liệt kê
 *     subskill tags + difficulty + slow questions của các câu SAI → AI bám sát
 *     lỗi thực tế thay vì khái quát theo % Part
 *   - Thêm field `targetPart` (1-7 hoặc null) vào mỗi recommendation → BE sau đó
 *     map sang Practice test cụ thể để FE render nút "Luyện ngay"
 *   - Hướng dẫn AI gán targetPart cho rec liên quan đến 1 Part cụ thể, và để
 *     null cho rec chiến lược chung (tốc độ, đa dạng đề, Full Test mô phỏng)
 */

export const PROMPT_VERSION = "v1.5";

const PART_LABELS = {
  part1: "Part 1 — Mô tả tranh (Listening)",
  part2: "Part 2 — Hỏi đáp (Listening)",
  part3: "Part 3 — Đoạn hội thoại (Listening)",
  part4: "Part 4 — Bài nói ngắn (Listening)",
  part5: "Part 5 — Hoàn thành câu (Reading)",
  part6: "Part 6 — Hoàn thành đoạn văn (Reading)",
  part7: "Part 7 — Đọc hiểu (Reading)",
};

// Kiến thức CẤU TRÚC + KỸ NĂNG + BẪY về từng Part.
// QUAN TRỌNG: KHÔNG nêu chủ đề cụ thể (văn phòng, công xưởng, ...) ở đây
// để AI không bê nguyên vào output → phải dựa trên dữ liệu thực mà suy luận.
const PART_DETAILS = {
  1: `Part 1 (6 câu, Listening) — Mô tả tranh
- Cấu trúc: 1 ảnh + 4 câu mô tả → chọn câu khớp ảnh.
- Kỹ năng test: nghe đúng động từ (đa số thì hiện tại tiếp diễn V-ing, đôi khi hiện tại đơn hoặc bị động), nhận diện chủ thể (người/vật) + vị trí (giới từ chỉ vị trí: in front of, next to, behind, between, ...).
- Bẫy phổ biến: phát âm tương tự (write/right, copy/coffee, pour/poor), danh từ giống nhau cùng xuất hiện trong ảnh, nhầm thì đang xảy ra vs đã xảy ra (is V-ing vs has been V-ed), bị động (is being V-ed) gây nhầm chủ thể.`,

  2: `Part 2 (25 câu, Listening) — Hỏi đáp ngắn
- Cấu trúc: 1 câu hỏi/tuyên bố + 3 đáp án A/B/C (KHÔNG có D như Part khác).
- Kỹ năng test: phản xạ phân loại 7 dạng (When/Where/Who/Why/How/What + Yes-No/tag/choice), nhận diện câu trả lời gián tiếp ("I'm not sure", "Let me check").
- Bẫy phổ biến: lặp từ từ câu hỏi vào đáp án (repeat trap), đồng âm, đáp án ngữ pháp đúng nhưng sai ngữ cảnh.`,

  3: `Part 3 (39 câu, Listening) — Đoạn hội thoại 2-3 người
- Cấu trúc: 1 đoạn hội thoại + 3 câu hỏi (chủ đề / chi tiết / suy luận hoặc ý đồ người nói).
- Kỹ năng test: nắm chủ đề tổng quát, nghe ra chi tiết (tên riêng, số, ngày giờ), nhận diện vai trò người nói, suy luận từ ngữ điệu/lựa chọn từ.
- Bẫy phổ biến: không kịp đọc câu hỏi trước khi nghe, miss chi tiết vì tập trung quá vào 1 câu, nhầm vai trò 2 speaker giống giọng.`,

  4: `Part 4 (30 câu, Listening) — Bài nói ngắn 1 người
- Cấu trúc: 1 đoạn độc thoại + 3 câu hỏi. Đoạn thuộc 1 trong 5 loại: thông báo (announcement), quảng cáo, hướng dẫn, tin nhắn thoại, giới thiệu/diễn văn.
- Kỹ năng test: nhận diện loại bài nói (giúp dự đoán nội dung), nghe ra mục đích/đối tượng, theo dõi cấu trúc mở-triển-kết.
- Bẫy phổ biến: không nhận diện được loại nên không đoán hướng, miss câu hỏi suy luận mục đích.`,

  5: `Part 5 (30 câu, Reading) — Hoàn thành câu
- Cấu trúc: 1 câu thiếu 1 chỗ + 4 lựa chọn.
- Kỹ năng test: ngữ pháp đơn câu (thì, sự hòa hợp chủ-vị, giới từ, liên từ, mệnh đề quan hệ, parallel structure, word form), từ vựng + collocation.
- Bẫy phổ biến: chọn từ "đẹp nghĩa" nhưng sai word form (chọn "succeed" thay vì "successful"), nhầm giới từ đi với động từ cụ thể, nhầm thì khi câu có trạng từ thời gian.`,

  6: `Part 6 (16 câu, Reading) — Hoàn thành đoạn văn (4 câu/đoạn)
- Cấu trúc: 1 đoạn văn 4 chỗ trống + 4 lựa chọn mỗi chỗ. 3 chỗ về ngữ pháp/từ vựng, 1 chỗ chèn cả câu hợp logic mạch văn.
- Kỹ năng test: ngữ pháp trong NGỮ CẢNH (không phải đơn câu như Part 5), chọn câu chèn phù hợp tone/logic đoạn.
- Bẫy phổ biến: chọn đáp án đúng ngữ pháp nhưng sai logic đoạn, không đọc context xung quanh trước khi chọn từ nối (however/therefore/in addition).`,

  7: `Part 7 (54 câu, Reading) — Đọc hiểu
- Cấu trúc: nhiều đoạn văn (single passage 29 câu + double passage 10 câu + triple passage 15 câu) + 2-5 câu hỏi mỗi đoạn.
- Kỹ năng test: skim/scan tốc độ, paraphrase (đáp án thường paraphrase câu trong bài), suy luận, cross-reference giữa các đoạn (double/triple), quản lý thời gian.
- Bẫy phổ biến: đọc kỹ từng từ thay vì skim → hết giờ ở 30 câu cuối, không cross-reference khi gặp double/triple, nhầm tone của email/article.`,
};

const SYSTEM_PROMPT = `Bạn là CHUYÊN GIA TOEIC L&R với 10+ năm kinh nghiệm luyện thi, từng giúp nhiều học viên đạt 700-900+.

KIẾN THỨC NỀN VỀ TOEIC L&R (200 câu, 120 phút, thang 10-990):
${[1, 2, 3, 4, 5, 6, 7].map((p) => PART_DETAILS[p]).join("\n\n")}

══════════════════════════════════════════════════════════════════
NGUYÊN TẮC PHÂN TÍCH — ĐỌC KỸ VÀ TUÂN THỦ:
══════════════════════════════════════════════════════════════════

1. NGÔN NGỮ: tiếng Việt tự nhiên, văn phong thân thiện-chuyên nghiệp.

2. PHÂN TÍCH PHẢI DỰA TRÊN SỐ LIỆU THỰC TẾ:
   - KHÔNG được bịa Part không có trong dữ liệu.
   - KHÔNG được nêu chủ đề cụ thể (ví dụ "văn phòng", "công xưởng", "du lịch") TRỪ KHI dữ liệu hoặc context có nhắc đến.
   - Các ví dụ ở phần KIẾN THỨC NỀN ở trên là để bạn HIỂU Part, KHÔNG được bê nguyên vào output.

3. KHÔNG BỊA WEAKNESS — CONDITIONAL THEO ĐIỂM:
   - Tỉ lệ ≥ 90%: TRẢ MẢNG weaknesses RỖNG ([]) hoặc tối đa 1-2 ý maintenance kiểu "giữ vững phong độ", "tiếp tục đa dạng dạng bài". KHÔNG vẽ ra điểm yếu tưởng tượng.
   - Tỉ lệ 70-89%: 2-4 weaknesses, nêu kỹ năng thực sự còn yếu dựa trên đặc điểm Part + tỉ lệ sai.
   - Tỉ lệ < 70%: 3-5 weaknesses, focus kỹ năng yếu rõ ràng.

4. RECOMMENDATIONS ĐO LƯỜNG ĐƯỢC:
   - Mỗi ý phải có: ĐỘNG TỪ + SỐ LƯỢNG/THỜI GIAN + PHƯƠNG PHÁP cụ thể.
   - SAI: "Học từ vựng nhiều hơn"
   - ĐÚNG: "Luyện 15 câu Part 5 mỗi ngày, ưu tiên các câu có giới từ + động từ (look at, depend on, agree with) để củng cố collocation."
   - CONDITIONAL theo điểm: tỉ lệ ≥ 90% → recommendations focus vào ĐA DẠNG HÓA (thử nhiều dạng bài, làm Full Test mô phỏng, tăng tốc độ) thay vì drill kỹ năng cơ bản.

5. GẮN RECOMMENDATION VỚI PART CỤ THỂ (targetPart):
   - Nếu recommendation nói về luyện 1 Part cụ thể → đặt targetPart = số Part đó (1-7).
   - Nếu recommendation chiến lược chung (ôn lại cả Listening, làm thêm Full Test, quản lý thời gian, đa dạng đề từ nhiều nguồn) → đặt targetPart = null.
   - Hệ thống dùng targetPart để gắn link tới bài Practice phù hợp — phải gán đúng, KHÔNG được để null khi rec rõ ràng thuộc 1 Part.

6. BÁM SÁT LỖI THỰC TẾ (errorBreakdown):
   - Khi userPrompt có phần CHI TIẾT LỖI TỪNG PART, recommendation và weakness PHẢI tham chiếu các SUBSKILL (tag) + ĐỘ KHÓ thực sự sai, không phán đoán chung chung.
   - Ví dụ tốt: "Trong các câu sai có 3 câu thuộc 'word-form' và 2 câu 'preposition' — luyện thêm 20 câu Part 5 word-form trong 3 ngày tới."
   - Khi không có subskill cụ thể (tags rỗng) → suy luận từ Part + độ khó là chính, không bịa tag.

7. ĐIỂM MẠNH: dựa trên Part có tỉ lệ cao nhất (tương đối hoặc tuyệt đối), gọi tên kỹ năng cụ thể của Part đó (vd: "Phản xạ nhanh với WH-question trong Part 2", "Nhận diện đúng action verb trong Part 1").

8. ĐẦU RA: JSON đúng schema, KHÔNG kèm markdown / text bên ngoài JSON.`;

/**
 * JSON Schema cho Structured Outputs (response_format).
 * Strict mode: additionalProperties=false, mọi field đều required.
 * targetPart dùng type ["integer", "null"] để vừa cho phép null vừa giữ strict.
 */
export const ANALYSIS_JSON_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "toeic_analysis",
    strict: true,
    schema: {
      type: "object",
      properties: {
        strengths: {
          type: "array",
          description:
            "2-5 điểm mạnh CỤ THỂ kèm số liệu, gọi tên kỹ năng của Part. Không khen chung chung.",
          items: { type: "string" },
        },
        weaknesses: {
          type: "array",
          description:
            "Số lượng phụ thuộc điểm: ≥90% trả [] hoặc 1-2 ý maintenance, 70-89% trả 2-4 ý, <70% trả 3-5 ý. TUYỆT ĐỐI KHÔNG bịa weakness khi điểm cao. Khi có errorBreakdown, tham chiếu subskill thực tế.",
          items: { type: "string" },
        },
        recommendations: {
          type: "array",
          description:
            "3-6 gợi ý ĐO LƯỜNG ĐƯỢC. Điểm cao thì ưu tiên đa dạng hóa + Full Test; điểm thấp thì drill kỹ năng yếu. Mỗi rec liên quan 1 Part cụ thể PHẢI có targetPart.",
          items: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description:
                  "Chủ đề ngắn 4-8 từ, gọi tên Part + kỹ năng cụ thể.",
              },
              action: {
                type: "string",
                description:
                  "Hành động ≥20 từ: ĐỘNG TỪ + SỐ LƯỢNG/NGÀY + PHƯƠNG PHÁP cụ thể, bám sát subskill thực tế nếu có.",
              },
              priority: {
                type: "string",
                enum: ["high", "medium", "low"],
              },
              targetPart: {
                type: ["integer", "null"],
                description:
                  "Part mà rec này nhắm tới (1-7). null nếu là rec chiến lược chung (ví dụ làm thêm Full Test, quản lý thời gian, đa dạng đề).",
                minimum: 1,
                maximum: 7,
              },
            },
            required: ["topic", "action", "priority", "targetPart"],
            additionalProperties: false,
          },
        },
        estimatedTargetWeeks: {
          type: "integer",
          description:
            "Chỉ Full Test mới ước lượng số tuần đạt mục tiêu. Practice TRẢ 0.",
          minimum: 0,
          maximum: 52,
        },
      },
      required: [
        "strengths",
        "weaknesses",
        "recommendations",
        "estimatedTargetWeeks",
      ],
      additionalProperties: false,
    },
  },
};

function formatPartBreakdown(partBreakdown) {
  if (!partBreakdown) return "(không có dữ liệu)";
  return Object.entries(partBreakdown)
    .filter(([, v]) => v && v.total > 0)
    .map(([key, v]) => {
      const pct = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
      return `- ${PART_LABELS[key] || key}: ${v.correct}/${v.total} đúng (${pct}%)`;
    })
    .join("\n");
}

function getPartsInResult(partBreakdown) {
  if (!partBreakdown) return [];
  return Object.entries(partBreakdown)
    .filter(([, v]) => v && v.total > 0)
    .map(([key]) => Number(key.replace("part", "")))
    .sort((a, b) => a - b);
}

/**
 * Format errorBreakdown (per-Part wrong-answer patterns) thành text human-readable
 * để inject vào prompt. Shape errorBreakdown[partNum]:
 *   { wrongCount, totalCount, tagCounts: { 'word-form': 3, ... },
 *     difficultyCounts: { easy: 1, medium: 4, hard: 2 },
 *     slowCount: số câu sai có timeSpentSec >= 1.5 * avgTime }
 *
 * Nếu errorBreakdown rỗng hoặc không có Part nào sai → trả empty string.
 */
function formatErrorBreakdown(errorBreakdown) {
  if (!errorBreakdown || Object.keys(errorBreakdown).length === 0) return "";

  const lines = [];
  Object.entries(errorBreakdown)
    .map(([k, v]) => [Number(k), v])
    .filter(([, v]) => v && v.wrongCount > 0)
    .sort(([a], [b]) => a - b)
    .forEach(([partNum, data]) => {
      const partLabel = PART_LABELS[`part${partNum}`] || `Part ${partNum}`;
      const parts = [`${partLabel}: sai ${data.wrongCount}/${data.totalCount} câu`];

      // Difficulty breakdown — nếu có ≥1 mục, in ra
      const diffEntries = Object.entries(data.difficultyCounts || {})
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${n} câu ${k}`);
      if (diffEntries.length > 0) {
        parts.push(`độ khó: ${diffEntries.join(", ")}`);
      }

      // Tag breakdown — top 5 subskill xuất hiện nhiều nhất trong câu sai
      const topTags = Object.entries(data.tagCounts || {})
        .filter(([t]) => !/^part\d+$/.test(t) && !/^(ets|hacker)/i.test(t))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      if (topTags.length > 0) {
        parts.push(
          `subskill thường sai: ${topTags.map(([t, n]) => `${t} (${n})`).join(", ")}`,
        );
      }

      // Slow questions — câu sai mà tiêu tốn thời gian bất thường
      if (data.slowCount > 0) {
        parts.push(`${data.slowCount} câu sai do quá chậm (≥1.5× thời gian TB)`);
      }

      lines.push(`- ${parts.join(" | ")}`);
    });

  if (lines.length === 0) return "";

  return `\nCHI TIẾT LỖI TỪNG PART (bám sát các con số này khi recommend):\n${lines.join("\n")}\n`;
}

// Mức độ điểm → hướng dẫn phân tích phù hợp (tránh bịa weakness khi điểm cao)
function scoreTier(accuracy) {
  if (accuracy === 100) return "perfect";
  if (accuracy >= 90) return "excellent";
  if (accuracy >= 70) return "good";
  return "needs_work";
}

/**
 * Guidance phụ thuộc accuracy + testType (Practice 1 Part vs Full Test).
 * isFull=true → có thể đề xuất Full Test cadence; Practice thì KHÔNG.
 */
function buildScoreGuidance(accuracy, isFull) {
  const tier = scoreTier(accuracy);
  const advancedRecForPractice = `Ưu tiên NÂNG CAO TRONG cùng Part: tăng tốc độ (làm cùng số câu nhưng giảm 20-30% thời gian), thử dạng câu khó hơn (Part này có subtypes nâng cao), kết hợp nghe/đọc thêm tài liệu thật (podcast, business article). Nếu sẵn sàng, có thể THỬ 1 đề Full Test (không phải nhiều lần) để đo tổng thể.`;
  const advancedRecForFull = `Ưu tiên: làm thêm 2-3 đề Full Test mô phỏng để rèn áp lực thời gian, đa dạng đề từ nhiều nguồn (ETS, Hackers, Big Step), đọc thêm tài liệu thật để build tốc độ Reading.`;
  const advancedRec = isFull ? advancedRecForFull : advancedRecForPractice;

  if (tier === "perfect") {
    return `MỨC ĐỘ: HOÀN HẢO (${accuracy}% — đúng tuyệt đối).
- strengths: 3-4 ý. Ý ĐẦU TIÊN BẮT BUỘC chúc mừng kết quả tuyệt đối bằng ngôn từ tích cực (vd: "Chúc mừng đạt điểm tuyệt đối X/Y — kết quả xuất sắc cho thấy bạn đã thành thạo..." hoặc "Hoàn hảo X/Y câu là thành tích ấn tượng — bạn đã nắm vững..."). Các ý sau nêu kỹ năng cụ thể đã làm chủ.
- weaknesses: TRẢ MẢNG RỖNG []. KHÔNG ý nào — học viên đúng hết thì không có lỗi nào để liệt kê.
- recommendations: 2-3 ý (KHÔNG cần 4-6 vì ít việc phải làm). ${advancedRec}`;
  }
  if (tier === "excellent") {
    return `MỨC ĐỘ: XUẤT SẮC (${accuracy}%).
- strengths: 3-4 ý. Ý ĐẦU TIÊN BẮT BUỘC ghi nhận thành tích cao bằng ngôn từ tích cực (vd: "Đạt X/Y câu (${accuracy}%) — kết quả xuất sắc, cho thấy..."). Các ý sau nêu kỹ năng cụ thể đã vững.
- weaknesses: tối đa 1-2 ý forward-looking ("Để chinh phục các đề khó hơn, có thể luyện thêm dạng câu...") HOẶC trả mảng rỗng []. KHÔNG bịa lỗi.
- recommendations: 2-4 ý. ${advancedRec}`;
  }
  if (tier === "good") {
    return `MỨC ĐỘ: KHÁ (${accuracy}%).
- strengths: 2-4 ý dựa trên các câu làm đúng, gọi tên kỹ năng cụ thể của Part.
- weaknesses: 2-4 ý, nêu kỹ năng còn chưa vững dựa trên các câu sai (đối chiếu với BẪY phổ biến của Part + CHI TIẾT LỖI nếu có).
- recommendations: 4-5 ý, cân bằng giữa củng cố điểm yếu + nâng cao tốc độ + đa dạng dạng bài.`;
  }
  return `MỨC ĐỘ: CẦN CẢI THIỆN (${accuracy}%).
- strengths: 2-3 ý — vẫn tìm điểm tích cực (kỹ năng tương đối ổn nhất, sự kiên trì hoàn thành bài), KHÔNG mỉa mai hay tiêu cực.
- weaknesses: 3-5 ý, focus rõ kỹ năng yếu dựa trên đặc điểm Part và bẫy phổ biến + CHI TIẾT LỖI nếu có.
- recommendations: 4-6 ý, drill kỹ năng cụ thể, số lượng ngày/tuần rõ ràng, ưu tiên 'high' cho nội dung yếu nhất.`;
}

/**
 * Build prompt for OpenAI analysis.
 *
 * @param {Object} params
 * @param {Object} params.result          - Result document (lean)
 * @param {Object} [params.user]          - User document (lean), to get targetScore
 * @param {Object} [params.errorBreakdown] - Per-Part wrong-answer patterns (xem
 *   formatErrorBreakdown). Optional — nếu không có, prompt vẫn build OK với
 *   data Part-level cơ bản.
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildAnalysisPrompt({ result, user, errorBreakdown }) {
  const targetScore = user?.targetScore ?? 700;
  const partLines = formatPartBreakdown(result.partBreakdown);
  const errorLines = formatErrorBreakdown(errorBreakdown);
  const durationMin = Math.round((result.durationSec || 0) / 60);
  const isFull = result.testType === "full";

  let userPrompt;
  if (isFull) {
    // Full Test: dùng độ chính xác tổng để xác định tier
    const overallAccuracy =
      result.totalQuestions > 0
        ? Math.round((result.correctCount / result.totalQuestions) * 100)
        : 0;
    const guidance = buildScoreGuidance(overallAccuracy, true);

    userPrompt = `DỮ LIỆU FULL TEST:

- Mục tiêu điểm TOEIC: ${targetScore}
- Điểm tổng: ${result.scoreTotal}/990 (Listening ${result.scoreListening}/495, Reading ${result.scoreReading}/495)
- Tỉ lệ đúng tổng: ${overallAccuracy}% (${result.correctCount}/${result.totalQuestions})
- Thời gian: ${durationMin}/120 phút

TỈ LỆ ĐÚNG TỪNG PART:
${partLines}
${errorLines}
${guidance}

YÊU CẦU PHÂN TÍCH:
1. strengths: dựa trên Part có tỉ lệ cao nhất, gọi tên kỹ năng cụ thể của Part đó.
2. weaknesses: chỉ nêu Part dưới 70% (nếu có); nếu mọi Part ≥ 90% thì trả mảng rỗng. Khi có CHI TIẾT LỖI, tham chiếu subskill thực tế.
3. recommendations: ưu tiên Part đóng góp điểm cao nhất so với mục tiêu ${targetScore} (Part 1-2 mỗi câu ~7-8 điểm; Part 3-4-7 mỗi câu ~5 điểm). Theo guidance ở trên. Gán targetPart cho rec thuộc 1 Part cụ thể, null cho rec chiến lược chung.
4. estimatedTargetWeeks: gap so với ${targetScore}, giả định 5 buổi/tuần × 90 phút. Trả 0 nếu đã đạt.

Trả về JSON đúng schema.`;
  } else {
    // Practice — focus 1 Part. Dùng accuracy của Part đó để xác định tier.
    const parts = getPartsInResult(result.partBreakdown);
    const partNum = parts[0];
    const partName = PART_LABELS[`part${partNum}`] || `Part ${partNum}`;
    const guidance = buildScoreGuidance(result.accuracy, false);

    userPrompt = `DỮ LIỆU PRACTICE — chỉ luyện ${partName}, KHÔNG phải Full Test.

- Mục tiêu điểm TOEIC TỔNG: ${targetScore}
- Tỉ lệ đúng ${partName}: ${result.accuracy}% (${result.correctCount}/${result.totalQuestions} câu)
- Thời gian: ${durationMin} phút
${errorLines}
${guidance}

YÊU CẦU PHÂN TÍCH — TẤT CẢ xoay quanh ${partName}, KHÔNG lan sang Part khác:

1. strengths: gọi tên kỹ năng cụ thể của ${partName} mà học viên đang nắm tốt (dựa trên đặc điểm Part đã liệt kê trong KIẾN THỨC NỀN).

2. weaknesses: TUÂN THỦ guidance ở trên. Nếu ${result.accuracy}% ≥ 90, KHÔNG bịa weakness — trả [] hoặc 1-2 ý "duy trì / sẵn sàng cho Full Test". Khi có CHI TIẾT LỖI, tham chiếu subskill thực tế.

3. recommendations: topic = "Part ${partNum} — [kỹ năng]"; action = ≥20 từ có động từ + số lượng/ngày + phương pháp. Gán targetPart = ${partNum} cho mọi rec luyện thẳng Part đó, null nếu là rec chiến lược (vd thử Full Test).
   - Điểm cao: đa dạng hóa dạng bài + thử Full Test + tăng tốc.
   - Điểm trung bình/thấp: drill kỹ năng yếu, tham chiếu bẫy phổ biến của Part đã liệt kê + CHI TIẾT LỖI nếu có.

4. estimatedTargetWeeks: TRẢ 0.

Trả về JSON đúng schema.`;
  }

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
