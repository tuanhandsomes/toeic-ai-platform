/**
 * Sample TOEIC questions for seeding.
 *
 * IMPORTANT: All questions are ORIGINAL, written in TOEIC L&R format
 * but NOT copied from real ETS materials (copyright). This is for
 * graduation thesis demo purposes only.
 *
 * Distribution:
 *   Part 1 (Photographs):           10 câu
 *   Part 2 (Question-Response):     15 câu (3 options A/B/C only!)
 *   Part 3 (Conversations):         12 câu (4 conversations × 3 questions)
 *   Part 4 (Talks):                  9 câu (3 talks × 3 questions)
 *   Part 5 (Incomplete Sentences):  20 câu
 *   Part 6 (Text Completion):        8 câu (2 passages × 4 blanks)
 *   Part 7 (Reading Comprehension): 12 câu (mix of single passages)
 *   ─────────────────────────────────────
 *   TOTAL:                          86 câu
 */

// Sample audio/image URLs use placeholders. Real seed should host on Cloudinary.
const PLACEHOLDER_AUDIO = 'https://placehold.co/audio/sample.mp3';
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/png?text=TOEIC+Part+1';

// ============================================================
// PART 1 — PHOTOGRAPHS (10 questions, 4 options A/B/C/D)
// ============================================================
const part1Questions = [
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'A man is typing on a laptop.' },
      { key: 'B', text: 'A woman is making a phone call.' },
      { key: 'C', text: 'Two people are shaking hands.' },
      { key: 'D', text: 'The office is empty.' },
    ],
    correctAnswer: 'C',
    explanation: 'Hình ảnh mô tả hai người đang bắt tay nhau trong cuộc gặp công việc. Các đáp án khác không khớp với hành động trong tranh.',
    difficulty: 'easy',
    tags: ['part1', 'people-action', 'business'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'Books are stacked on the shelf.' },
      { key: 'B', text: 'A librarian is helping a customer.' },
      { key: 'C', text: 'The shelf is empty.' },
      { key: 'D', text: 'Books are scattered on the floor.' },
    ],
    correctAnswer: 'A',
    explanation: 'Đáp án A mô tả trạng thái sách được xếp ngay ngắn trên kệ. Đây là dạng object-state phổ biến ở Part 1.',
    difficulty: 'easy',
    tags: ['part1', 'object-state'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'They are boarding a train.' },
      { key: 'B', text: 'They are waiting on the platform.' },
      { key: 'C', text: 'They are buying tickets.' },
      { key: 'D', text: 'They are leaving the station.' },
    ],
    correctAnswer: 'B',
    explanation: 'Hành khách đứng trên sân ga chờ tàu. Chú ý phân biệt "boarding" (đang lên tàu) và "waiting" (đang đợi).',
    difficulty: 'medium',
    tags: ['part1', 'people-location', 'travel'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'A chef is preparing a meal.' },
      { key: 'B', text: 'Customers are ordering food.' },
      { key: 'C', text: 'A waiter is serving drinks.' },
      { key: 'D', text: 'The restaurant is closed.' },
    ],
    correctAnswer: 'A',
    explanation: 'Bếp trưởng đang chế biến món ăn trong nhà bếp. Hành động "preparing a meal" là điểm nhận diện chính.',
    difficulty: 'easy',
    tags: ['part1', 'people-action', 'restaurant'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'Cars are parked along the street.' },
      { key: 'B', text: 'A traffic jam is forming.' },
      { key: 'C', text: 'The road is being repaired.' },
      { key: 'D', text: 'A man is washing his car.' },
    ],
    correctAnswer: 'A',
    explanation: 'Mô tả trạng thái xe đỗ dọc đường. Lưu ý "parked" (đã đỗ - trạng thái tĩnh) khác với "parking" (đang đỗ - hành động).',
    difficulty: 'medium',
    tags: ['part1', 'object-state', 'street'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'A woman is presenting to a group.' },
      { key: 'B', text: 'People are listening to music.' },
      { key: 'C', text: 'The room is being decorated.' },
      { key: 'D', text: 'Everyone is taking notes.' },
    ],
    correctAnswer: 'A',
    explanation: 'Một phụ nữ đang thuyết trình trước một nhóm khán giả. Bối cảnh phòng họp văn phòng.',
    difficulty: 'easy',
    tags: ['part1', 'people-action', 'business', 'presentation'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'The mountains are covered with snow.' },
      { key: 'B', text: 'People are hiking up a trail.' },
      { key: 'C', text: 'A river runs through the valley.' },
      { key: 'D', text: 'Trees are being cut down.' },
    ],
    correctAnswer: 'A',
    explanation: 'Mô tả phong cảnh — núi tuyết phủ. Đây là dạng "scenery" ít phổ biến ở Part 1.',
    difficulty: 'medium',
    tags: ['part1', 'scenery', 'nature'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'A doctor is examining a patient.' },
      { key: 'B', text: 'Nurses are reviewing charts.' },
      { key: 'C', text: 'The hospital is being cleaned.' },
      { key: 'D', text: 'Medicine is being prepared.' },
    ],
    correctAnswer: 'A',
    explanation: 'Bác sĩ đang khám bệnh nhân. Bối cảnh y tế.',
    difficulty: 'easy',
    tags: ['part1', 'people-action', 'health'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'A clerk is checking inventory.' },
      { key: 'B', text: 'Customers are paying at the register.' },
      { key: 'C', text: 'Items are displayed on shelves.' },
      { key: 'D', text: 'The store is being renovated.' },
    ],
    correctAnswer: 'C',
    explanation: 'Mô tả vị trí các mặt hàng trên kệ trưng bày. Object-location.',
    difficulty: 'easy',
    tags: ['part1', 'object-location', 'shopping'],
  },
  {
    part: 1,
    type: 'photograph',
    content: { audioUrl: PLACEHOLDER_AUDIO, imageUrl: PLACEHOLDER_IMAGE },
    options: [
      { key: 'A', text: 'Workers are loading a truck.' },
      { key: 'B', text: 'A package is being delivered.' },
      { key: 'C', text: 'Boxes are stacked in a warehouse.' },
      { key: 'D', text: 'The shipment is delayed.' },
    ],
    correctAnswer: 'C',
    explanation: 'Hộp được xếp chồng trong kho. Lưu ý "stacked" — trạng thái xếp chồng.',
    difficulty: 'medium',
    tags: ['part1', 'object-state', 'logistics'],
  },
];

// ============================================================
// PART 2 — QUESTION-RESPONSE (15 questions, ONLY 3 options A/B/C!)
// ============================================================
const part2Questions = [
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Where is the meeting taking place?' },
    options: [
      { key: 'A', text: 'In the conference room on the third floor.' },
      { key: 'B', text: 'It started at 9 o\'clock.' },
      { key: 'C', text: 'Yes, I attended yesterday.' },
    ],
    correctAnswer: 'A',
    explanation: 'Câu hỏi WH- "Where" yêu cầu trả lời địa điểm. Đáp án B trả lời thời gian, C không liên quan.',
    difficulty: 'easy',
    tags: ['part2', 'wh-where', 'business'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'When will the report be finished?' },
    options: [
      { key: 'A', text: 'By the marketing team.' },
      { key: 'B', text: 'By the end of this week.' },
      { key: 'C', text: 'It was very detailed.' },
    ],
    correctAnswer: 'B',
    explanation: '"When" hỏi thời gian → "By the end of this week" phù hợp. A trả lời "by whom", C trả lời chất lượng.',
    difficulty: 'easy',
    tags: ['part2', 'wh-when', 'business'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Have you submitted the budget proposal yet?' },
    options: [
      { key: 'A', text: 'Yes, I sent it this morning.' },
      { key: 'B', text: 'The proposal is on my desk.' },
      { key: 'C', text: 'No, I don\'t know him.' },
    ],
    correctAnswer: 'A',
    explanation: 'Câu hỏi Yes/No (Have you...) trả lời trực tiếp Yes/No + bổ sung. C không liên quan, B không trả lời câu hỏi.',
    difficulty: 'medium',
    tags: ['part2', 'yes-no'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'You\'re leading the project, aren\'t you?' },
    options: [
      { key: 'A', text: 'Yes, starting next month.' },
      { key: 'B', text: 'The leader is Mr. Tanaka.' },
      { key: 'C', text: 'I haven\'t been there.' },
    ],
    correctAnswer: 'A',
    explanation: 'Tag question xác nhận thông tin. Trả lời Yes + bổ sung là phù hợp.',
    difficulty: 'medium',
    tags: ['part2', 'tag-question'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Should we order coffee or tea for the meeting?' },
    options: [
      { key: 'A', text: 'The meeting is at 2 PM.' },
      { key: 'B', text: 'Coffee, please. Most people prefer it.' },
      { key: 'C', text: 'I had breakfast already.' },
    ],
    correctAnswer: 'B',
    explanation: 'Choice question — chọn 1 trong 2 + lý do. A trả lời thời gian, C không liên quan.',
    difficulty: 'easy',
    tags: ['part2', 'choice-question'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Who is in charge of the new training program?' },
    options: [
      { key: 'A', text: 'It starts next Monday.' },
      { key: 'B', text: 'Ms. Pham from HR.' },
      { key: 'C', text: 'Yes, I signed up.' },
    ],
    correctAnswer: 'B',
    explanation: '"Who" hỏi người → "Ms. Pham from HR" phù hợp.',
    difficulty: 'easy',
    tags: ['part2', 'wh-who', 'hr'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Why was the flight delayed?' },
    options: [
      { key: 'A', text: 'Because of bad weather.' },
      { key: 'B', text: 'For three hours.' },
      { key: 'C', text: 'To New York.' },
    ],
    correctAnswer: 'A',
    explanation: '"Why" yêu cầu lý do → "Because of bad weather". B trả lời thời lượng, C trả lời địa điểm.',
    difficulty: 'easy',
    tags: ['part2', 'wh-why', 'travel'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'How long does the warranty last?' },
    options: [
      { key: 'A', text: 'It costs about $200.' },
      { key: 'B', text: 'Two years from the purchase date.' },
      { key: 'C', text: 'At any authorized store.' },
    ],
    correctAnswer: 'B',
    explanation: '"How long" hỏi thời lượng → "Two years..." phù hợp.',
    difficulty: 'medium',
    tags: ['part2', 'wh-how', 'product'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Could you tell me where the printer is?' },
    options: [
      { key: 'A', text: 'I printed the document already.' },
      { key: 'B', text: 'It\'s in the corner, next to the copier.' },
      { key: 'C', text: 'Yes, I can.' },
    ],
    correctAnswer: 'B',
    explanation: 'Indirect question hỏi địa điểm. Mặc dù hình thức Yes/No, nội dung là WH- "where".',
    difficulty: 'medium',
    tags: ['part2', 'indirect-question'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'I think we should hire more staff.' },
    options: [
      { key: 'A', text: 'That\'s a good idea, but we need to check the budget.' },
      { key: 'B', text: 'They were hired last month.' },
      { key: 'C', text: 'Yes, please staff the office.' },
    ],
    correctAnswer: 'A',
    explanation: 'Statement → phản hồi với ý kiến hợp lý. A đồng tình kèm điều kiện.',
    difficulty: 'medium',
    tags: ['part2', 'statement', 'hr'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Did you receive my email yesterday?' },
    options: [
      { key: 'A', text: 'Let me check my inbox.' },
      { key: 'B', text: 'The mail is on the table.' },
      { key: 'C', text: 'Yes, I sent it.' },
    ],
    correctAnswer: 'A',
    explanation: 'Đáp án "Let me check" là dạng trả lời "I don\'t know yet" rất phổ biến và thường đúng.',
    difficulty: 'medium',
    tags: ['part2', 'yes-no', 'indirect-answer'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Where can I find the contract?' },
    options: [
      { key: 'A', text: 'It\'s a 5-year agreement.' },
      { key: 'B', text: 'In the file cabinet near the window.' },
      { key: 'C', text: 'Yes, I signed it.' },
    ],
    correctAnswer: 'B',
    explanation: '"Where" → trả lời địa điểm cụ thể.',
    difficulty: 'easy',
    tags: ['part2', 'wh-where', 'legal'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'How was your business trip?' },
    options: [
      { key: 'A', text: 'I went to Tokyo.' },
      { key: 'B', text: 'It was productive — we signed two new clients.' },
      { key: 'C', text: 'For five days.' },
    ],
    correctAnswer: 'B',
    explanation: '"How was" hỏi đánh giá. A trả lời địa điểm, C trả lời thời lượng.',
    difficulty: 'medium',
    tags: ['part2', 'wh-how', 'business-travel'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Are you coming to the company picnic on Saturday?' },
    options: [
      { key: 'A', text: 'The park is beautiful.' },
      { key: 'B', text: 'I\'m not sure yet, I might be out of town.' },
      { key: 'C', text: 'It was held last year.' },
    ],
    correctAnswer: 'B',
    explanation: 'Câu trả lời "không chắc + lý do" là dạng indirect-answer rất phổ biến.',
    difficulty: 'medium',
    tags: ['part2', 'yes-no', 'social'],
  },
  {
    part: 2,
    type: 'question_response',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Whose laptop is this?' },
    options: [
      { key: 'A', text: 'I bought it last week.' },
      { key: 'B', text: 'I think it belongs to Mr. Nguyen.' },
      { key: 'C', text: 'It\'s a Dell, I believe.' },
    ],
    correctAnswer: 'B',
    explanation: '"Whose" hỏi sở hữu → "belongs to Mr. Nguyen". A nói về sở hữu của người trả lời, C nói về thương hiệu.',
    difficulty: 'easy',
    tags: ['part2', 'wh-whose'],
  },
];

// ============================================================
// PART 3 — CONVERSATIONS (12 questions = 4 conversations × 3 questions)
// ============================================================
const part3Questions = [
  // Conversation 1: Restaurant reservation
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about restaurant reservation' },
    options: [
      { key: 'A', text: 'Booking a restaurant table' },
      { key: 'B', text: 'Ordering food delivery' },
      { key: 'C', text: 'Complaining about service' },
      { key: 'D', text: 'Requesting a refund' },
    ],
    correctAnswer: 'A',
    explanation: 'Câu hỏi main idea — cuộc hội thoại xoay quanh việc đặt bàn tại nhà hàng.',
    difficulty: 'easy',
    tags: ['part3', 'main-idea', 'restaurant'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about restaurant reservation' },
    options: [
      { key: 'A', text: '6:00 PM' },
      { key: 'B', text: '7:30 PM' },
      { key: 'C', text: '8:00 PM' },
      { key: 'D', text: '8:30 PM' },
    ],
    correctAnswer: 'B',
    explanation: 'Detail question — họ chốt giờ đặt bàn là 7:30 PM.',
    difficulty: 'medium',
    tags: ['part3', 'detail', 'restaurant'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about restaurant reservation' },
    options: [
      { key: 'A', text: 'Confirm the reservation by phone' },
      { key: 'B', text: 'Send an email with details' },
      { key: 'C', text: 'Visit the restaurant in person' },
      { key: 'D', text: 'Cancel the booking' },
    ],
    correctAnswer: 'A',
    explanation: 'Future action — người phụ nữ sẽ gọi điện xác nhận đặt bàn.',
    difficulty: 'medium',
    tags: ['part3', 'future-action', 'restaurant'],
  },
  // Conversation 2: Office IT issue
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about office IT issue' },
    options: [
      { key: 'A', text: 'In a hospital' },
      { key: 'B', text: 'At a hotel reception' },
      { key: 'C', text: 'In an office IT department' },
      { key: 'D', text: 'At an electronics store' },
    ],
    correctAnswer: 'C',
    explanation: 'Bối cảnh IT department dựa trên ngữ cảnh báo cáo sự cố mạng nội bộ.',
    difficulty: 'medium',
    tags: ['part3', 'location', 'office', 'it'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about office IT issue' },
    options: [
      { key: 'A', text: 'His computer is not connecting to the network' },
      { key: 'B', text: 'He forgot his password' },
      { key: 'C', text: 'His monitor is broken' },
      { key: 'D', text: 'He cannot print documents' },
    ],
    correctAnswer: 'A',
    explanation: 'Vấn đề chính: máy tính không kết nối mạng nội bộ.',
    difficulty: 'medium',
    tags: ['part3', 'detail', 'it'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about office IT issue' },
    options: [
      { key: 'A', text: 'Restart his computer' },
      { key: 'B', text: 'Submit a ticket through the IT portal' },
      { key: 'C', text: 'Buy a new laptop' },
      { key: 'D', text: 'Work from home today' },
    ],
    correctAnswer: 'B',
    explanation: 'IT staff khuyên submit ticket qua portal để track sự cố.',
    difficulty: 'medium',
    tags: ['part3', 'suggestion', 'it'],
  },
  // Conversation 3: Hotel check-in
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about hotel check-in' },
    options: [
      { key: 'A', text: 'Booking a flight' },
      { key: 'B', text: 'Hotel check-in process' },
      { key: 'C', text: 'Renting a car' },
      { key: 'D', text: 'Asking for directions' },
    ],
    correctAnswer: 'B',
    explanation: 'Khách đang làm thủ tục check-in khách sạn.',
    difficulty: 'easy',
    tags: ['part3', 'main-idea', 'hotel', 'travel'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about hotel check-in' },
    options: [
      { key: 'A', text: 'Standard room' },
      { key: 'B', text: 'Deluxe room with city view' },
      { key: 'C', text: 'Family suite' },
      { key: 'D', text: 'Presidential suite' },
    ],
    correctAnswer: 'B',
    explanation: 'Khách yêu cầu nâng hạng lên Deluxe city view.',
    difficulty: 'medium',
    tags: ['part3', 'detail', 'hotel'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about hotel check-in' },
    options: [
      { key: 'A', text: 'Free breakfast included' },
      { key: 'B', text: 'Late check-out approved' },
      { key: 'C', text: 'Both A and B' },
      { key: 'D', text: 'Only spa access' },
    ],
    correctAnswer: 'C',
    explanation: 'Lễ tân xác nhận cả breakfast miễn phí lẫn late check-out.',
    difficulty: 'hard',
    tags: ['part3', 'detail', 'inference', 'hotel'],
  },
  // Conversation 4: Project deadline
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about project deadline' },
    options: [
      { key: 'A', text: 'Project deadline extension' },
      { key: 'B', text: 'Team building event' },
      { key: 'C', text: 'Annual budget review' },
      { key: 'D', text: 'New employee onboarding' },
    ],
    correctAnswer: 'A',
    explanation: 'Hai đồng nghiệp bàn về việc deadline dự án bị kéo dài.',
    difficulty: 'easy',
    tags: ['part3', 'main-idea', 'business'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about project deadline' },
    options: [
      { key: 'A', text: 'Two days' },
      { key: 'B', text: 'One week' },
      { key: 'C', text: 'Two weeks' },
      { key: 'D', text: 'One month' },
    ],
    correctAnswer: 'C',
    explanation: 'Deadline được dời thêm 2 tuần.',
    difficulty: 'medium',
    tags: ['part3', 'detail', 'business'],
  },
  {
    part: 3, type: 'conversation',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Conversation about project deadline' },
    options: [
      { key: 'A', text: 'She is relieved' },
      { key: 'B', text: 'She is frustrated' },
      { key: 'C', text: 'She is indifferent' },
      { key: 'D', text: 'She is overwhelmed' },
    ],
    correctAnswer: 'A',
    explanation: 'Inference — qua ngữ điệu và phản hồi tích cực, người phụ nữ tỏ ra nhẹ nhõm vì có thêm thời gian.',
    difficulty: 'hard',
    tags: ['part3', 'inference', 'tone'],
  },
];

// ============================================================
// PART 4 — TALKS (9 questions = 3 talks × 3 questions)
// ============================================================
const part4Questions = [
  // Talk 1: Airport announcement
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Airport announcement about flight delay' },
    options: [
      { key: 'A', text: 'Boarding announcement' },
      { key: 'B', text: 'Flight delay notification' },
      { key: 'C', text: 'Lost luggage report' },
      { key: 'D', text: 'Security check warning' },
    ],
    correctAnswer: 'B',
    explanation: 'Thông báo chính: chuyến bay bị hoãn do thời tiết.',
    difficulty: 'easy',
    tags: ['part4', 'main-idea', 'announcement', 'travel'],
  },
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Airport announcement about flight delay' },
    options: [
      { key: 'A', text: '30 minutes' },
      { key: 'B', text: '1 hour' },
      { key: 'C', text: '2 hours' },
      { key: 'D', text: '3 hours' },
    ],
    correctAnswer: 'C',
    explanation: 'Chuyến bay sẽ hoãn 2 tiếng theo thông báo.',
    difficulty: 'medium',
    tags: ['part4', 'detail', 'travel'],
  },
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Airport announcement about flight delay' },
    options: [
      { key: 'A', text: 'Wait at the gate' },
      { key: 'B', text: 'Collect meal vouchers at counter B12' },
      { key: 'C', text: 'Rebook a different flight' },
      { key: 'D', text: 'Contact the airline by phone' },
    ],
    correctAnswer: 'B',
    explanation: 'Hành khách được hướng dẫn nhận phiếu ăn tại counter B12.',
    difficulty: 'medium',
    tags: ['part4', 'detail', 'travel'],
  },
  // Talk 2: Company announcement
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Company announcement about new policy' },
    options: [
      { key: 'A', text: 'Annual leave policy update' },
      { key: 'B', text: 'Hybrid work arrangement' },
      { key: 'C', text: 'Salary increase' },
      { key: 'D', text: 'Office relocation' },
    ],
    correctAnswer: 'B',
    explanation: 'Thông báo về chính sách làm việc kết hợp (hybrid).',
    difficulty: 'easy',
    tags: ['part4', 'main-idea', 'announcement', 'business'],
  },
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Company announcement about new policy' },
    options: [
      { key: 'A', text: 'Mondays only' },
      { key: 'B', text: 'Three days a week' },
      { key: 'C', text: 'Whenever they want' },
      { key: 'D', text: 'Every other week' },
    ],
    correctAnswer: 'B',
    explanation: 'Nhân viên được làm từ nhà 3 ngày/tuần theo chính sách mới.',
    difficulty: 'medium',
    tags: ['part4', 'detail', 'business'],
  },
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Company announcement about new policy' },
    options: [
      { key: 'A', text: 'Next Monday' },
      { key: 'B', text: 'In two weeks' },
      { key: 'C', text: 'At the start of next month' },
      { key: 'D', text: 'Immediately' },
    ],
    correctAnswer: 'C',
    explanation: 'Chính sách bắt đầu áp dụng từ đầu tháng sau.',
    difficulty: 'medium',
    tags: ['part4', 'detail', 'time'],
  },
  // Talk 3: Product launch
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Product launch presentation' },
    options: [
      { key: 'A', text: 'Smartphone' },
      { key: 'B', text: 'Wireless earbuds' },
      { key: 'C', text: 'Smart watch' },
      { key: 'D', text: 'Laptop computer' },
    ],
    correctAnswer: 'C',
    explanation: 'Sản phẩm ra mắt là đồng hồ thông minh.',
    difficulty: 'easy',
    tags: ['part4', 'main-idea', 'product'],
  },
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Product launch presentation' },
    options: [
      { key: 'A', text: 'Heart rate monitoring' },
      { key: 'B', text: '7-day battery life' },
      { key: 'C', text: 'Water resistance' },
      { key: 'D', text: 'All of the above' },
    ],
    correctAnswer: 'D',
    explanation: 'Sản phẩm có cả 3 tính năng được liệt kê.',
    difficulty: 'medium',
    tags: ['part4', 'detail', 'product'],
  },
  {
    part: 4, type: 'talk',
    content: { audioUrl: PLACEHOLDER_AUDIO, text: 'Product launch presentation' },
    options: [
      { key: 'A', text: 'Online only' },
      { key: 'B', text: 'In stores starting next week' },
      { key: 'C', text: 'Pre-order opens today' },
      { key: 'D', text: 'Limited edition for members' },
    ],
    correctAnswer: 'C',
    explanation: 'Diễn giả kết thúc với thông báo pre-order mở hôm nay.',
    difficulty: 'medium',
    tags: ['part4', 'detail', 'product'],
  },
];

// ============================================================
// PART 5 — INCOMPLETE SENTENCES (20 questions, 4 options A/B/C/D)
// ============================================================
const part5Questions = [
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The marketing team _____ a new strategy by the end of next quarter.' },
    options: [
      { key: 'A', text: 'develops' },
      { key: 'B', text: 'will develop' },
      { key: 'C', text: 'developed' },
      { key: 'D', text: 'has developed' },
    ],
    correctAnswer: 'B',
    explanation: '"By the end of next quarter" → thì tương lai. "Will develop" là đáp án đúng.',
    vocab: [
      { word: 'strategy', meaning: 'chiến lược' },
      { word: 'quarter', meaning: 'quý (3 tháng)' },
    ],
    difficulty: 'easy',
    tags: ['part5', 'verb-tense', 'future'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The conference will be held _____ the Grand Ballroom on the 5th floor.' },
    options: [
      { key: 'A', text: 'at' },
      { key: 'B', text: 'on' },
      { key: 'C', text: 'in' },
      { key: 'D', text: 'by' },
    ],
    correctAnswer: 'C',
    explanation: '"In the Grand Ballroom" — dùng "in" cho không gian kín bên trong.',
    difficulty: 'medium',
    tags: ['part5', 'preposition'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'Mr. Tanaka is a highly _____ engineer with over 15 years of experience.' },
    options: [
      { key: 'A', text: 'skill' },
      { key: 'B', text: 'skilled' },
      { key: 'C', text: 'skillfully' },
      { key: 'D', text: 'skilling' },
    ],
    correctAnswer: 'B',
    explanation: 'Cần tính từ bổ nghĩa cho "engineer" → "skilled".',
    difficulty: 'easy',
    tags: ['part5', 'word-form'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: '_____ the report was thoroughly reviewed, no errors were found.' },
    options: [
      { key: 'A', text: 'Although' },
      { key: 'B', text: 'Because' },
      { key: 'C', text: 'Despite' },
      { key: 'D', text: 'However' },
    ],
    correctAnswer: 'A',
    explanation: 'Quan hệ tương phản giữa 2 mệnh đề → "Although" (mặc dù).',
    difficulty: 'medium',
    tags: ['part5', 'conjunction'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'All employees must complete the safety training _____ their first week.' },
    options: [
      { key: 'A', text: 'while' },
      { key: 'B', text: 'during' },
      { key: 'C', text: 'between' },
      { key: 'D', text: 'among' },
    ],
    correctAnswer: 'B',
    explanation: '"During + danh từ chỉ thời gian" → đúng. "While + mệnh đề" → loại.',
    difficulty: 'medium',
    tags: ['part5', 'preposition'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The new policy will be _____ effective starting January 1st.' },
    options: [
      { key: 'A', text: 'office' },
      { key: 'B', text: 'official' },
      { key: 'C', text: 'officially' },
      { key: 'D', text: 'officialize' },
    ],
    correctAnswer: 'C',
    explanation: 'Cần trạng từ bổ nghĩa cho "effective" → "officially".',
    difficulty: 'medium',
    tags: ['part5', 'word-form'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The product was so popular that it sold out _____ less than a week.' },
    options: [
      { key: 'A', text: 'within' },
      { key: 'B', text: 'until' },
      { key: 'C', text: 'over' },
      { key: 'D', text: 'past' },
    ],
    correctAnswer: 'A',
    explanation: '"Within less than a week" — "within" diễn tả trong khoảng thời gian.',
    difficulty: 'medium',
    tags: ['part5', 'preposition'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'Each department head _____ responsible for submitting monthly reports.' },
    options: [
      { key: 'A', text: 'are' },
      { key: 'B', text: 'is' },
      { key: 'C', text: 'were' },
      { key: 'D', text: 'have been' },
    ],
    correctAnswer: 'B',
    explanation: '"Each" + danh từ số ít → động từ số ít "is".',
    difficulty: 'medium',
    tags: ['part5', 'subject-verb-agreement'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The CEO emphasized the _____ of meeting deadlines in her speech.' },
    options: [
      { key: 'A', text: 'important' },
      { key: 'B', text: 'importantly' },
      { key: 'C', text: 'importance' },
      { key: 'D', text: 'imported' },
    ],
    correctAnswer: 'C',
    explanation: 'Sau "the" cần danh từ → "importance".',
    difficulty: 'easy',
    tags: ['part5', 'word-form'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'Our team has _____ exceeded the sales target for three consecutive months.' },
    options: [
      { key: 'A', text: 'consistent' },
      { key: 'B', text: 'consistency' },
      { key: 'C', text: 'consistently' },
      { key: 'D', text: 'consist' },
    ],
    correctAnswer: 'C',
    explanation: 'Bổ nghĩa cho "exceeded" cần trạng từ → "consistently".',
    difficulty: 'medium',
    tags: ['part5', 'word-form'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The meeting has been _____ to next Friday due to scheduling conflicts.' },
    options: [
      { key: 'A', text: 'postponed' },
      { key: 'B', text: 'canceled' },
      { key: 'C', text: 'attended' },
      { key: 'D', text: 'announced' },
    ],
    correctAnswer: 'A',
    explanation: '"Postponed" (hoãn) phù hợp ngữ cảnh "to next Friday".',
    vocab: [
      { word: 'postpone', meaning: 'hoãn lại' },
      { word: 'scheduling conflict', meaning: 'xung đột lịch trình' },
    ],
    difficulty: 'easy',
    tags: ['part5', 'vocabulary', 'business'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'Please submit your expense report _____ the end of this month.' },
    options: [
      { key: 'A', text: 'by' },
      { key: 'B', text: 'until' },
      { key: 'C', text: 'on' },
      { key: 'D', text: 'within' },
    ],
    correctAnswer: 'A',
    explanation: '"By the end of..." (hoàn thành trước thời điểm) — đúng. "Until" mang ý "cho đến lúc đó vẫn đang".',
    difficulty: 'hard',
    tags: ['part5', 'preposition', 'by-vs-until'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The renovation project is expected to _____ approximately six months.' },
    options: [
      { key: 'A', text: 'last' },
      { key: 'B', text: 'lasting' },
      { key: 'C', text: 'lasted' },
      { key: 'D', text: 'lastly' },
    ],
    correctAnswer: 'A',
    explanation: 'Sau "to" cần động từ nguyên mẫu → "last" (kéo dài).',
    difficulty: 'medium',
    tags: ['part5', 'verb-form'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The proposal _____ by the board last week was unanimously approved.' },
    options: [
      { key: 'A', text: 'submit' },
      { key: 'B', text: 'submitted' },
      { key: 'C', text: 'submitting' },
      { key: 'D', text: 'submits' },
    ],
    correctAnswer: 'B',
    explanation: 'Mệnh đề rút gọn quá khứ phân từ (passive) → "submitted".',
    difficulty: 'hard',
    tags: ['part5', 'participle', 'passive'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'Customers can return items _____ they keep the original receipt.' },
    options: [
      { key: 'A', text: 'although' },
      { key: 'B', text: 'as long as' },
      { key: 'C', text: 'in spite of' },
      { key: 'D', text: 'because of' },
    ],
    correctAnswer: 'B',
    explanation: '"As long as" (miễn là, với điều kiện) — điều kiện cần để return.',
    difficulty: 'medium',
    tags: ['part5', 'conjunction'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The new software _____ employees to track their projects more efficiently.' },
    options: [
      { key: 'A', text: 'allows' },
      { key: 'B', text: 'makes' },
      { key: 'C', text: 'lets' },
      { key: 'D', text: 'forces' },
    ],
    correctAnswer: 'A',
    explanation: '"Allow + O + to V" — cấu trúc cho phép. "Make/let" + O + V (nguyên mẫu không to).',
    difficulty: 'medium',
    tags: ['part5', 'verb-pattern'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The accounting department will review _____ expenses before approving the budget.' },
    options: [
      { key: 'A', text: 'each' },
      { key: 'B', text: 'all' },
      { key: 'C', text: 'every' },
      { key: 'D', text: 'whole' },
    ],
    correctAnswer: 'B',
    explanation: '"All + danh từ số nhiều" → "all expenses". "Each/every" + số ít.',
    difficulty: 'medium',
    tags: ['part5', 'determiner'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The customer service team responds to inquiries _____ than ever before.' },
    options: [
      { key: 'A', text: 'fast' },
      { key: 'B', text: 'faster' },
      { key: 'C', text: 'fastest' },
      { key: 'D', text: 'as fast' },
    ],
    correctAnswer: 'B',
    explanation: 'Cấu trúc so sánh hơn "than" → "faster than".',
    difficulty: 'easy',
    tags: ['part5', 'comparison'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'Please contact Mr. Lee _____ you have any questions about the contract.' },
    options: [
      { key: 'A', text: 'unless' },
      { key: 'B', text: 'if' },
      { key: 'C', text: 'whether' },
      { key: 'D', text: 'while' },
    ],
    correctAnswer: 'B',
    explanation: 'Câu điều kiện thông thường → "if".',
    difficulty: 'easy',
    tags: ['part5', 'conjunction', 'conditional'],
  },
  {
    part: 5, type: 'incomplete_sentence',
    content: { text: 'The CEO\'s annual letter _____ shareholders was published yesterday.' },
    options: [
      { key: 'A', text: 'to' },
      { key: 'B', text: 'at' },
      { key: 'C', text: 'with' },
      { key: 'D', text: 'for' },
    ],
    correctAnswer: 'A',
    explanation: '"Letter to + người nhận" — collocation chuẩn.',
    difficulty: 'medium',
    tags: ['part5', 'preposition', 'collocation'],
  },
];

// ============================================================
// PART 6 — TEXT COMPLETION (8 questions = 2 passages × 4 blanks)
// ============================================================
const part6Questions = [
  // Passage 1: Email about training
  {
    part: 6, type: 'text_completion',
    content: {
      text: 'Email from HR: "Dear team, we are pleased to announce a new training program _____ (1) will start next month. The program _____ (2) cover essential skills including time management and communication. _____ (3). Please register by Friday."',
    },
    options: [
      { key: 'A', text: 'who' },
      { key: 'B', text: 'which' },
      { key: 'C', text: 'where' },
      { key: 'D', text: 'when' },
    ],
    correctAnswer: 'B',
    explanation: 'Mệnh đề quan hệ thay cho "training program" (vật) → "which".',
    difficulty: 'medium',
    tags: ['part6', 'relative-clause'],
  },
  {
    part: 6, type: 'text_completion',
    content: { text: 'Email from HR (blank 2)' },
    options: [
      { key: 'A', text: 'will' },
      { key: 'B', text: 'would' },
      { key: 'C', text: 'has' },
      { key: 'D', text: 'is' },
    ],
    correctAnswer: 'A',
    explanation: 'Tương lai "will start" ở câu trước → "will cover" tiếp tục.',
    difficulty: 'easy',
    tags: ['part6', 'verb-tense'],
  },
  {
    part: 6, type: 'text_completion',
    content: { text: 'Email from HR (blank 3 — sentence insertion)' },
    options: [
      { key: 'A', text: 'All sessions will be held online via Zoom.' },
      { key: 'B', text: 'The cafeteria has been renovated.' },
      { key: 'C', text: 'Our company was founded in 1995.' },
      { key: 'D', text: 'Please confirm your dietary preferences.' },
    ],
    correctAnswer: 'A',
    explanation: 'Sentence insertion — câu A phù hợp ngữ cảnh chương trình training. Các câu khác không liên quan.',
    difficulty: 'hard',
    tags: ['part6', 'sentence-insertion'],
  },
  {
    part: 6, type: 'text_completion',
    content: { text: 'Email from HR (blank 4)' },
    options: [
      { key: 'A', text: 'register' },
      { key: 'B', text: 'registered' },
      { key: 'C', text: 'registering' },
      { key: 'D', text: 'registration' },
    ],
    correctAnswer: 'A',
    explanation: 'Câu mệnh lệnh "Please + V (nguyên mẫu)" → "register".',
    difficulty: 'easy',
    tags: ['part6', 'verb-form'],
  },
  // Passage 2: Notice about office renovation
  {
    part: 6, type: 'text_completion',
    content: {
      text: 'Office Notice: "The 3rd floor will be _____ (1) for renovation starting Monday. _____ (2) inconvenience. All meetings _____ (3) to the 5th floor. _____ (4)."',
    },
    options: [
      { key: 'A', text: 'open' },
      { key: 'B', text: 'closed' },
      { key: 'C', text: 'expanded' },
      { key: 'D', text: 'available' },
    ],
    correctAnswer: 'B',
    explanation: 'Renovation → đóng cửa → "closed".',
    difficulty: 'easy',
    tags: ['part6', 'vocabulary'],
  },
  {
    part: 6, type: 'text_completion',
    content: { text: 'Office Notice (blank 2)' },
    options: [
      { key: 'A', text: 'We regret any' },
      { key: 'B', text: 'We celebrate any' },
      { key: 'C', text: 'We require any' },
      { key: 'D', text: 'We provide any' },
    ],
    correctAnswer: 'A',
    explanation: 'Câu xin lỗi gây bất tiện trong thông báo công sở: "We regret any inconvenience".',
    difficulty: 'medium',
    tags: ['part6', 'business-phrase'],
  },
  {
    part: 6, type: 'text_completion',
    content: { text: 'Office Notice (blank 3)' },
    options: [
      { key: 'A', text: 'have moved' },
      { key: 'B', text: 'will be moved' },
      { key: 'C', text: 'moving' },
      { key: 'D', text: 'move' },
    ],
    correctAnswer: 'B',
    explanation: 'Passive future — meetings sẽ được dời (do người khác làm).',
    difficulty: 'medium',
    tags: ['part6', 'verb-tense', 'passive'],
  },
  {
    part: 6, type: 'text_completion',
    content: { text: 'Office Notice (blank 4 — sentence insertion)' },
    options: [
      { key: 'A', text: 'Thank you for your cooperation.' },
      { key: 'B', text: 'Please submit your tax returns.' },
      { key: 'C', text: 'The annual gala is next month.' },
      { key: 'D', text: 'Our products are on sale.' },
    ],
    correctAnswer: 'A',
    explanation: 'Sentence insertion — câu cảm ơn kết thúc thông báo, phù hợp ngữ cảnh.',
    difficulty: 'medium',
    tags: ['part6', 'sentence-insertion', 'business-phrase'],
  },
];

// ============================================================
// PART 7 — READING COMPREHENSION (12 questions across single passages)
// ============================================================
const part7Questions = [
  // Passage 1: Job advertisement (3 questions)
  {
    part: 7, type: 'reading_comprehension',
    content: {
      text: `Job Posting — Marketing Manager

ABC Tech is seeking an experienced Marketing Manager to join our growing team. The successful candidate will lead a team of 5 marketing specialists, develop quarterly marketing strategies, and report directly to the VP of Marketing.

Requirements:
- Bachelor's degree in Marketing, Business, or related field
- Minimum 5 years of experience in B2B marketing
- Strong analytical skills and proficiency in marketing automation tools
- Excellent written and verbal communication in English

We offer competitive salary ($80,000-$100,000), comprehensive health benefits, and flexible work-from-home options. Interested candidates should send their resume and cover letter to careers@abctech.com by March 31.`,
    },
    options: [
      { key: 'A', text: 'To announce a job opening' },
      { key: 'B', text: 'To promote a new product' },
      { key: 'C', text: 'To request investor funding' },
      { key: 'D', text: 'To report quarterly earnings' },
    ],
    correctAnswer: 'A',
    explanation: 'Purpose question — bài viết là job posting tuyển dụng Marketing Manager.',
    difficulty: 'easy',
    tags: ['part7', 'purpose', 'job-ad'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'Job Posting — Marketing Manager (question 2)' },
    options: [
      { key: 'A', text: '3 years' },
      { key: 'B', text: '5 years' },
      { key: 'C', text: '7 years' },
      { key: 'D', text: '10 years' },
    ],
    correctAnswer: 'B',
    explanation: 'Detail question — yêu cầu tối thiểu 5 năm kinh nghiệm B2B marketing.',
    difficulty: 'easy',
    tags: ['part7', 'detail'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'Job Posting — Marketing Manager (question 3)' },
    options: [
      { key: 'A', text: 'The candidate must relocate to the office' },
      { key: 'B', text: 'Flexible work arrangements are available' },
      { key: 'C', text: 'The salary is fixed at $80,000' },
      { key: 'D', text: 'No degree is required' },
    ],
    correctAnswer: 'B',
    explanation: 'Inference — "flexible work-from-home options" → arrangement linh hoạt được cung cấp.',
    difficulty: 'medium',
    tags: ['part7', 'inference'],
  },
  // Passage 2: Email correspondence (3 questions)
  {
    part: 7, type: 'reading_comprehension',
    content: {
      text: `From: Sarah Park <sarah.park@globalcorp.com>
To: Engineering Team
Subject: System Maintenance Notification
Date: October 15

Dear team,

Please be informed that we will be conducting system maintenance on our main servers this Saturday, October 18, from 11:00 PM to 4:00 AM (Sunday). During this period, all internal systems including email, file servers, and project management tools will be UNAVAILABLE.

Please plan accordingly and save any critical work before 10:00 PM on Saturday. The maintenance team has confirmed that there will be no impact on customer-facing services.

If you have urgent concerns, please contact me at extension 4521.

Best regards,
Sarah Park
IT Operations Manager`,
    },
    options: [
      { key: 'A', text: 'A new software update' },
      { key: 'B', text: 'A system maintenance schedule' },
      { key: 'C', text: 'A security incident' },
      { key: 'D', text: 'A team meeting' },
    ],
    correctAnswer: 'B',
    explanation: 'Main topic — email thông báo lịch bảo trì hệ thống.',
    difficulty: 'easy',
    tags: ['part7', 'main-idea', 'email'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'System Maintenance Email (question 2)' },
    options: [
      { key: 'A', text: '10:00 PM Saturday' },
      { key: 'B', text: '11:00 PM Saturday' },
      { key: 'C', text: '4:00 AM Sunday' },
      { key: 'D', text: '5 hours total' },
    ],
    correctAnswer: 'B',
    explanation: 'Detail — bảo trì bắt đầu 11:00 PM thứ Bảy.',
    difficulty: 'medium',
    tags: ['part7', 'detail'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'System Maintenance Email (question 3)' },
    options: [
      { key: 'A', text: 'Customer-facing services will be unavailable' },
      { key: 'B', text: 'Engineers need to come into the office' },
      { key: 'C', text: 'Internal email will be down during maintenance' },
      { key: 'D', text: 'The maintenance will take a full day' },
    ],
    correctAnswer: 'C',
    explanation: 'Detail — email đề cập "internal systems including email... will be UNAVAILABLE".',
    difficulty: 'medium',
    tags: ['part7', 'detail'],
  },
  // Passage 3: Product review (3 questions)
  {
    part: 7, type: 'reading_comprehension',
    content: {
      text: `Product Review: SmartHome Hub Pro
Reviewer: TechExpert | Rating: 4 out of 5 stars

The SmartHome Hub Pro is an impressive entry into the smart home market. Setup was straightforward — the app guided me through pairing devices within 15 minutes. The hub supports over 200 smart devices from various brands, which is a major plus.

What I loved:
- Excellent voice recognition (works even in noisy rooms)
- Sleek design that fits any decor
- Solid build quality

Concerns:
- Battery backup only lasts 2 hours during power outages (competitors offer 6-8 hours)
- Customer support response time is slow (3-day average)
- Mobile app occasionally freezes on Android devices

At $199, it's competitively priced. Overall, I recommend it for tech enthusiasts but expect some growing pains. The company has been responsive to feedback, releasing 2 firmware updates in the past month.`,
    },
    options: [
      { key: 'A', text: 'Highly negative' },
      { key: 'B', text: 'Generally positive with reservations' },
      { key: 'C', text: 'Strongly positive' },
      { key: 'D', text: 'Neutral and unclear' },
    ],
    correctAnswer: 'B',
    explanation: 'Reviewer cho 4/5 sao, có lời khen nhưng cũng nêu concerns → "positive with reservations".',
    difficulty: 'medium',
    tags: ['part7', 'tone'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'Product Review (question 2)' },
    options: [
      { key: 'A', text: 'Voice recognition quality' },
      { key: 'B', text: 'Limited battery backup' },
      { key: 'C', text: 'High price' },
      { key: 'D', text: 'Difficult setup' },
    ],
    correctAnswer: 'B',
    explanation: 'Concern lớn nhất nêu cụ thể: battery backup chỉ 2h vs competitors 6-8h.',
    difficulty: 'medium',
    tags: ['part7', 'detail'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'Product Review (question 3)' },
    options: [
      { key: 'A', text: 'The product is overpriced' },
      { key: 'B', text: 'The manufacturer is committed to improvement' },
      { key: 'C', text: 'Only beginners should buy it' },
      { key: 'D', text: 'It will be replaced soon' },
    ],
    correctAnswer: 'B',
    explanation: 'Inference — "responsive to feedback" + "2 firmware updates in past month" → nhà sản xuất cam kết cải tiến.',
    difficulty: 'hard',
    tags: ['part7', 'inference'],
  },
  // Passage 4: Schedule (3 questions)
  {
    part: 7, type: 'reading_comprehension',
    content: {
      text: `Annual Conference Schedule — Day 1 (March 15)

08:30 - 09:00 | Registration & Welcome Coffee | Main Lobby
09:00 - 10:30 | Keynote: "The Future of AI in Business" by Dr. Sarah Kim | Grand Hall
10:30 - 11:00 | Coffee Break
11:00 - 12:30 | Panel Discussion: Industry Trends | Room A
12:30 - 14:00 | Lunch (provided) | Restaurant
14:00 - 15:30 | Workshop: Practical AI Implementation | Room B (max 30 attendees, pre-registration required)
15:30 - 16:00 | Networking Break
16:00 - 17:30 | Closing Session & Q&A | Grand Hall

Note: All attendees receive a USB drive with presentation materials. Workshop attendance is limited — please confirm at registration desk.`,
    },
    options: [
      { key: 'A', text: 'Two days' },
      { key: 'B', text: 'One day' },
      { key: 'C', text: 'Three days' },
      { key: 'D', text: 'Half a day' },
    ],
    correctAnswer: 'B',
    explanation: 'Title — "Day 1 (March 15)" và lịch từ 8:30 sáng đến 17:30 cùng ngày.',
    difficulty: 'easy',
    tags: ['part7', 'detail', 'schedule'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'Conference Schedule (question 2)' },
    options: [
      { key: 'A', text: 'Keynote speech' },
      { key: 'B', text: 'Panel discussion' },
      { key: 'C', text: 'Workshop' },
      { key: 'D', text: 'Closing session' },
    ],
    correctAnswer: 'C',
    explanation: 'Detail — chỉ workshop yêu cầu pre-registration (max 30 attendees).',
    difficulty: 'medium',
    tags: ['part7', 'detail'],
  },
  {
    part: 7, type: 'reading_comprehension',
    content: { text: 'Conference Schedule (question 3)' },
    options: [
      { key: 'A', text: 'Attendees can extend their lunch break' },
      { key: 'B', text: 'The conference will be recorded and posted online' },
      { key: 'C', text: 'Networking opportunities are integrated throughout' },
      { key: 'D', text: 'A printed program will be distributed' },
    ],
    correctAnswer: 'C',
    explanation: 'Inference — lịch có Coffee Break, Lunch (provided), Networking Break → networking được tích hợp xuyên suốt.',
    difficulty: 'hard',
    tags: ['part7', 'inference'],
  },
];

export const allQuestions = [
  ...part1Questions,
  ...part2Questions,
  ...part3Questions,
  ...part4Questions,
  ...part5Questions,
  ...part6Questions,
  ...part7Questions,
];

export const partCounts = {
  part1: part1Questions.length,
  part2: part2Questions.length,
  part3: part3Questions.length,
  part4: part4Questions.length,
  part5: part5Questions.length,
  part6: part6Questions.length,
  part7: part7Questions.length,
  total: part1Questions.length + part2Questions.length + part3Questions.length + part4Questions.length + part5Questions.length + part6Questions.length + part7Questions.length,
};
