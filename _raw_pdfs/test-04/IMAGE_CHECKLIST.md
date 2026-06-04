# Checklist ảnh cần crop cho ETS 2026 Test 04

**Tổng: 38 ảnh + 54 mp3** — danh sách dưới đây được extract từ `server/seeds/data/ets-2026-test-04.json`, đảm bảo khớp với DB sau khi import qua admin UI.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → chọn vùng → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** bất kỳ thư mục nào trên máy bạn, **KHÔNG cần để trong repo**. Ví dụ `D:\toeic-files\test-04\`. Có thể để chung tất cả 38 ảnh + 54 audio trong 1 folder để dễ upload bulk (BE phân loại theo tên file, không theo subfolder).

---

## Part 1 — Photograph (6 ảnh, 1 ảnh/câu)

Source: LC.pdf, các câu 1-6 (đầu bài Listening).

- [ ] `01.PNG` — câu 1 (woman standing next to a bin)
- [ ] `02.PNG` — câu 2 (vehicles parked outside a building)
- [ ] `03.PNG` — câu 3 (woman following a man down a corridor)
- [ ] `04.PNG` — câu 4 (man pulling a cart on a walkway)
- [ ] `05.PNG` — câu 5 (woman carrying a bag on her shoulder)
- [ ] `06.PNG` — câu 6 (coffee cups on a counter)

---

## Part 3 — Graphic ("Look at the graphic") — 3 ảnh

Source: LC.pdf, Part 3 conversations có câu hỏi "Look at the graphic". Crop chart / table / price list kèm theo.

- [ ] `graphic-q62-64.PNG` — bảng kê tài khoản kinh doanh của bà Rossi (Q63 ref)
- [ ] `graphic-q65-67.PNG` — sơ đồ vị trí trung tâm nghệ thuật biểu diễn (Q67 ref)
- [ ] `graphic-q68-70.PNG` — danh sách bài blog làm vườn theo tháng (Q69 ref)

---

## Part 4 — Graphic — 2 ảnh

Source: LC.pdf, Part 4 talks có câu hỏi "Look at the graphic".

- [ ] `graphic-q95-97.PNG` — dự báo thời tiết các ngày trong tuần (Q96 ref)
- [ ] `graphic-q98-100.PNG` — bảng phân công công việc cho tiệc nghỉ hưu (Q99 ref)

---

## Part 6 — Text completion passages (4 ảnh)

Source: RC.pdf, Part 6. Mỗi passage có 4 câu điền từ. Crop NGUYÊN passage (kèm cả các blank `-------`).

- [ ] `passage-q131-134.PNG` — Bài báo Eric Hoang khai trương nhà hàng Ngon Mieng
- [ ] `passage-q135-138.PNG` — Bảng giá đỗ xe Connelly Parking
- [ ] `passage-q139-142.PNG` — Thông báo Lost Ocean Theater (Maddy Chang solo show)
- [ ] `passage-q143-146.PNG` — Email Moira Voss đề nghị hợp tác (Petals Aplenty)

---

## Part 7 — Single passages (10 ảnh)

Source: RC.pdf, Part 7. Crop NGUYÊN passage (chỉ phần đề bài, KHÔNG kèm câu hỏi bên dưới).

- [ ] `passage-q147-148.PNG` — Zestful Cuisine job posting
- [ ] `passage-q149-151.PNG` — Alita Technology grant news article
- [ ] `passage-q152-153.PNG` — Stub Master ticket confirmation
- [ ] `passage-q154-156.PNG` — Gulfbrook Creations press release (Ms. Masondo)
- [ ] `passage-q157-158.PNG` — chat Priya Gao / Luis Fuentes (office help)
- [ ] `passage-q159-161.PNG` — Morrisville building permits web page
- [ ] `passage-q162-163.PNG` — Millsberg Summer Festival lineup
- [ ] `passage-q164-167.PNG` — Total Basketball Channel subscription plans
- [ ] `passage-q168-171.PNG` — Regina's Art World blog (Brentler Heights Gallery)
- [ ] `passage-q172-175.PNG` — chat Yuen / Black / Spina (website redesign)

---

## Part 7 — Double passages (4 ảnh = 2 sets × 2 passages)

Mỗi set có 2 passage, crop riêng từng cái.

**Set 176-180** (Hillside House):
- [ ] `passage-q176-180-a.PNG` — Bài báo "Hillside House Ready for Business"
- [ ] `passage-q176-180-b.PNG` — Email Reka Taimona → Hayley Colling

**Set 181-185** (Takem Boot Company):
- [ ] `passage-q181-185-a.PNG` — Email Bella Meyers (complaint Erin boots)
- [ ] `passage-q181-185-b.PNG` — Email Brendan Stephens phản hồi

---

## Part 7 — Triple passages (9 ảnh = 3 sets × 3 passages)

**Set 186-190** (East Core Park trails):
- [ ] `passage-q186-190-a.PNG` — Email Greg Tanner → Jessica Marpone (1/7)
- [ ] `passage-q186-190-b.PNG` — Bài báo "Park Department Launches Volunteer Initiative" (12/7)
- [ ] `passage-q186-190-c.PNG` — Thông báo tháng Tám của Sở Công viên (Trail Cleanup Day)

**Set 191-195** (Ogunsanya Bolden art auction):
- [ ] `passage-q191-195-a.PNG` — Email Miranda Noonan thông báo đấu giá
- [ ] `passage-q191-195-b.PNG` — Bảng danh sách tác phẩm quyên góp
- [ ] `passage-q191-195-c.PNG` — Email Omonuwa Orou phản hồi

**Set 196-200** (Jerome Lennox / Franta Exports):
- [ ] `passage-q196-200-a.PNG` — Email Lennox ứng tuyển (7/5)
- [ ] `passage-q196-200-b.PNG` — Email Maeda mời phỏng vấn (23/5)
- [ ] `passage-q196-200-c.PNG` — Biển văn phòng Franta Exports Liverpool

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
(Get-ChildItem D:\toeic-files\test-04\ -Filter *.PNG).Count
# Phải = 38   (đường dẫn folder bạn tự chọn — không cần trong repo)
```

---

## Audio MP3 (54 files)

Folder đích: cùng folder ngoài repo với ảnh, hoặc folder riêng — đều OK.

| Part | Range câu | Pattern | Số file |
|---|---|---|---|
| 1 | 1-6 | `E26-T04-01.mp3` … `E26-T04-06.mp3` | 6 |
| 2 | 7-31 | `E26-T04-07.mp3` … `E26-T04-31.mp3` | 25 |
| 3 | 32-70 | `E26-T04-32-34.mp3`, `E26-T04-35-37.mp3`, …, `E26-T04-68-70.mp3` (group 3 câu) | 13 |
| 4 | 71-100 | `E26-T04-71-73.mp3`, …, `E26-T04-98-100.mp3` (group 3 câu) | 10 |

Total: **54 mp3**. Naming pattern khớp regex BE → tự link vào Question docs khi import.

---

## Bước import — gọn 2 bước, KHÔNG cần copy file vào repo

### Bước 1: Import đề (không cần media sẵn)

- Vào `/admin/tests` → nút "Import 1-click" hoặc gọi `POST /api/v1/tests/import`
- Body: nội dung file `server/seeds/data/ets-2026-test-04.json`
- BE auto tạo: 200 Question + 1 Full Test 04 + 7 Practice Sets (Part 1-7). Field `audioUrl` / `imageUrl` được fill placeholder local URL (`/audio/ets-2026/test-04/...`, `/images/ets-2026/test-04/...`) — chưa truy cập được, sẽ replace sau khi bulk upload.

### Bước 2: Crop ảnh + cắt audio (ngoài repo)

- 38 ảnh PNG + 54 mp3 → bất kỳ folder nào ngoài repo, vd `D:\toeic-files\test-04\`
- Tên file BẮT BUỘC khớp regex BE (xem các section trên) — sai 1 ký tự là file bị reject với report cụ thể trong UI

### Bước 3: Bulk upload qua admin UI

- Vào trang chi tiết Đề thi: `/admin/tests/:id`
- Tab "Media" → "Upload media" → chọn toàn bộ 92 file từ folder ngoài repo (drag & drop hoặc multi-select)
- BE: upload Cloudinary (concurrency 5, ~1 phút cho 92 file) + tự thay URL local → Cloudinary URL trong DB
- UI hiện report: file nào upload thành công, file nào fail (kèm lý do — thường là sai tên)

Sau bước 3, đề thi sẵn sàng cho user làm bài.
