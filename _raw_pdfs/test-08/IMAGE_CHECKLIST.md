# Checklist ảnh cần crop cho ETS 2026 Test 08

**Tổng: 38 ảnh + 54 mp3** — danh sách dưới đây được extract từ `server/seeds/data/ets-2026-test-08.json`.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** bất kỳ thư mục nào trên máy bạn (vd `D:\toeic-files\test-08\`), KHÔNG cần trong repo.

---

## Part 1 — Photograph (6 ảnh)

- [ ] `01.PNG` — câu 1 (furniture on covered patio)
- [ ] `02.PNG` — câu 2 (woman walking past crosswalk)
- [ ] `03.PNG` — câu 3 (man standing behind counter)
- [ ] `04.PNG` — câu 4 (desks / fence visible through window)
- [ ] `05.PNG` — câu 5 (two women, one holding up a book)
- [ ] `06.PNG` — câu 6 (people climbing stairs)

---

## Part 3 — Graphic (3 ảnh)

- [ ] `graphic-q62-64.PNG` — bảng giá lốp xe (City Cruiser / Snow King / High Summit / Sport Plus) (Q63 ref)
- [ ] `graphic-q65-67.PNG` — bảng giá gối ($20 / $25 / $30 / $45) (Q66 ref)
- [ ] `graphic-q68-70.PNG` — sơ đồ 4 bước quy trình bán hàng (Q70 ref)

---

## Part 4 — Graphic (2 ảnh)

- [ ] `graphic-q95-97.PNG` — bảng tồn kho mẫu tủ lạnh (JH-883 / JK-966 / LH-655 / LK-303) (Q96 ref)
- [ ] `graphic-q98-100.PNG` — lịch tour Wilson Park (10:00 / 12:30 / 1:45 / 3:30) (Q99 ref)

---

## Part 6 — Text completion passages (4 ảnh)

- [ ] `passage-q131-134.PNG` — Chỉ dẫn đến Phòng Thí nghiệm Carrill
- [ ] `passage-q135-138.PNG` — Mapleglen University MBA gia hạn nộp hồ sơ
- [ ] `passage-q139-142.PNG` — Memo Seek Kang cập nhật ứng dụng nhà hàng
- [ ] `passage-q143-146.PNG` — Đánh giá máy ảnh Tipti PX200 của Sonja Stanberry

---

## Part 7 — Single passages (10 ảnh)

- [ ] `passage-q147-148.PNG` — Email Karina Rybak — tiệc chia tay Sun-Yi Pak
- [ ] `passage-q149-150.PNG` — Tờ rơi Johan's Power Washing
- [ ] `passage-q151-152.PNG` — Chat Mei Kim / Stan Snyder về ăn trưa
- [ ] `passage-q153-154.PNG` — Thông báo Westover Zoo (vé + giao thông)
- [ ] `passage-q155-157.PNG` — Bài báo Hillsdale 2 dự án xây dựng
- [ ] `passage-q158-160.PNG` — Bảng đầu tư Mirei Hair Care (5 lựa chọn)
- [ ] `passage-q161-163.PNG` — Chính sách hành lý Barbados Airlines
- [ ] `passage-q164-167.PNG` — Madson Industrial Supply — sự kiện nhân viên ảo
- [ ] `passage-q168-171.PNG` — Thỏa thuận diễn giả Grotel ký với Jack Kolman
- [ ] `passage-q172-175.PNG` — Chat Brett / Lianne / Shruthi về làm video công ty

---

## Part 7 — Double passages (4 ảnh)

**Set 176-180** (Tiểu sử Ibra Maalim):
- [ ] `passage-q176-180-a.PNG` — Quảng cáo sách "A Life in the Spotlight" của Helena Mackay
- [ ] `passage-q176-180-b.PNG` — Bài đánh giá của Salvador Guerrero (4/5 sao)

**Set 181-185** (Big Strike Lanes):
- [ ] `passage-q181-185-a.PNG` — Quảng cáo Big Strike Lanes + 2 gói deal
- [ ] `passage-q181-185-b.PNG` — Bài đánh giá của Sophie Shaw

---

## Part 7 — Triple passages (9 ảnh)

**Set 186-190** (Winglite Airlines tại Arlford):
- [ ] `passage-q186-190-a.PNG` — Biên bản họp hội đồng thành phố Arlford 14/1
- [ ] `passage-q186-190-b.PNG` — Bài báo Winglite Airlines bắt đầu dịch vụ (18/3)
- [ ] `passage-q186-190-c.PNG` — Email Stuart Girard hỏi thuê căn hộ

**Set 191-195** (Forklift Training Academy):
- [ ] `passage-q191-195-a.PNG` — Giới thiệu khóa đào tạo + cấp chứng chỉ
- [ ] `passage-q191-195-b.PNG` — Đơn đăng ký Philippe Durand
- [ ] `passage-q191-195-c.PNG` — Bài đánh giá Julie Dye (4/5 sao)

**Set 196-200** (Stickers Be Yours — Nick Beats):
- [ ] `passage-q196-200-a.PNG` — Email Michael Cheung gửi Janice Bledstone
- [ ] `passage-q196-200-b.PNG` — Bảng giá nhãn dán vinyl Nick Beats
- [ ] `passage-q196-200-c.PNG` — Email phản hồi của Janice Bledstone đặt thêm

---

## Tips khi crop

1. Crop vùng vừa đủ, chừa lề trắng 5-10px
2. Resolution ~150 DPI là đủ
3. Save PNG (không JPG)
4. Tên file viết HOA `.PNG`
5. Multi-passage a/b/c: passage xuất hiện trước trong PDF = a, kế tiếp = b, cuối = c

## Verify sau khi crop

```powershell
(Get-ChildItem D:\toeic-files\test-08\ -Filter *.PNG).Count
# Phải = 38
```

---

## Audio MP3 (54 files)

| Part | Range | Pattern | Số file |
|---|---|---|---|
| 1 | 1-6 | `E26-T08-01.mp3` … `E26-T08-06.mp3` | 6 |
| 2 | 7-31 | `E26-T08-07.mp3` … `E26-T08-31.mp3` | 25 |
| 3 | 32-70 | `E26-T08-32-34.mp3` … `E26-T08-68-70.mp3` (group 3 câu) | 13 |
| 4 | 71-100 | `E26-T08-71-73.mp3` … `E26-T08-98-100.mp3` (group 3 câu) | 10 |

Total: **54 mp3**.

---

## Bước import — 3 bước, KHÔNG cần copy file vào repo

### Bước 1: Import đề
- Vào `/admin/tests` → "Tải lên cả đề thi" → upload `ets-2026-test-08.json`

### Bước 2: Crop ảnh + cắt audio ngoài repo

### Bước 3: Bulk upload qua admin UI
- Trang chi tiết đề → tab "Media" → "Upload media" → chọn 92 file
- BE upload Cloudinary + tự gắn vào Question theo tên file
