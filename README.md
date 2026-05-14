# TOEIC AI Platform

Website hỗ trợ ôn luyện TOEIC tích hợp phân tích kết quả học tập bằng trí tuệ nhân tạo.

## Stack

- **Frontend:** React 18 + Vite + TailwindCSS + Zustand + React Router + Axios + Recharts
- **Backend:** Node.js + Express + Mongoose + JWT + bcrypt
- **Database:** MongoDB Atlas
- **AI:** OpenAI API (GPT-4o-mini)
- **Deploy:** Vercel (FE) + Render (BE)

## Cấu trúc thư mục

```
toeic-ai-platform/
├── client/         # Frontend React + Vite
├── server/         # Backend Express
├── docs/           # Tài liệu (khảo sát, cấu trúc TOEIC, báo cáo)
└── README.md
```

## Cài đặt local

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Sửa .env với MONGODB_URI + JWT_SECRET + OPENAI_API_KEY của bạn
npm run dev
```

Server chạy ở `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
# Mặc định VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

Client chạy ở `http://localhost:5173`.
