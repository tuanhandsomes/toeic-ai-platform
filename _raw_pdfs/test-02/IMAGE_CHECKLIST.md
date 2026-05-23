# Checklist ảnh cần crop cho ETS 2026 Test 02

**Tổng: 38 ảnh** — danh sách CHÍNH XÁC dưới đây được extract từ `server/seeds/data/ets-2026-test-02.json`, đảm bảo khớp với DB sau khi seed.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → chọn vùng → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** `server/public/images/ets-2026/test-02/` (đã có sẵn `.gitkeep`)

---

## Part 1 — Photograph (6 ảnh, 1 ảnh/câu)

Source: LC.pdf, các câu 1-6 (đầu bài Listening).

- [ ] `01.PNG` — câu 1 (a man + stone path)
- [ ] `02.PNG` — câu 2 (woman pulling luggage)
- [ ] `03.PNG` — câu 3 (vehicle next to building)
- [ ] `04.PNG` — câu 4 (man holding phone)
- [ ] `05.PNG` — câu 5
- [ ] `06.PNG` — câu 6

---

## Part 3 — Graphic ("Look at the graphic") — 3 ảnh

Source: LC.pdf, Part 3 conversations có câu hỏi "Look at the graphic". Crop chart/table/menu kèm.

- [ ] `graphic-q62-64.PNG` — conversation câu 62-64 (Q63 ref graphic)
- [ ] `graphic-q65-67.PNG` — conversation câu 65-67 (Q66 ref graphic)
- [ ] `graphic-q68-70.PNG` — conversation câu 68-70 (Q69 ref graphic)

---

## Part 4 — Graphic — 2 ảnh

Source: LC.pdf, Part 4 talks có câu hỏi "Look at the graphic".

- [ ] `graphic-q95-97.PNG` — talk câu 95-97 (Q96 ref graphic)
- [ ] `graphic-q98-100.PNG` — talk câu 98-100 (Q99 ref graphic)

---

## Part 6 — Text completion passages (4 ảnh)

Source: RC.pdf, Part 6. Mỗi passage có 4 câu điền từ. Crop nguyên passage (kèm cả các blank `-------`).

- [ ] `passage-q131-134.PNG` — passage 1 (Muffin Lady)
- [ ] `passage-q135-138.PNG` — passage 2 (Teksheen / Those who...)
- [ ] `passage-q139-142.PNG` — passage 3
- [ ] `passage-q143-146.PNG` — passage 4

---

## Part 7 — Single passages (10 ảnh)

Source: RC.pdf, Part 7. Crop nguyên passage (chỉ phần đề bài, không kèm câu hỏi).

- [ ] `passage-q147-148.PNG`
- [ ] `passage-q149-150.PNG`
- [ ] `passage-q151-152.PNG`
- [ ] `passage-q153-155.PNG`
- [ ] `passage-q156-157.PNG`
- [ ] `passage-q158-160.PNG`
- [ ] `passage-q161-163.PNG`
- [ ] `passage-q164-167.PNG`
- [ ] `passage-q168-171.PNG`
- [ ] `passage-q172-175.PNG`

---

## Part 7 — Double passages (4 ảnh = 2 sets × 2 passages)

Mỗi set có 2 passage, crop riêng từng cái.

**Set 176-180** (Greatford Curtains / hóa đơn):
- [ ] `passage-q176-180-a.PNG` — passage thứ 1 (xuất hiện trước trong PDF)
- [ ] `passage-q176-180-b.PNG` — passage thứ 2

**Set 181-185:**
- [ ] `passage-q181-185-a.PNG`
- [ ] `passage-q181-185-b.PNG`

---

## Part 7 — Triple passages (9 ảnh = 3 sets × 3 passages)

**Set 186-190:**
- [ ] `passage-q186-190-a.PNG`
- [ ] `passage-q186-190-b.PNG`
- [ ] `passage-q186-190-c.PNG`

**Set 191-195:**
- [ ] `passage-q191-195-a.PNG`
- [ ] `passage-q191-195-b.PNG`
- [ ] `passage-q191-195-c.PNG`

**Set 196-200:**
- [ ] `passage-q196-200-a.PNG`
- [ ] `passage-q196-200-b.PNG`
- [ ] `passage-q196-200-c.PNG`

---

## Tips khi crop

1. **Crop vùng hẹp vừa đủ** — chừa lề trắng 5-10px cho thoáng
2. **Resolution ~150 DPI** là đủ — không cần quá nét (file sẽ nặng)
3. **Save PNG** (không JPG) — text trong ảnh sẽ rõ hơn
4. **Tên file viết HOA `.PNG`** (case-sensitive khi deploy Linux Render)
5. **Đặt tên đúng từ đầu** — đỡ phải rename sau
6. **Part 7 multi-passage** (a/b/c): passage nào xuất hiện trước trong PDF = `a`, kế tiếp = `b`, cuối = `c`

## Verify sau khi crop xong

```powershell
ls server/public/images/ets-2026/test-02/ | Measure-Object | Select Count
# Phải = 38
```

## Bước seed sau khi audio + image đầy đủ

1. Audio file: 54 mp3 trong `server/public/audio/ets-2026/test-02/` theo naming `E26-T02-XX.mp3` (Part 1-2) và `E26-T02-XX-YY.mp3` (Part 3-4)
2. Edit `server/seeds/seedRealTest.js` đổi `testCode` `T01` → `T02` và source JSON path
3. `cd server && npm run seed:real` → seed 200 Question + 1 Full Test 02 + 7 Practice Sets
4. `npm run migrate:cloudinary` → upload 92 media files lên Cloudinary + replace local URLs trong DB
