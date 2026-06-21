# Hướng dẫn cài đặt TOEIC AI Platform

Hướng dẫn chạy project ở môi trường local cho mục đích phát triển hoặc demo offline.

---

## Yêu cầu

- Node.js 20+ và npm
- MongoDB (local hoặc Atlas)
- (Tuỳ chọn) OpenAI API key, Cloudinary account, Resend API key cho các tính năng AI/media/email

---

## 1. Clone & cài dependency

```bash
git clone https://github.com/tuanhandsomes/toeic-ai-platform.git
cd toeic-ai-platform

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

## 2. Cấu hình môi trường

**`server/.env`** — copy từ `.env.example`:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/toeic-ai
JWT_ACCESS_SECRET=<random 64+ ký tự>
JWT_REFRESH_SECRET=<random 64+ ký tự>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
JWT_REFRESH_EXPIRES_LONG=30d
CLIENT_URL=http://localhost:5173

# Tuỳ chọn — nếu thiếu, các tính năng tương ứng sẽ fallback hoặc skip
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=TOEIC AI Platform
CONTACT_RECIPIENT=your-email@example.com
```

**`client/.env`**:

```bash
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 3. Seed dữ liệu mẫu

```bash
cd server
npm run seed:admin            # Tạo tài khoản admin (email + password in console)
npm run seed:real             # Seed 10 đề ETS 2026 (200 câu mỗi đề, tổng 2000 câu)
```

---

## 4. Chạy dev server

```bash
# Terminal 1 — Backend
cd server
npm run dev                   # http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev                   # http://localhost:5173
```

Mở `http://localhost:5173` trên trình duyệt và đăng nhập bằng tài khoản admin vừa seed.

---

## Lỗi thường gặp

- **`MongooseServerSelectionError`** — MongoDB local chưa chạy hoặc `MONGODB_URI` sai. Kiểm tra `mongod` service hoặc connection string Atlas.
- **`Cannot find module` khi `npm run dev`** — chạy lại `npm install` trong đúng thư mục (`server/` hoặc `client/`).
- **CORS error trên trình duyệt** — `CLIENT_URL` trong `server/.env` phải khớp **chính xác** URL frontend (không có trailing slash).
- **AI analysis không chạy** — thiếu `OPENAI_API_KEY`. Hệ thống sẽ tự fallback sang heuristic analysis rule-based, vẫn cho ra kết quả.
- **Upload media lỗi** — thiếu 3 biến `CLOUDINARY_*`. Các route upload sẽ trả 500 cho tới khi cấu hình đầy đủ.
- **Forgot password không gửi email** — thiếu `RESEND_API_KEY`. Token reset vẫn được tạo trong DB, có thể test bằng cách query collection `password_reset_tokens` thủ công.
