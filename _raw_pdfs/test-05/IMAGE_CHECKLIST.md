# Checklist ảnh cần crop cho ETS 2026 Test 05

**Tổng: 38 ảnh + 54 mp3** — danh sách dưới đây được extract từ `server/seeds/data/ets-2026-test-05.json`, đảm bảo khớp với DB sau khi import qua admin UI.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → chọn vùng → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** bất kỳ thư mục nào trên máy bạn, **KHÔNG cần để trong repo**. Ví dụ `D:\toeic-files\test-05\`. Có thể để chung tất cả 38 ảnh + 54 audio trong 1 folder để dễ upload bulk (BE phân loại theo tên file, không theo subfolder).

---

## Part 1 — Photograph (6 ảnh, 1 ảnh/câu)

Source: LC.pdf, các câu 1-6 (đầu bài Listening).

- [ ] `01.PNG` — câu 1 (woman sorting through paper files)
- [ ] `02.PNG` — câu 2 (worker using a machine to move boxes)
- [ ] `03.PNG` — câu 3 (beverages inside a tent)
- [ ] `04.PNG` — câu 4 (clothing displayed outside on racks)
- [ ] `05.PNG` — câu 5 (man writing on a poster board)
- [ ] `06.PNG` — câu 6 (tires stacked against a building)

---

## Part 3 — Graphic ("Look at the graphic") — 3 ảnh

Source: LC.pdf, Part 3 conversations có câu hỏi "Look at the graphic". Crop chart / table / diagram kèm theo.

- [ ] `graphic-q62-64.PNG` — biểu đồ phases dự án xây dựng hầm tàu (Q62 ref)
- [ ] `graphic-q65-67.PNG` — bản đồ khu vực thành phố với phí đỗ xe (Q66 ref)
- [ ] `graphic-q68-70.PNG` — sơ đồ các bước/đề xuất cải tạo ngân hàng (Q69 ref)

---

## Part 4 — Graphic — 2 ảnh

Source: LC.pdf, Part 4 talks có câu hỏi "Look at the graphic".

- [ ] `graphic-q95-97.PNG` — bản đồ đường đua xe đạp Summerhaven (Q97 ref)
- [ ] `graphic-q98-100.PNG` — biểu đồ 4 stages of market research (Q99 ref)

---

## Part 6 — Text completion passages (4 ảnh)

Source: RC.pdf, Part 6. Mỗi passage có 4 câu điền từ. Crop NGUYÊN passage (kèm cả các blank `-------`).

- [ ] `passage-q131-134.PNG` — thông báo Claudia Hoffman nghỉ và Marcos Molina tiếp nhận
- [ ] `passage-q135-138.PNG` — giới thiệu hội thảo team leader
- [ ] `passage-q139-142.PNG` — Email Impressionise mời thiết kế phòng vật lý trị liệu
- [ ] `passage-q143-146.PNG` — Hướng dẫn cộng tác viết bài Digital Chicory

---

## Part 7 — Single passages (10 ảnh)

Source: RC.pdf, Part 7. Crop NGUYÊN passage (chỉ phần đề bài, KHÔNG kèm câu hỏi bên dưới).

- [ ] `passage-q147-148.PNG` — Quảng cáo báo Clearpoint Times
- [ ] `passage-q149-150.PNG` — Email David Paltz (Emerald Glen Landscaping)
- [ ] `passage-q151-152.PNG` — Quảng cáo khách sạn Cavalina
- [ ] `passage-q153-154.PNG` — Chat Paul Cho / Marisol Rosetti (giới thiệu việc)
- [ ] `passage-q155-157.PNG` — Bài báo Covered Bridge Industries hoãn ra mắt
- [ ] `passage-q158-160.PNG` — Memo Leah Achen về Zipvid → Curtain Call
- [ ] `passage-q161-164.PNG` — Bài báo Greenwood local businesses (A Thousand Stories + Rosier)
- [ ] `passage-q165-167.PNG` — Notice an toàn nhân viên
- [ ] `passage-q168-171.PNG` — Mô tả công việc Highway Supervisor (Dora County)
- [ ] `passage-q172-175.PNG` — Chat Marcus Gollancz / Jennifer Kaluza / Arthur Gruyter

---

## Part 7 — Double passages (4 ảnh = 2 sets × 2 passages)

Mỗi set có 2 passage, crop riêng từng cái.

**Set 176-180** (JJ's Home & Garden cement mixers):
- [ ] `passage-q176-180-a.PNG` — Bảng sản phẩm máy trộn xi măng (JJ's Home)
- [ ] `passage-q176-180-b.PNG` — Email Marshall Weaver complaint

**Set 181-185** (Collingswood Global):
- [ ] `passage-q181-185-a.PNG` — Trang web Collingswood Global (tư vấn thương mại quốc tế)
- [ ] `passage-q181-185-b.PNG` — Email Sanjeev Yadav follow-up

---

## Part 7 — Triple passages (9 ảnh = 3 sets × 3 passages)

**Set 186-190** (Sonfaya Mutual BASA):
- [ ] `passage-q186-190-a.PNG` — Customers' Corner article về BASA
- [ ] `passage-q186-190-b.PNG` — Email Chabinga → archivist (số AFR thiếu)
- [ ] `passage-q186-190-c.PNG` — Thư gửi bà Nirere (Senior Account Manager)

**Set 191-195** (Maya Rodriguez business travel):
- [ ] `passage-q191-195-a.PNG` — Email Rodriguez → Valley Road B&B
- [ ] `passage-q191-195-b.PNG` — Mẫu hoàn trả chi phí đi lại Intermountain Graphics
- [ ] `passage-q191-195-c.PNG` — Hóa đơn Eileen's Diner

**Set 196-200** (Quinar 5000 maintenance):
- [ ] `passage-q196-200-a.PNG` — Email 1: Stacy Landon báo lỗi máy
- [ ] `passage-q196-200-b.PNG` — Email 2: Jae-Jun Nahm phản hồi (CC Alex Nadiner)
- [ ] `passage-q196-200-c.PNG` — Báo cáo Konner Services

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
(Get-ChildItem D:\toeic-files\test-05\ -Filter *.PNG).Count
# Phải = 38   (đường dẫn folder bạn tự chọn — không cần trong repo)
```

---

## Audio MP3 (54 files)

Folder đích: cùng folder ngoài repo với ảnh, hoặc folder riêng — đều OK.

| Part | Range câu | Pattern | Số file |
|---|---|---|---|
| 1 | 1-6 | `E26-T05-01.mp3` … `E26-T05-06.mp3` | 6 |
| 2 | 7-31 | `E26-T05-07.mp3` … `E26-T05-31.mp3` | 25 |
| 3 | 32-70 | `E26-T05-32-34.mp3`, `E26-T05-35-37.mp3`, …, `E26-T05-68-70.mp3` (group 3 câu) | 13 |
| 4 | 71-100 | `E26-T05-71-73.mp3`, …, `E26-T05-98-100.mp3` (group 3 câu) | 10 |

Total: **54 mp3**. Naming pattern khớp regex BE → tự link vào Question docs khi import.

---

## Bước import — gọn 2 bước, KHÔNG cần copy file vào repo

### Bước 1: Import đề (không cần media sẵn)

- Vào `/admin/tests` → nút "Import 1-click" hoặc gọi `POST /api/v1/tests/import`
- Body: nội dung file `server/seeds/data/ets-2026-test-05.json`
- BE auto tạo: 200 Question + 1 Full Test 05 + 7 Practice Sets (Part 1-7). Field `audioUrl` / `imageUrl` được fill placeholder local URL (`/audio/ets-2026/test-05/...`, `/images/ets-2026/test-05/...`).

### Bước 2: Crop ảnh + cắt audio (ngoài repo)

- 38 ảnh PNG + 54 mp3 → bất kỳ folder nào ngoài repo, vd `D:\toeic-files\test-05\`
- Tên file BẮT BUỘC khớp regex BE (xem các section trên) — sai 1 ký tự là file bị reject với report cụ thể trong UI

### Bước 3: Bulk upload qua admin UI

- Vào trang chi tiết Đề thi: `/admin/tests/:id`
- Tab "Media" → "Upload media" → chọn toàn bộ 92 file từ folder ngoài repo (drag & drop hoặc multi-select)
- BE: upload Cloudinary (concurrency 5, ~1 phút cho 92 file) + tự thay URL local → Cloudinary URL trong DB
- UI hiện report: file nào upload thành công, file nào fail (kèm lý do — thường là sai tên)

Sau bước 3, đề thi sẵn sàng cho user làm bài.
