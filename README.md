# TOEIC AI Platform

Web ứng dụng luyện thi TOEIC Listening & Reading có tích hợp phân tích kết quả bằng AI.

🌐 **Live demo:** https://toeic-ai-one.vercel.app

## Tính năng chính

- **Luyện theo Part** — 7 Part TOEIC riêng biệt (Part 1-7), tổng 10 bộ đề ETS 2026
- **Thi thử Full Test** — 200 câu, 120 phút, mô phỏng đề thi thật, tự chấm điểm theo bảng quy đổi ETS
- **Phân tích AI** — GPT-4o-mini phân tích điểm mạnh/yếu chi tiết theo từng dạng câu (word-form, giới từ, paraphrase, repeat-trap, ...) với lời khuyên đo lường được
- **Theo dõi tiến độ** — Biểu đồ thời gian học, điểm Full Test cao nhất theo ngày, streak, top 10 bảng xếp hạng cá nhân
- **Thông báo thông minh** — 8 loại notification (đề mới, gợi ý Full Test, đạt mục tiêu, kỷ lục cá nhân, ...) sort theo thời gian
- **Quản trị** — Admin CRUD users/tests/questions/media, dashboard thống kê tổng quan, dialog tạo/sửa/khoá user
- **Phục hồi mật khẩu** — Email reset link qua Resend, token SHA-256 hash, TTL 30 phút, single-use
- **Liên hệ** — Form public có MX validation + disposable domain blocklist + honeypot chống bot

---

## Tech stack

| Layer     | Technology                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Frontend  | React 19, Vite 8, TailwindCSS 3, Zustand, React Router 7, Axios, Recharts, Radix UI primitives                               |
| Backend   | Node.js 20, Express 4 (ES Modules), Mongoose 8, JWT (access 15m + refresh 7d), bcryptjs, Helmet, express-rate-limit, Winston |
| Database  | MongoDB Atlas (M0 Free)                                                                                                      |
| AI        | OpenAI gpt-4o-mini với Structured Outputs (strict JSON schema)                                                               |
| Media CDN | Cloudinary (Dynamic Folders mode)                                                                                            |
| Email     | Resend (`onboarding@resend.dev` cho dev, custom domain cho prod)                                                             |
| Testing   | Vitest 4 + jsdom + @testing-library/react — 392 tests pass                                                                   |
| Deploy    | Vercel (FE) + Render (BE)                                                                                                    |

---

## Cấu trúc thư mục

```
toeic-ai-platform/
├── client/                    # Frontend SPA (Vite + React)
│   ├── src/
│   │   ├── pages/             # Trang chính (Landing, Login, Dashboard, Exam, Result, Admin, ...)
│   │   ├── components/        # Components chia sẻ (UI, common, exam, layout)
│   │   ├── services/          # axiosClient + API service layers
│   │   ├── store/             # Zustand auth store
│   │   ├── utils/             # Helpers (formatTime, notifications, statsHelpers, ...)
│   │   ├── constants/         # toeic.js (PART_OFFSETS, computeGlobalNumbers, ...)
│   │   └── routes/            # AppRoutes + ProtectedRoute
│   ├── tests/unit/            # Vitest tests (134 tests)
│   ├── vercel.json            # SPA rewrite cho React Router
│   └── vite.config.js
│
├── server/                    # Backend Express API
│   ├── src/
│   │   ├── routes/            # URL mounting (/api/v1/*)
│   │   ├── controllers/       # Parse req, call service, format response
│   │   ├── services/          # Business logic (auth, result, AI, scoring, ...)
│   │   ├── models/            # Mongoose schemas (User, Test, Question, Result, AIAnalysis, ...)
│   │   ├── middlewares/       # auth, role, rateLimit, validate, errorHandler, upload
│   │   ├── validations/       # Joi schemas
│   │   ├── utils/             # ApiError, ApiResponse, asyncHandler, prompts.js, logger
│   │   └── config/            # env, db, openai, cloudinary
│   ├── tests/unit/            # Vitest tests (258 tests)
│   ├── seeds/                 # Seed scripts + 10 đề ETS 2026 JSON
│   └── scripts/               # migrateToCloudinary, cleanupResultDuration, ...
│
└── docs/                      # Tài liệu khảo sát, cấu trúc TOEIC, design tokens
```

---

## Cài đặt local

Xem hướng dẫn chi tiết tại [`INSTALL.md`](INSTALL.md) — bao gồm yêu cầu môi trường, biến `.env` cho cả server/client, seed dữ liệu mẫu và các lỗi thường gặp.

---

## Testing

Project có 392 unit test bằng Vitest:

```bash
# Server (258 tests)
cd server
npm test                      # one-shot
npm run test:watch            # watch mode
npm run test:coverage         # HTML coverage report tại coverage/index.html

# Client (134 tests)
cd client
npm test
```

Coverage server tập trung vào critical paths:

- `scoringService`: 98%
- `authService`: 99%
- `aiAnalysisService`: 90%
- `testImportService`: 100%
- Middlewares (auth, role, errorHandler, validate, upload): 86%

---

## Convention quan trọng

- **Vietnamese UI text** — không dùng tech jargon (JSON, BE, DB, ...) trong user-facing strings
- **Question numbers UI** — global 1-200 kể cả Practice Part X (Practice Part 7 hiển thị 147-200 không phải 1-54)
- **Practice timer** — LUÔN count-up, không countdown
- **TOEIC Part 2 chỉ có 3 đáp án A/B/C**, các Part khác có A/B/C/D
- **Media format** — Audio MP3 only, Image PNG/JPG only
- **Cloudinary** — bắt buộc truyền `asset_folder` param (Dynamic Folders mode)
- **AI analysis** — chỉ auto-trigger sau Full Test submission, không sau Practice
- **Filename convention** — strict (`E26-T{XX}-{NN}.mp3`, `passage-q{start}-{end}.PNG`, ...) để BE auto-link Question URLs

---

## Author

**Đỗ Khắc Tuấn**

- Repo: https://github.com/tuanhandsomes/toeic-ai-platform
- Live demo: https://toeic-ai-one.vercel.app
