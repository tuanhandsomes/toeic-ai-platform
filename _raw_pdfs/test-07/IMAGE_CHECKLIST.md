# Checklist ảnh cần crop cho ETS 2026 Test 07

**Tổng: 38 ảnh + 54 mp3** — danh sách dưới đây được extract từ `server/seeds/data/ets-2026-test-07.json`.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** bất kỳ thư mục nào trên máy bạn (vd `D:\toeic-files\test-07\`), KHÔNG cần trong repo.

---

## Part 1 — Photograph (6 ảnh)

- [ ] `01.PNG` — câu 1 (woman looking at newspaper)
- [ ] `02.PNG` — câu 2 (tire leaning against car)
- [ ] `03.PNG` — câu 3 (man pushing cart toward doorway)
- [ ] `04.PNG` — câu 4 (woman wearing helmet)
- [ ] `05.PNG` — câu 5 (umbrellas opened in outdoor dining area)
- [ ] `06.PNG` — câu 6 (office chair pushed under desk)

---

## Part 3 — Graphic (3 ảnh)

- [ ] `graphic-q62-64.PNG` — lịch tuần đội thực tập sinh (Q64 ref)
- [ ] `graphic-q65-67.PNG` — 4 mẫu logo kem chống nắng (Q66 ref)
- [ ] `graphic-q68-70.PNG` — lịch trồng cây theo mùa (Q69 ref)

---

## Part 4 — Graphic (2 ảnh)

- [ ] `graphic-q95-97.PNG` — bản đồ khu vực thành phố / trạm xe buýt (Q97 ref)
- [ ] `graphic-q98-100.PNG` — bảng giá các loại tulip (Q100 ref)

---

## Part 6 — Text completion passages (4 ảnh)

- [ ] `passage-q131-134.PNG` — Game Night tại Chez Tournoi
- [ ] `passage-q135-138.PNG` — Email gia hạn hợp đồng thuê Kanarak Realty
- [ ] `passage-q139-142.PNG` — Lựa chọn chỗ ở tại bán đảo Devegas
- [ ] `passage-q143-146.PNG` — Thông báo ký điện tử Nelsign

---

## Part 7 — Single passages (10 ảnh)

- [ ] `passage-q147-148.PNG` — Phiếu giảm giá Truli (phô mai + bánh quy)
- [ ] `passage-q149-150.PNG` — Tin nhắn Brice's Ice Creamery rewards
- [ ] `passage-q151-152.PNG` — Email Hopper Medical Center về lỡ hẹn
- [ ] `passage-q153-154.PNG` — Chat Ikeda / Lorck (điều hoà văn phòng)
- [ ] `passage-q155-157.PNG` — Trang About Us của Qualitekk Research
- [ ] `passage-q158-160.PNG` — Memo Swansea Spotlight Theatre mở cửa trở lại
- [ ] `passage-q161-163.PNG` — Bài giới thiệu nhóm Building Blocks (Milos Tek)
- [ ] `passage-q164-167.PNG` — Bài báo Mehan Motors bổ nhiệm CEO Dana Loeb
- [ ] `passage-q168-171.PNG` — Quảng cáo Dan's Specialty Bicycles
- [ ] `passage-q172-175.PNG` — Chat về Bam Booster (Internet booster)

---

## Part 7 — Double passages (4 ảnh)

**Set 176-180** (Surf Bird Beachwear hiring):
- [ ] `passage-q176-180-a.PNG` — Email Ashley Nguyen → Mark Schroeder
- [ ] `passage-q176-180-b.PNG` — Quảng cáo tuyển nhân viên mùa hè

**Set 181-185** (Ventana Airlines Trak-4):
- [ ] `passage-q181-185-a.PNG` — Email CEO Kota Adachi gửi ban điều hành
- [ ] `passage-q181-185-b.PNG` — Blog du lịch của Ken Ogawa

---

## Part 7 — Triple passages (9 ảnh)

**Set 186-190** (Oxton Science Museum trip):
- [ ] `passage-q186-190-a.PNG` — Thông báo đóng cửa Gartner Wing
- [ ] `passage-q186-190-b.PNG` — Email Tae-Ho Mun mời thực tập sinh đi tham quan
- [ ] `passage-q186-190-c.PNG` — Lịch trình phòng 203 ngày 19/8

**Set 191-195** (Protecto Umbrella Wrapping):
- [ ] `passage-q191-195-a.PNG` — Quảng cáo máy bọc ô PUW
- [ ] `passage-q191-195-b.PNG` — Bảng giá sản phẩm + túi
- [ ] `passage-q191-195-c.PNG` — Đánh giá khách hàng (Mr. Barr)

**Set 196-200** (Croydon Construction):
- [ ] `passage-q196-200-a.PNG` — Trang web Croydon Construction
- [ ] `passage-q196-200-b.PNG` — Email Zack Makoare về đơn cửa sổ trễ
- [ ] `passage-q196-200-c.PNG` — Email phản hồi Sanaa Rahija

---

## Tips khi crop

1. Crop vùng vừa đủ, chừa lề trắng 5-10px
2. Resolution ~150 DPI là đủ
3. Save PNG (không JPG)
4. Tên file viết HOA `.PNG`
5. Multi-passage a/b/c: passage xuất hiện trước trong PDF = a, kế tiếp = b, cuối = c

## Verify sau khi crop

```powershell
(Get-ChildItem D:\toeic-files\test-07\ -Filter *.PNG).Count
# Phải = 38
```

---

## Audio MP3 (54 files)

| Part | Range | Pattern | Số file |
|---|---|---|---|
| 1 | 1-6 | `E26-T07-01.mp3` … `E26-T07-06.mp3` | 6 |
| 2 | 7-31 | `E26-T07-07.mp3` … `E26-T07-31.mp3` | 25 |
| 3 | 32-70 | `E26-T07-32-34.mp3` … `E26-T07-68-70.mp3` (group 3 câu) | 13 |
| 4 | 71-100 | `E26-T07-71-73.mp3` … `E26-T07-98-100.mp3` (group 3 câu) | 10 |

Total: **54 mp3**.

---

## Bước import — 3 bước, KHÔNG cần copy file vào repo

### Bước 1: Import đề
- Vào `/admin/tests` → "Tải lên cả đề thi" → upload `ets-2026-test-07.json`

### Bước 2: Crop ảnh + cắt audio ngoài repo

### Bước 3: Bulk upload qua admin UI
- Trang chi tiết đề → tab "Media" → "Upload media" → chọn 92 file
- BE upload Cloudinary + tự gắn vào Question theo tên file
