# Raw PDFs (gitignored)

Folder này chứa file PDF gốc của các đề ETS để extract content vào database.

**KHÔNG commit folder này lên repo public** — đã liệt kê trong `.gitignore`.

## Cấu trúc folder

```
_raw_pdfs/
├── README.md                  ← file này
├── test-01/                   ← Test 01 (ĐÃ extract + seed vào DB + Cloudinary)
│   ├── lc-key.pdf             ← Listening key (đề + đáp án + dịch + giải thích Part 1-4) ~4MB
│   ├── rc-key.pdf             ← Reading key (đề + đáp án + dịch + giải thích Part 5-7) ~29MB
│   ├── lc-key.txt             ← extracted text (pdftotext output)
│   ├── rc-key.txt
│   └── IMAGE_CHECKLIST.md     ← danh sách ảnh đã/cần crop
├── test-02/                   ← Test 02 (TRỐNG — paste PDF vào đây)
├── test-03/                   ← Test 03
├── ...
└── test-10/                   ← Test 10
```

## Workflow extract cho 1 đề mới (vd Test 02)

### Bước 1 — User upload PDF
Copy 2 file PDF vào `_raw_pdfs/test-02/`:
- `lc-key.pdf`
- `rc-key.pdf`

Cả 2 file PHẢI có text layer (mở Foxit/Adobe, thử select copy 1 đoạn text — nếu copy được = OK).

### Bước 2 — Extract text bằng pdftotext

```powershell
cd _raw_pdfs/test-02
pdftotext -enc UTF-8 lc-key.pdf lc-key.txt
pdftotext -enc UTF-8 rc-key.pdf rc-key.txt
```

`pdftotext` đi kèm Git for Windows — KHÔNG cần cài thêm. **Không dùng `-layout`** (memory: default mode decode tiếng Việt đúng dấu hơn).

### Bước 3 — Parse JSON
Paste 2 file `.txt` cho Claude → parse 200 câu theo format `Question` schema → output `server/seeds/data/ets-2026-test-02.json`.

Template format có sẵn ở [server/seeds/data/ets-2026-test-01.template.json](../server/seeds/data/ets-2026-test-01.template.json).

### Bước 4 — Crop audio + image

- **Audio:** copy mp3 files từ disk ETS vào `server/public/audio/ets-2026/test-02/` theo convention:
  - Part 1-2 (1 file/câu): `E26-T02-01.mp3` ... `E26-T02-31.mp3`
  - Part 3-4 (1 file/group 3 câu): `E26-T02-32-34.mp3`, `E26-T02-35-37.mp3`, ...
- **Image:** dùng Snipping Tool crop từ PDF, save vào `server/public/images/ets-2026/test-02/`:
  - Part 1 photo: `01.PNG` đến `06.PNG`
  - Part 3-4 graphic: `graphic-q{start}-{end}.PNG` (vd `graphic-q62-64.PNG`)
  - Part 6 passage: `passage-q{start}-{end}.PNG` (vd `passage-q131-134.PNG`)
  - Part 7 đơn passage: `passage-q{start}-{end}.PNG`
  - Part 7 multi passage (câu 176-200): `passage-q{start}-{end}-{a|b|c}.PNG`

### Bước 5 — Seed vào DB

Edit `server/seeds/seedRealTest.js` đổi `testCode` `T01` → `T02`:

```powershell
cd server
npm run seed:real
```

Script tự build URLs `/audio/ets-2026/test-02/...` cho Question docs.

### Bước 6 — Migrate media lên Cloudinary

```powershell
npm run migrate:cloudinary
```

Script idempotent — upload 92 file mới của Test 02 + update Question URLs sang Cloudinary CDN.

### Bước 7 — Verify

Vào admin UI `/admin/tests` → thấy "ETS 2026 - Full Test 02" + 7 Practice Sets. Vào FE `/full-test` → làm + submit → OK.

## Cleanup sau khi extract xong

`_raw_pdfs/test-XX/` chỉ là source archive — có thể xoá local sau khi:
1. ✅ JSON đã trong `server/seeds/data/`
2. ✅ Media đã trong `server/public/` (rồi migrate Cloudinary)
3. ✅ Seed DB thành công

Hoặc giữ làm backup. Tùy.
