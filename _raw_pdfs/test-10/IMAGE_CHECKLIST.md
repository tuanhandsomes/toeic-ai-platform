# Checklist ảnh cần crop cho ETS 2026 Test 10

**Tổng: 38 ảnh + 54 mp3** — danh sách dưới đây được extract từ `server/seeds/data/ets-2026-test-10.json`.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** bất kỳ thư mục nào trên máy bạn (vd `D:\toeic-files\test-10\`), KHÔNG cần trong repo.

---

## Part 1 — Photograph (6 ảnh)

- [ ] `01.PNG` — câu 1 (man bending over wires)
- [ ] `02.PNG` — câu 2 (laptop left open on desk)
- [ ] `03.PNG` — câu 3 (man holding up an umbrella)
- [ ] `04.PNG` — câu 4 (building with clock tower)
- [ ] `05.PNG` — câu 5 (bicycles lined up in a row)
- [ ] `06.PNG` — câu 6 (boats docked near shore)

---

## Part 3 — Graphic (3 ảnh)

- [ ] `graphic-q62-64.PNG` — bảng raffle prize theo mức đóng góp (xe đạp / vé kịch / máy ảnh / chuyến đi cuối tuần) (Q63 ref)
- [ ] `graphic-q65-67.PNG` — bảng giá bó hoa ($45 / $60 / $75 / $110, mẫu Harmony) (Q66 ref)
- [ ] `graphic-q68-70.PNG` — sơ đồ 4 silo lưu trữ ngô (Q69 ref)

---

## Part 4 — Graphic (2 ảnh)

- [ ] `graphic-q95-97.PNG` — mẫu đơn đăng ký 4 section (Q96 ref)
- [ ] `graphic-q98-100.PNG` — bảng giá đỗ xe ($3 / $5 / $7 / $9) (Q100 ref)

---

## Part 6 — Text completion passages (4 ảnh)

- [ ] `passage-q131-134.PNG` — Memo Paul Wandayi về thùng Flexmerge
- [ ] `passage-q135-138.PNG` — Bài báo về phim King of the Meer mùa 3
- [ ] `passage-q139-142.PNG` — Email Ken Belfant về cuộc thi công thức nấu ăn
- [ ] `passage-q143-146.PNG` — Brochure Bingo Imprint thiết kế sản phẩm quảng bá

---

## Part 7 — Single passages (10 ảnh)

- [ ] `passage-q147-148.PNG` — Khảo sát Crystal Brothers (Geraldine Hwang)
- [ ] `passage-q149-150.PNG` — Hampton Landscaping dịch vụ giao hàng
- [ ] `passage-q151-152.PNG` — Chat Hannah Fisk / Frank Gerlin về báo cáo ngân sách
- [ ] `passage-q153-154.PNG` — Email Travel Today thông báo giá vé (Seattle-Chicago / LA-NY)
- [ ] `passage-q155-157.PNG` — Email Sasha Lombardo gửi Rogelio về bản nháp sách nấu ăn (NIM-OT)
- [ ] `passage-q158-160.PNG` — Thư Aqua Voyage Cruise Lines mời hợp tác Yamaguchi
- [ ] `passage-q161-163.PNG` — Bài báo KMC nhận Giải Stellar Service
- [ ] `passage-q164-167.PNG` — Chat Alexa Balog / Maxwell Diego / Wade Nolan về hồ bơi
- [ ] `passage-q168-171.PNG` — Trang web Sagemont Services (NIM-OT)
- [ ] `passage-q172-175.PNG` — Bài báo MCAC triển lãm Ida Alonso

---

## Part 7 — Double passages (4 ảnh)

**Set 176-180** (Superb Hotels survey + Exelrate):
- [ ] `passage-q176-180-a.PNG` — Bảng khảo sát hài lòng Superb Hotels tháng 6
- [ ] `passage-q176-180-b.PNG` — Bài báo Exelrate chuyển trụ sở chính Toronto

**Set 181-185** (Richmond Supermarket cooking classes):
- [ ] `passage-q181-185-a.PNG` — Thông báo lớp nấu ăn tháng 8 tại Richmond
- [ ] `passage-q181-185-b.PNG` — Bài đánh giá của Astrid Klein

---

## Part 7 — Triple passages (9 ảnh)

**Set 186-190** (Dr. Robbins / ICVA / Sohn):
- [ ] `passage-q186-190-a.PNG` — Bài báo bổ nhiệm Dr. Jennifer Robbins
- [ ] `passage-q186-190-b.PNG` — Chương trình hội nghị ICVA ngày 17/4
- [ ] `passage-q186-190-c.PNG` — Email Paulina Raskin cảm ơn Dr. Sohn

**Set 191-195** (Freewheel Oasis trade-in/consignment):
- [ ] `passage-q191-195-a.PNG` — Trang web Freewheel Oasis chương trình
- [ ] `passage-q191-195-b.PNG` — Email Nicola Johnson yêu cầu hẹn
- [ ] `passage-q191-195-c.PNG` — Email phản hồi từ Freewheel (Mr. Moran)

**Set 196-200** (Onboarding Yumiko Kuroda):
- [ ] `passage-q196-200-a.PNG` — Email Simon Cady gửi Yumiko Kuroda
- [ ] `passage-q196-200-b.PNG` — Checklist biểu mẫu nhân viên mới
- [ ] `passage-q196-200-c.PNG` — Email phản hồi của Yumiko Kuroda

---

## Tips khi crop

1. Crop vùng vừa đủ, chừa lề trắng 5-10px
2. Resolution ~150 DPI là đủ
3. Save PNG (không JPG)
4. Tên file viết HOA `.PNG`
5. Multi-passage a/b/c: passage xuất hiện trước trong PDF = a, kế tiếp = b, cuối = c

## Verify sau khi crop

```powershell
(Get-ChildItem D:\toeic-files\test-10\ -Filter *.PNG).Count
# Phải = 38
```

---

## Audio MP3 (54 files)

| Part | Range | Pattern | Số file |
|---|---|---|---|
| 1 | 1-6 | `E26-T10-01.mp3` … `E26-T10-06.mp3` | 6 |
| 2 | 7-31 | `E26-T10-07.mp3` … `E26-T10-31.mp3` | 25 |
| 3 | 32-70 | `E26-T10-32-34.mp3` … `E26-T10-68-70.mp3` (group 3 câu) | 13 |
| 4 | 71-100 | `E26-T10-71-73.mp3` … `E26-T10-98-100.mp3` (group 3 câu) | 10 |

Total: **54 mp3**.

---

## Bước import — 3 bước, KHÔNG cần copy file vào repo

### Bước 1: Import đề
- Vào `/admin/tests` → "Tải lên cả đề thi" → upload `ets-2026-test-10.json`

### Bước 2: Crop ảnh + cắt audio ngoài repo

### Bước 3: Bulk upload qua admin UI
- Trang chi tiết đề → tab "Media" → "Upload media" → chọn 92 file
- BE upload Cloudinary + tự gắn vào Question theo tên file
