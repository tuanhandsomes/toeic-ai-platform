# Checklist ảnh cần crop cho ETS 2026 Test 06

**Tổng: 38 ảnh + 54 mp3** — danh sách dưới đây được extract từ `server/seeds/data/ets-2026-test-06.json`.

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** bất kỳ thư mục nào trên máy bạn (vd `D:\toeic-files\test-06\`), KHÔNG cần trong repo.

---

## Part 1 — Photograph (6 ảnh)

- [ ] `01.PNG` — câu 1 (dining area empty)
- [ ] `02.PNG` — câu 2 (man facing a machine)
- [ ] `03.PNG` — câu 3 (people walking past a bench)
- [ ] `04.PNG` — câu 4 (woman holding water bottle)
- [ ] `05.PNG` — câu 5 (woman talking to worker at a desk)
- [ ] `06.PNG` — câu 6 (lamps lighting seating areas)

---

## Part 3 — Graphic (3 ảnh)

- [ ] `graphic-q62-64.PNG` — sơ đồ bàn tiệc kỷ niệm 10 năm (Q64 ref)
- [ ] `graphic-q65-67.PNG` — lịch giờ khởi hành xe buýt Centerton (Q66 ref)
- [ ] `graphic-q68-70.PNG` — bảng giá công tắc điện theo amp (Q70 ref)

---

## Part 4 — Graphic (2 ảnh)

- [ ] `graphic-q95-97.PNG` — bản đồ các khu vực phục vụ xe trung chuyển Lakepoint (Q97 ref)
- [ ] `graphic-q98-100.PNG` — bản đồ địa điểm tổ chức workshop khảo cổ (Q99 ref)

---

## Part 6 — Text completion passages (4 ảnh)

- [ ] `passage-q131-134.PNG` — Bicycles on Buses (Travelbee)
- [ ] `passage-q135-138.PNG` — Crystal Technologies escape room training
- [ ] `passage-q139-142.PNG` — Email Yardley River Dental về đóng bãi đỗ xe
- [ ] `passage-q143-146.PNG` — Notice Randall-Humboldt mail room cuts

---

## Part 7 — Single passages (10 ảnh)

- [ ] `passage-q147-148.PNG` — Bumbleberry Farm blueberry picking ad
- [ ] `passage-q149-151.PNG` — Bài báo "Tin Prices May Improve"
- [ ] `passage-q152-153.PNG` — Thư Langdale Exterior Solutions
- [ ] `passage-q154-157.PNG` — Thư Katsunori Sanu rời chung cư
- [ ] `passage-q158-159.PNG` — Email Diedrich Industries xin lỗi delay
- [ ] `passage-q160-161.PNG` — Chat Porter / Warner (open house)
- [ ] `passage-q162-164.PNG` — Blog Games Now về in 3D
- [ ] `passage-q165-168.PNG` — Repose Lounge tại sân bay QRN
- [ ] `passage-q169-171.PNG` — Misford Green Awareness Week article
- [ ] `passage-q172-175.PNG` — Chat Radiss / Karp / Nusapatra (newsletter)

---

## Part 7 — Double passages (4 ảnh)

**Set 176-180** (Best Design magazine):
- [ ] `passage-q176-180-a.PNG` — Email Liza Pacurar tổng kết cuộc họp
- [ ] `passage-q176-180-b.PNG` — Email Karine Xu phản hồi

**Set 181-185** (Weber Richter party):
- [ ] `passage-q181-185-a.PNG` — Email Maggie Rosen mời phát biểu
- [ ] `passage-q181-185-b.PNG` — Email Shaan Iqbal nhận lời

---

## Part 7 — Triple passages (9 ảnh)

**Set 186-190** (Alamito Botanical Society):
- [ ] `passage-q186-190-a.PNG` — Thông báo Gorgeous Gardens Tour
- [ ] `passage-q186-190-b.PNG` — Email Rebecca Olton hỏi tham gia
- [ ] `passage-q186-190-c.PNG` — Web page lịch các buổi thuyết giảng

**Set 191-195** (Terra Jaunts / Pink Ridge):
- [ ] `passage-q191-195-a.PNG` — Quảng cáo Terra Jaunts cho chủ đất
- [ ] `passage-q191-195-b.PNG` — Email Oliver Jeong phản hồi Newsom
- [ ] `passage-q191-195-c.PNG` — Email Celia Newsom từ chối

**Set 196-200** (A-Quality Electronics):
- [ ] `passage-q196-200-a.PNG` — Email Eileen Wrenn thông báo chuyến thăm
- [ ] `passage-q196-200-b.PNG` — Lịch trình dự thảo họp 14/10
- [ ] `passage-q196-200-c.PNG` — Email Deborah Powell đề xuất bóng chày

---

## Tips khi crop

1. Crop vùng vừa đủ, chừa lề trắng 5-10px
2. Resolution ~150 DPI là đủ
3. Save PNG (không JPG)
4. Tên file viết HOA `.PNG`
5. Multi-passage a/b/c: passage xuất hiện trước trong PDF = a, kế tiếp = b, cuối = c

## Verify sau khi crop

```powershell
(Get-ChildItem D:\toeic-files\test-06\ -Filter *.PNG).Count
# Phải = 38
```

---

## Audio MP3 (54 files)

| Part | Range | Pattern | Số file |
|---|---|---|---|
| 1 | 1-6 | `E26-T06-01.mp3` … `E26-T06-06.mp3` | 6 |
| 2 | 7-31 | `E26-T06-07.mp3` … `E26-T06-31.mp3` | 25 |
| 3 | 32-70 | `E26-T06-32-34.mp3` … `E26-T06-68-70.mp3` (group 3 câu) | 13 |
| 4 | 71-100 | `E26-T06-71-73.mp3` … `E26-T06-98-100.mp3` (group 3 câu) | 10 |

Total: **54 mp3**.

---

## Bước import — 3 bước, KHÔNG cần copy file vào repo

### Bước 1: Import đề
- Vào `/admin/tests` → "Tải lên cả đề thi" → upload `ets-2026-test-06.json`
- BE tự tạo 200 Question + 1 Full Test 06 + 7 Practice Sets với placeholder URL.

### Bước 2: Crop ảnh + cắt audio ngoài repo

### Bước 3: Bulk upload qua admin UI
- Trang chi tiết đề → tab "Media" → "Upload media" → chọn 92 file
- BE upload Cloudinary + tự gắn vào Question theo tên file
