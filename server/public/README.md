# Server static media

Folder này từng serve qua Express `app.use(express.static(public))` ở giai đoạn đầu. Sau Day 24, **media đã migrate sang Cloudinary CDN** ([config/cloudinary.js](../src/config/cloudinary.js)), Question.content lưu URL `https://res.cloudinary.com/...` thay vì path local.

Folder này giờ chỉ là **staging area** cho seed workflow:
1. Crop audio/image cho 1 đề mới vào đây
2. Chạy `npm run seed:real` để insert Question với URLs `/audio/...` tạm thời
3. Chạy `npm run migrate:cloudinary` để upload lên Cloudinary + thay URLs trong DB

## ⚠️ Bản quyền

Thư mục `audio/` và `images/` chứa tài liệu TOEIC từ ETS có bản quyền.
**KHÔNG commit lên GitHub public** — đã gitignore (chỉ `.gitkeep` được track để giữ structure).

## Cấu trúc folder

```
server/public/
├── audio/
│   └── ets-2026/
│       ├── test-01/           ✅ ĐÃ migrate Cloudinary
│       │   ├── E26-T01-01.mp3 ... E26-T01-31.mp3    (Part 1: 1-6, Part 2: 7-31, 1 file/câu)
│       │   ├── E26-T01-32-34.mp3 ... E26-T01-68-70.mp3   (Part 3: 13 conversations × 3 câu)
│       │   └── E26-T01-71-73.mp3 ... E26-T01-98-100.mp3  (Part 4: 10 talks × 3 câu)
│       ├── test-02/           ⬜ chờ user upload
│       ├── test-03/
│       ├── ...
│       └── test-10/
└── images/
    └── ets-2026/
        ├── test-01/           ✅ ĐÃ migrate Cloudinary
        │   ├── 01.PNG ... 06.PNG                    (Part 1 photo)
        │   ├── graphic-q62-64.PNG ...               (Part 3-4 graphic)
        │   ├── passage-q131-134.PNG ...             (Part 6 passage)
        │   └── passage-q176-180-a.PNG ...           (Part 7 multi-passage, semicolon-joined trong DB)
        ├── test-02/           ⬜ chờ user crop
        ├── ...
        └── test-10/
```

## Convention naming files (BẮT BUỘC giữ đúng cho seed script auto-map)

### Audio
| Part | Pattern | Ví dụ |
|---|---|---|
| 1, 2 | `E26-T{XX}-{NN}.mp3` (1 file/câu) | `E26-T02-01.mp3`, `E26-T02-25.mp3` |
| 3, 4 | `E26-T{XX}-{start}-{end}.mp3` (1 file/3 câu) | `E26-T02-32-34.mp3`, `E26-T02-71-73.mp3` |

### Image
| Use case | Pattern | Ví dụ |
|---|---|---|
| Part 1 photo | `{NN}.PNG` (số thứ tự câu, 2 chữ số) | `01.PNG` đến `06.PNG` |
| Part 3-4 graphic | `graphic-q{start}-{end}.PNG` | `graphic-q62-64.PNG` |
| Part 6 passage | `passage-q{start}-{end}.PNG` | `passage-q131-134.PNG` |
| Part 7 single passage | `passage-q{start}-{end}.PNG` | `passage-q151-152.PNG` |
| Part 7 multi-passage | `passage-q{start}-{end}-{a\|b\|c}.PNG` | `passage-q176-180-a.PNG`, `passage-q176-180-b.PNG` |

**Lưu ý case-sensitivity:** extension `.PNG` (HOA) phải khớp với value trong JSON seed. Quan trọng cho deploy Linux (Render).

## Workflow extract đề mới

Xem [_raw_pdfs/README.md](../../_raw_pdfs/README.md) cho workflow 7 bước extract PDF → JSON → seed → Cloudinary.
