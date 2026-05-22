# Server static media

Folder serve qua Express `app.use(express.static(public))`. URL trên client:
- `http://localhost:5000/audio/...`
- `http://localhost:5000/images/...`

## ⚠️ Bản quyền

Thư mục `audio/` và `images/` chứa tài liệu TOEIC từ ETS có bản quyền.
**KHÔNG commit lên GitHub public** — đã gitignore.

Khi clone repo mới, cần copy tay AUDIO + ảnh Part 1 vào theo cấu trúc:

```
server/public/
├── audio/
│   └── ets-2026/
│       └── test-01/
│           ├── E26-T01-01.mp3   ... E26-T01-31.mp3   (Part 1: 1-6, Part 2: 7-31, 1 file/câu)
│           ├── E26-T01-32-34.mp3 ... E26-T01-68-70.mp3 (Part 3: 13 conversations × 3 câu)
│           └── E26-T01-71-73.mp3 ... E26-T01-98-100.mp3 (Part 4: 10 talks × 3 câu)
└── images/
    └── ets-2026/
        └── test-01/
            ├── q01.jpg   ← Part 1 photographs (extract từ PDF)
            └── ... q06.jpg
```

## Workflow setup

1. Copy folder `Test 1` từ disk vào `server/public/audio/ets-2026/test-01/`
2. Extract 6 ảnh Part 1 từ `ETS 2026 - LC.pdf` (page có ảnh số 1-6)
   - Trên Foxit/Adobe: Right-click → Save Image, hoặc dùng snipping tool
   - Save vào `server/public/images/ets-2026/test-01/q01.jpg` ... `q06.jpg`
3. Verify by opening browser: `http://localhost:5000/audio/ets-2026/test-01/E26-T01-01.mp3` phải play được
