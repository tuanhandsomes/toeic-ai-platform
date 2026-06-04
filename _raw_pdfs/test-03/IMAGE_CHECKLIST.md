# Checklist ảnh cần crop cho ETS 2026 Test 03

**Tổng: 38 ảnh** — danh sách dưới đây được extract từ `server/seeds/data/ets-2026-test-03.json`, đảm bảo khớp với DB sau khi import qua admin UI.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → chọn vùng → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** bất kỳ thư mục nào trên máy bạn, **KHÔNG cần để trong repo**. Ví dụ `D:\toeic-files\test-03\`. Có thể để chung tất cả 38 ảnh + 54 audio trong 1 folder để dễ upload bulk (BE phân loại theo tên file, không theo subfolder).

---

## Part 1 — Photograph (6 ảnh, 1 ảnh/câu)

Source: LC.pdf, các câu 1-6 (đầu bài Listening).

- [ ] `01.PNG` — câu 1 (man drinking from a mug)
- [ ] `02.PNG` — câu 2 (bushes covered with snow)
- [ ] `03.PNG` — câu 3 (man spreading map on top of car)
- [ ] `04.PNG` — câu 4 (people seated next to each other)
- [ ] `05.PNG` — câu 5 (boxes under lamps)
- [ ] `06.PNG` — câu 6 (cyclist riding past pedestrian)

---

## Part 3 — Graphic ("Look at the graphic") — 3 ảnh

Source: LC.pdf, Part 3 conversations có câu hỏi "Look at the graphic". Crop chart / table / price list kèm theo.

- [ ] `graphic-q62-64.PNG` — bảng giá xà phòng (Q62 ref)
- [ ] `graphic-q65-67.PNG` — lịch mở cửa Kwon Photography (Q67 ref)
- [ ] `graphic-q68-70.PNG` — biểu mẫu chi phí (Q70 ref, section 4)

---

## Part 4 — Graphic — 2 ảnh

Source: LC.pdf, Part 4 talks có câu hỏi "Look at the graphic".

- [ ] `graphic-q95-97.PNG` — phiếu giảm giá Oceania Flowers (Q97 ref)
- [ ] `graphic-q98-100.PNG` — bản đồ xe buýt (Q100 ref)

---

## Part 6 — Text completion passages (4 ảnh)

Source: RC.pdf, Part 6. Mỗi passage có 4 câu điền từ. Crop NGUYÊN passage (kèm cả các blank `-------`).

- [ ] `passage-q131-134.PNG` — Avanti double-rewards promotion
- [ ] `passage-q135-138.PNG` — Winnie Liu promotion letter
- [ ] `passage-q139-142.PNG` — How to Pitch Your Start-up
- [ ] `passage-q143-146.PNG` — Payroll Portal Upgrade

---

## Part 7 — Single passages (10 ảnh)

Source: RC.pdf, Part 7. Crop NGUYÊN passage (chỉ phần đề bài, KHÔNG kèm câu hỏi bên dưới).

- [ ] `passage-q147-148.PNG` — Sumner Auto Supply coupon
- [ ] `passage-q149-150.PNG` — Melbury railway station renovation article
- [ ] `passage-q151-152.PNG` — Oregon Art Museum invitation email
- [ ] `passage-q153-154.PNG` — chat Avani Mehta / Ed Beiger (warehouse)
- [ ] `passage-q155-157.PNG` — Dannla Brothers web page (ergonomic furniture)
- [ ] `passage-q158-160.PNG` — Osmond Microtronics CEO memo
- [ ] `passage-q161-163.PNG` — McGrath → Dr. Able thank-you email
- [ ] `passage-q164-167.PNG` — Neveck Associates job posting
- [ ] `passage-q168-171.PNG` — Raxford Park FGS garden article
- [ ] `passage-q172-175.PNG` — chat Parkin / Naifeh / Tuan (board prep)

---

## Part 7 — Double passages (4 ảnh = 2 sets × 2 passages)

Mỗi set có 2 passage, crop riêng từng cái.

**Set 176-180** (Branxley Cycles):
- [ ] `passage-q176-180-a.PNG` — Web page "About Our Products"
- [ ] `passage-q176-180-b.PNG` — Online review by Jason Stewart

**Set 181-185** (Milne Associates / Edinburgh):
- [ ] `passage-q181-185-a.PNG` — Article về Jackson Milne / Milne Associates
- [ ] `passage-q181-185-b.PNG` — City travel review by Punam Nandi

---

## Part 7 — Triple passages (9 ảnh = 3 sets × 3 passages)

**Set 186-190** (Orvale Natural History Museum):
- [ ] `passage-q186-190-a.PNG` — Web page "Upcoming Events" (Dr. Fiallo lecture)
- [ ] `passage-q186-190-b.PNG` — Email Voll → Choi (Oct 11)
- [ ] `passage-q186-190-c.PNG` — Email Whitford → Fiallo (Oct 19)

**Set 191-195** (Moreland schedule):
- [ ] `passage-q191-195-a.PNG` — Bảng lịch làm việc của Ms. Moreland
- [ ] `passage-q191-195-b.PNG` — Email Moreland → Weaver (June 7, 6:31 AM)
- [ ] `passage-q191-195-c.PNG` — Email Weaver → Moreland (June 7, 2:31 PM)

**Set 196-200** (Music Link Plus / Gradey City Choir):
- [ ] `passage-q196-200-a.PNG` — Music Link Plus home page
- [ ] `passage-q196-200-b.PNG` — Email Ellis → Trapani (July 7)
- [ ] `passage-q196-200-c.PNG` — Job listing trên MLP (Singer position)

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
(Get-ChildItem D:\toeic-files\test-03\ -Filter *.PNG).Count
# Phải = 38   (đường dẫn folder bạn tự chọn — không cần trong repo)
```

---

## Audio MP3 (54 files)

Folder đích: cùng folder ngoài repo với ảnh, hoặc folder riêng — đều OK.

| Part | Range câu | Pattern | Số file |
|---|---|---|---|
| 1 | 1-6 | `E26-T03-01.mp3` … `E26-T03-06.mp3` | 6 |
| 2 | 7-31 | `E26-T03-07.mp3` … `E26-T03-31.mp3` | 25 |
| 3 | 32-70 | `E26-T03-32-34.mp3`, `E26-T03-35-37.mp3`, …, `E26-T03-68-70.mp3` (group 3 câu) | 13 |
| 4 | 71-100 | `E26-T03-71-73.mp3`, …, `E26-T03-98-100.mp3` (group 3 câu) | 10 |

Total: **54 mp3**. Naming pattern khớp regex BE → tự link vào Question docs khi import.

---

## Bước import — gọn 2 bước, KHÔNG cần copy file vào repo

### Bước 1: Import đề (không cần media sẵn)

- Vào `/admin/tests` → nút "Import 1-click" hoặc gọi `POST /api/v1/tests/import`
- Body: nội dung file `server/seeds/data/ets-2026-test-03.json`
- BE auto tạo: 200 Question + 1 Full Test 03 + 7 Practice Sets (Part 1-7). Field `audioUrl` / `imageUrl` được fill placeholder local URL (`/audio/ets-2026/test-03/...`, `/images/ets-2026/test-03/...`) — chưa truy cập được, sẽ replace sau khi bulk upload.

### Bước 2: Crop ảnh + cắt audio (ngoài repo)

- 38 ảnh PNG + 54 mp3 → bất kỳ folder nào ngoài repo, vd `D:\toeic-files\test-03\`
- Tên file BẮT BUỘC khớp regex BE (xem các section trên) — sai 1 ký tự là file bị reject với report cụ thể trong UI

### Bước 3: Bulk upload qua admin UI

- Vào trang chi tiết Đề thi: `/admin/tests/:id`
- Tab "Media" → "Upload media" → chọn toàn bộ 92 file từ folder ngoài repo (drag & drop hoặc multi-select)
- BE: upload Cloudinary (concurrency 5, ~1 phút cho 92 file) + tự thay URL local → Cloudinary URL trong DB
- UI hiện report: file nào upload thành công, file nào fail (kèm lý do — thường là sai tên)

Sau bước 3, đề thi sẵn sàng cho user làm bài.
