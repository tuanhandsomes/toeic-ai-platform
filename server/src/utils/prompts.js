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
 *
 * v1.6 (2026-06-09):
 *   - Thêm DANH SÁCH CÂU SAI CỤ THỂ: top 15 câu sai informative (số câu toàn cục
 *     1-200, subskill, đáp án người dùng vs đúng, time, stem snippet) → AI có
 *     thể reference "câu 23, 45, 67 đều...". Hết hiện tượng phân tích chung chung.
 *   - Thêm KỸ NĂNG ĐÃ VỮNG (strongPatterns): per-Part top tag user làm đúng
 *     nhiều → strengths nói tên kỹ năng cụ thể (vd "tag-question") thay vì
 *     khen Part chung.
 *   - Full Test prompt thêm phần ƯU TIÊN ĐIỂM ĐỂ ĐẠT MỤC TIÊU: list số câu sai
 *     × points/câu (~5đ) cho mỗi Part → AI biết drill Part nào trước có leverage
 *     cao nhất.
 *   - Schema description ép strengths/weaknesses cite số câu khi có data.
 *
 * v1.6.1 (2026-06-09):
 *   - DANH SÁCH CÂU SAI giờ kèm OPTION TEXT (chọn X="…" vs đúng Y="…") + stem
 *     riêng dòng → AI có data để SUY LUẬN dạng câu khi tag rỗng (ví dụ thấy
 *     "successful" vs "success" → word-form). Rule #7 mở rộng ép AI nhóm
 *     weakness theo DẠNG (không phải Part), với mapping examples để AI biết
 *     suy luận. Cần thiết vì seed data hiện không tag câu hỏi.
 *
 * v1.6.2 (2026-06-10):
 *   - Rule #7 rewrite mạnh hơn: BAN HẲN format "Part X — sai N câu" với block
 *     "FORMAT BỊ CẤM" + "FORMAT BẮT BUỘC" + ví dụ ✅/❌ trực diện. Liệt kê
 *     EXHAUSTIVE 17 dạng câu (Reading + Listening) để AI có thư viện classify
 *     thay vì tự nghĩ ra tên dạng mơ hồ ("khó khăn trong việc hiểu câu hỏi").
 *   - Bump MAX_WRONG_DETAILS 15 → 25 để Full Test nhiều câu sai có đủ data
 *     pattern (trước cap 15 không đủ khi Listening sai 50+ câu).
 *   - Lower temperature 0.4 → 0.2 để AI bám rule kỹ hơn, ít drift.
 */

export const PROMPT_VERSION = "v1.6.2";

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

7. WEAKNESSES PHẢI GROUP THEO DẠNG CÂU — KHÔNG GROUP THEO PART (rule QUAN TRỌNG NHẤT):

   ━━━━━━━ FORMAT BỊ CẤM (TUYỆT ĐỐI KHÔNG VIẾT) ━━━━━━━
   ❌ "Part 1 — sai 4/6 câu: Câu 1 chọn A đúng D..."
   ❌ "Part 2 — sai 19/25 câu: cho thấy khó khăn..."
   ❌ "Part 3 — Đoạn hội thoại (Listening): sai 32/39 câu..."
   ━━━━━━━ FORMAT BẮT BUỘC ━━━━━━━
   ✅ "Dạng [TÊN DẠNG CỤ THỂ] — sai N câu (số X, Y, Z): [insight về sai như thế nào]"

   QUY TRÌNH SUY LUẬN DẠNG (BẮT BUỘC làm cho mỗi câu sai):
   a) Đọc "Chọn X = '...'" vs "Đúng Y = '...'" và stem (nếu có)
   b) Phân loại câu sai vào 1 trong các DẠNG dưới đây dựa trên Part + nội dung options:

   READING:
   - Part 5/6 — word-form: chọn "successful"(adj) khi đúng "success"(noun) | "creation"(noun) khi đúng "create"(verb)
   - Part 5/6 — giới từ: chọn "in" khi đúng "on" | "at" khi đúng "by"
   - Part 5/6 — liên từ logic: chọn "however" khi đúng "therefore" | "although" khi đúng "because"
   - Part 5/6 — thì động từ: chọn "had been" khi đúng "has been" | "will" khi đúng "would"
   - Part 5/6 — đại từ quan hệ: chọn "which" khi đúng "who" | "that" khi đúng "whose"
   - Part 5/6 — sự hòa hợp chủ-vị: chọn "is" khi đúng "are" | "have" khi đúng "has"
   - Part 5/6 — collocation/từ vựng: chọn "do business" khi đúng "make business" | từ đồng nghĩa sai ngữ cảnh
   - Part 6 — chèn câu logic mạch văn: chọn câu đúng ngữ pháp nhưng lạc tone đoạn
   - Part 7 — paraphrase: chọn từ lặp trong câu hỏi/đoạn thay vì đáp án paraphrase
   - Part 7 — suy luận chủ ý: chọn chi tiết hiển ngôn thay vì ý gián tiếp
   - Part 7 — cross-reference (double/triple): chọn đáp án chỉ dùng 1 đoạn khi cần kết hợp 2-3 đoạn

   LISTENING (chỉ có option text, không có stem — vẫn phân loại được dựa trên Part + options):
   - Part 1 — nhận diện hành động (action verb): chọn động từ khác hành động thực (vd "fixing" thay vì "drinking")
   - Part 1 — nhận diện chủ thể/vị trí: chọn câu nhầm người/vật hoặc vị trí (in front of vs next to)
   - Part 1 — bẫy thì/bị động: chọn "is being V-ed" gây nhầm chủ động/bị động
   - Part 2 — repeat trap: chọn đáp án lặp từ từ câu hỏi (vd câu hỏi "meeting?" chọn đáp án có "meeting")
   - Part 2 — sai loại câu hỏi: nhầm WH (When/Where/Why) → trả lời Yes/No
   - Part 2 — bỏ lỡ câu trả lời gián tiếp ("I'm not sure", "Let me check")
   - Part 3/4 — detail (chi tiết tên/số/ngày): bỏ lỡ thông tin cụ thể
   - Part 3/4 — gist (chủ đề/mục đích): không nắm được ý chính
   - Part 3/4 — intent/inference (suy luận ý người nói): chọn nghĩa đen thay vì ý gián tiếp

   c) NHÓM các câu sai có cùng dạng vào CHUNG 1 weakness. Ví dụ:
      ✅ "Dạng word-form — sai 5 câu (số 105, 118, 123, 134, 141): bạn thường chọn dạng tính từ trong khi vị trí cần danh từ, vd câu 105 chọn 'successful' đáng lý 'success'."
      ✅ "Dạng nhận diện hành động Part 1 — sai 4 câu (số 1, 3, 5, 6): bạn chọn động từ khác với hành động thực trong tranh, vd câu 1 chọn 'rolling up sleeves' khi đáp án đúng là 'drinking from a mug'."
      ✅ "Dạng repeat trap Part 2 — sai 8 câu (số 7, 12, 15, 19, 22, 24, 27, 30): bạn chọn đáp án có từ lặp lại từ câu hỏi — đây là bẫy phổ biến nhất Part 2."

   d) BẮT BUỘC: khi có ≥4 câu sai, weaknesses phải có ít nhất 2-3 ý theo format DẠNG ở trên. KHÔNG được mở đầu weakness bằng "Part X —". KHÔNG được viết weakness chỉ liệt kê 1 câu lẻ.

   e) Recommendations phải bám DẠNG nêu trong weaknesses: "Drill 30 câu dạng word-form trong 3 ngày, lấy câu 105/118/123 làm template ôn lại quy tắc loại từ (suffix -tion = noun, -ful = adj, -ly = adv)."

8. STRENGTHS — cite tên kỹ năng cụ thể (KHÔNG khen Part chung):
   - Khi có KỸ NĂNG ĐÃ VỮNG: cite trực tiếp (vd "Tag question — đúng 4/4 câu").
   - Khi không có: SUY LUẬN strength từ Part có % cao + các câu đúng, format vẫn theo DẠNG (vd "Nhận diện action verb Part 1 — đúng 5/6 câu" thay vì "Part 1 — đúng 5/6 câu").

9. ĐẦU RA: JSON đúng schema, KHÔNG kèm markdown / text bên ngoài JSON.`;

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
            "2-5 điểm mạnh CỤ THỂ kèm số liệu, gọi tên kỹ năng của Part. Không khen chung chung. Khi có KỸ NĂNG ĐÃ VỮNG, ít nhất 1 ý phải cite subskill cụ thể từ data (vd 'Tag question Part 2 — đúng 4/4 câu').",
          items: { type: "string" },
        },
        weaknesses: {
          type: "array",
          description:
            "Số lượng phụ thuộc điểm: ≥90% trả [] hoặc 1-2 ý maintenance, 70-89% trả 2-4 ý, <70% trả 3-5 ý. TUYỆT ĐỐI KHÔNG bịa weakness khi điểm cao. Khi có DANH SÁCH CÂU SAI CỤ THỂ + ≥4 câu sai, NHÓM weakness THEO DẠNG CÂU (suy luận từ so sánh chọn vs đúng), KHÔNG theo Part. Mỗi ý format: 'Dạng [tên dạng] — sai N câu (số ...): [insight cụ thể]'. Khi có errorBreakdown, tham chiếu subskill thực tế.",
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

/**
 * Format danh sách câu sai cụ thể (top informative) thành text. Mỗi entry hiển
 * thị đầy đủ stem + option text user chọn + option text đúng → AI nhìn vào sự
 * khác biệt giữa 2 lựa chọn để TỰ SUY LUẬN dạng câu (word-form, giới từ, paraphrase,
 * v.v.) khi tag rỗng. Ví dụ thấy "chọn 'successful' (adj), đúng 'success' (noun)"
 * → AI biết đây là dạng word-form.
 *
 * Format mỗi câu:
 *   - Câu 105 [Part 5, hard, 32s] sai
 *     Stem: "The new manager will be ___ for the marketing team."
 *     Chọn B: "successful" | Đúng C: "successfully"
 */
function formatWrongQuestions(wrongQuestionDetails) {
  if (!wrongQuestionDetails?.length) return "";

  const lines = wrongQuestionDetails.map((d) => {
    const flags = [`Part ${d.part}`, d.difficulty];
    if (d.isSlow) flags.push("chậm");
    if (d.timeSpentSec) flags.push(`${d.timeSpentSec}s`);
    const tag = d.primaryTag ? ` | tag: ${d.primaryTag}` : "";

    const selectedLabel = d.selected
      ? `Chọn ${d.selected}${d.selectedText ? `: "${d.selectedText}"` : ""}`
      : "Bỏ trống";
    const correctLabel = `Đúng ${d.correct}${d.correctText ? `: "${d.correctText}"` : ""}`;

    const stemLine = d.stemSnippet ? `\n    Stem: "${d.stemSnippet}"` : "";

    return `- Câu ${d.globalNum} [${flags.join(", ")}]${tag}${stemLine}\n    ${selectedLabel} | ${correctLabel}`;
  });

  return `\nDANH SÁCH CÂU SAI CỤ THỂ (top ${wrongQuestionDetails.length} — so sánh đáp án chọn vs đúng để SUY LUẬN dạng câu, cite số câu trong weaknesses/recommendations):\n${lines.join("\n")}\n`;
}

/**
 * Format kỹ năng (subskill tag) user đã làm đúng nhiều lần per Part:
 *   - Part 5: word-form (đúng 6 câu), preposition (đúng 4 câu)
 *
 * Để AI cite tên subskill cụ thể trong strengths thay vì khen Part chung.
 */
function formatStrongPatterns(strongPatterns) {
  if (!strongPatterns || Object.keys(strongPatterns).length === 0) return "";

  const lines = Object.entries(strongPatterns)
    .map(([p, tags]) => [Number(p), tags])
    .sort(([a], [b]) => a - b)
    .map(([p, tags]) => {
      const partLabel = PART_LABELS[`part${p}`] || `Part ${p}`;
      const items = tags.map((t) => `${t.tag} (đúng ${t.count} câu)`).join(", ");
      return `- ${partLabel}: ${items}`;
    });

  if (lines.length === 0) return "";

  return `\nKỸ NĂNG ĐÃ VỮNG (subskill làm đúng nhiều lần — cite tên cụ thể trong strengths):\n${lines.join("\n")}\n`;
}

/**
 * Ước lượng điểm có thể giành lại nếu drill từng Part. Mỗi câu TOEIC ≈ 5 điểm
 * (495/100 cho mỗi kỹ năng L+R; sai số do bảng quy đổi non-linear chấp nhận
 * được). Mục đích: cho AI nhận diện Part nào leverage cao nhất khi gap còn xa
 * mục tiêu — không phải cứ Part yếu nhất % là ưu tiên drill trước.
 *
 * Chỉ dùng cho Full Test.
 */
function formatScoringLeverage(partBreakdown) {
  if (!partBreakdown) return "";
  const rows = Object.entries(partBreakdown)
    .map(([k, v]) => [Number(k.replace("part", "")), v])
    .filter(([, v]) => v && v.total > 0 && v.correct < v.total)
    .map(([p, v]) => {
      const wrong = v.total - v.correct;
      const lostPoints = wrong * 5;
      return { p, wrong, lostPoints, partLabel: PART_LABELS[`part${p}`] };
    })
    .sort((a, b) => b.lostPoints - a.lostPoints);

  if (rows.length === 0) return "";

  const lines = rows.map(
    (r) => `- ${r.partLabel}: sai ${r.wrong} câu ≈ mất ${r.lostPoints} điểm`,
  );

  return `\nƯU TIÊN ĐIỂM ĐỂ ĐẠT MỤC TIÊU (sắp theo điểm có thể giành lại, ước lượng 5đ/câu):\n${lines.join("\n")}\nDrill Part có lostPoints lớn nhất trước sẽ tăng tổng điểm nhanh hơn — KHÔNG nhất thiết là Part có % thấp nhất.\n`;
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
 * @param {Array}  [params.wrongQuestionDetails] - Top câu sai informative (số
 *   toàn cục, subskill, selected vs correct, time, stem snippet). Để AI cite
 *   số câu cụ thể trong weaknesses/recommendations.
 * @param {Object} [params.strongPatterns] - Per-Part top subskill làm đúng
 *   nhiều, để strengths cite tên subskill cụ thể.
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildAnalysisPrompt({
  result,
  user,
  errorBreakdown,
  wrongQuestionDetails,
  strongPatterns,
}) {
  const targetScore = user?.targetScore ?? 700;
  const partLines = formatPartBreakdown(result.partBreakdown);
  const errorLines = formatErrorBreakdown(errorBreakdown);
  const wrongDetailLines = formatWrongQuestions(wrongQuestionDetails);
  const strongLines = formatStrongPatterns(strongPatterns);
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
    const leverageLines = formatScoringLeverage(result.partBreakdown);
    const gap = Math.max(0, targetScore - (result.scoreTotal || 0));

    userPrompt = `DỮ LIỆU FULL TEST:

- Mục tiêu điểm TOEIC: ${targetScore} (gap còn ${gap} điểm)
- Điểm tổng: ${result.scoreTotal}/990 (Listening ${result.scoreListening}/495, Reading ${result.scoreReading}/495)
- Tỉ lệ đúng tổng: ${overallAccuracy}% (${result.correctCount}/${result.totalQuestions})
- Thời gian: ${durationMin}/120 phút

TỈ LỆ ĐÚNG TỪNG PART:
${partLines}
${errorLines}${leverageLines}${strongLines}${wrongDetailLines}
${guidance}

YÊU CẦU PHÂN TÍCH:
1. strengths: ưu tiên cite subskill cụ thể từ KỸ NĂNG ĐÃ VỮNG (nếu có). Nếu không có, gọi tên kỹ năng của Part có tỉ lệ cao nhất.
2. weaknesses: chỉ nêu Part dưới 70% (nếu có); nếu mọi Part ≥ 90% thì trả mảng rỗng. Khi có DANH SÁCH CÂU SAI CỤ THỂ, ít nhất 2 weakness PHẢI cite số câu cụ thể (vd "Câu 23, 45, 67 đều là word-form — bạn chọn B trong khi đúng D"). Khi có CHI TIẾT LỖI, tham chiếu subskill thực tế.
3. recommendations: dùng ƯU TIÊN ĐIỂM ĐỂ ĐẠT MỤC TIÊU làm ưu tiên — Part nào mất nhiều điểm nhất drill trước (không phải Part % thấp nhất). Mỗi câu ≈ 5đ. Theo guidance ở trên. Gán targetPart cho rec thuộc 1 Part cụ thể, null cho rec chiến lược chung. Khi đề xuất drill, cite số câu trong bài này làm ví dụ ("lấy câu 23/45/67 làm template").
4. estimatedTargetWeeks: gap còn ${gap} điểm, giả định 5 buổi/tuần × 90 phút (mỗi tuần lên ~40-60 điểm). Trả 0 nếu đã đạt.

Trả về JSON đúng schema.`;
  } else {
    // Practice — focus 1 Part. Dùng accuracy của Part đó để xác định tier.
    const parts = getPartsInResult(result.partBreakdown);
    const partNum = parts[0];
    const partName = PART_LABELS[`part${partNum}`] || `Part ${partNum}`;
    const guidance = buildScoreGuidance(result.accuracy, false);
    const wrongCount = result.totalQuestions - result.correctCount;

    userPrompt = `DỮ LIỆU PRACTICE — chỉ luyện ${partName}, KHÔNG phải Full Test.

- Mục tiêu điểm TOEIC TỔNG: ${targetScore}
- Tỉ lệ đúng ${partName}: ${result.accuracy}% (${result.correctCount}/${result.totalQuestions} câu, sai ${wrongCount} câu)
- Thời gian: ${durationMin} phút
${errorLines}${strongLines}${wrongDetailLines}
${guidance}

YÊU CẦU PHÂN TÍCH — TẤT CẢ xoay quanh ${partName}, KHÔNG lan sang Part khác:

1. strengths: ưu tiên cite subskill cụ thể từ KỸ NĂNG ĐÃ VỮNG. Nếu không có, gọi tên kỹ năng của ${partName} mà học viên đang nắm tốt (dựa trên đặc điểm Part đã liệt kê trong KIẾN THỨC NỀN).

2. weaknesses: TUÂN THỦ guidance ở trên. Nếu ${result.accuracy}% ≥ 90, KHÔNG bịa weakness — trả [] hoặc 1-2 ý "duy trì / sẵn sàng cho Full Test". Khi có DANH SÁCH CÂU SAI CỤ THỂ, ít nhất 2 weakness PHẢI gọi tên số câu cụ thể (vd "Câu 105, 118 đều mắc bẫy ___ — bạn chọn X trong khi đúng Y"). Khi có CHI TIẾT LỖI, tham chiếu subskill thực tế.

3. recommendations: topic = "Part ${partNum} — [kỹ năng]"; action = ≥20 từ có động từ + số lượng/ngày + phương pháp. Gán targetPart = ${partNum} cho mọi rec luyện thẳng Part đó, null nếu là rec chiến lược (vd thử Full Test).
   - Bám sát subskill thực tế: nếu CHI TIẾT LỖI cho thấy "3 câu word-form + 2 câu preposition" thì rec phải đề xuất cụ thể số câu drill từng subskill (vd "Tuần 1: 30 câu word-form, Tuần 2: 20 câu preposition").
   - Cite số câu trong bài làm template khi có DANH SÁCH CÂU SAI (vd "Xem lại câu 105 trong bài này để hiểu pattern").
   - Điểm cao: đa dạng hóa dạng bài + thử Full Test + tăng tốc.
   - Điểm trung bình/thấp: drill kỹ năng yếu cụ thể với số ngày + số câu/ngày rõ ràng.

4. estimatedTargetWeeks: TRẢ 0.

Trả về JSON đúng schema.`;
  }

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
