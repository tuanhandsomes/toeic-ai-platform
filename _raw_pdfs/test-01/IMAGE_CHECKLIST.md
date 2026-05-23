# Checklist ảnh cần crop cho ETS 2026 Test 01

**Total: 38 ảnh** (Part 1 đã có 6 → còn 32 cần crop)

**Tool đề xuất:** Snipping Tool Windows (`Win + Shift + S`) → chọn vùng → Ctrl+V vào Paint → Save as PNG.

**Folder đích:** `server/public/images/ets-2026/test-01/`

Nếu folder chưa có, tạo trước:
```powershell
New-Item -Path "server\public\images\ets-2026\test-01" -ItemType Directory -Force
```

---

## Part 1 — Photograph (6 ảnh, 1 ảnh/câu) ✅ ĐÃ CÓ

- [x] `01.PNG` — câu 1 (người phụ nữ mặc jacket)
- [x] `02.PNG` — câu 2 (người nhìn vào sách)
- [x] `03.PNG` — câu 3 (đèn chiếu sáng treo trần)
- [x] `04.PNG` — câu 4 (thùng gỗ chứa rau củ)
- [x] `05.PNG` — câu 5 (dụng cụ sơn bày trên sàn)
- [x] `06.PNG` — câu 6 (nước đọng trên đường)

---

## Part 3-4 — Graphic ("Look at the graphic") — 5 ảnh

Source: LC.pdf, phần Part 3 và Part 4. Crop chart/map/sơ đồ kèm câu hỏi.

- [ ] `graphic-q62-64.png` — Part 3, conversation câu 62-64 (Q63 ref to graphic)
- [ ] `graphic-q65-67.png` — Part 3, conversation câu 65-67 (Q66 ref — Web Site Outline)
- [ ] `graphic-q68-70.png` — Part 3, conversation câu 68-70 (Q69 ref — Parking map)
- [ ] `graphic-q95-97.png` — Part 4, talk câu 95-97 (Q96 ref — Floor occupation)
- [ ] `graphic-q98-100.png` — Part 4, talk câu 98-100 (Q99 ref — Mine sites)

---

## Part 6 — Text completion passages (4 ảnh)

Mỗi passage có 4 câu hỏi điền từ. Crop nguyên passage (kèm cả các blank `-------`).

- [ ] `passage-q131-134.png` — advertisement (Riessler Landscaping)
- [ ] `passage-q135-138.png` — letter (gửi bà Mulligan, kỷ niệm 30 năm)
- [ ] `passage-q139-142.png` — letter/email (gửi bà Berman, về phòng khách)
- [ ] `passage-q143-146.png` — (xem PDF để xác định loại)

---

## Part 7 — Single passages (10 ảnh)

Source: RC.pdf, phần Part 7. Crop nguyên passage (chỉ phần đề bài, không kèm câu hỏi).

- [ ] `passage-q147-148.png` — notice
- [ ] `passage-q149-150.png` — text-message chain
- [ ] `passage-q151-152.png` — e-mail
- [ ] `passage-q153-154.png` — (xem PDF)
- [ ] `passage-q155-157.png`
- [ ] `passage-q158-160.png`
- [ ] `passage-q161-163.png` — article
- [ ] `passage-q164-167.png` — advertisement
- [ ] `passage-q168-171.png` — article
- [ ] `passage-q172-175.png` — online chat discussion

---

## Part 7 — Double passages (4 ảnh = 2 sets × 2 passages)

Mỗi set có 2 passage, crop riêng từng cái.

**Set 176-180:**
- [ ] `passage-q176-180-a.png` — passage thứ 1
- [ ] `passage-q176-180-b.png` — passage thứ 2

**Set 181-185:**
- [ ] `passage-q181-185-a.png` — passage thứ 1
- [ ] `passage-q181-185-b.png` — passage thứ 2

---

## Part 7 — Triple passages (9 ảnh = 3 sets × 3 passages)

**Set 186-190:**
- [ ] `passage-q186-190-a.png`
- [ ] `passage-q186-190-b.png`
- [ ] `passage-q186-190-c.png`

**Set 191-195:**
- [ ] `passage-q191-195-a.png`
- [ ] `passage-q191-195-b.png`
- [ ] `passage-q191-195-c.png`

**Set 196-200:**
- [ ] `passage-q196-200-a.png`
- [ ] `passage-q196-200-b.png`
- [ ] `passage-q196-200-c.png`

---

## Tips khi crop

1. **Crop vùng hẹp vừa đủ** — chừa lề trắng 5-10px cho thoáng
2. **Resolution ~150 DPI** là đủ — không cần quá nét (file sẽ nặng)
3. **Save PNG** (không JPG) — text trong ảnh sẽ rõ hơn
4. **Đặt tên đúng từ đầu** — đỡ phải rename sau
5. **Part 7 multi-passage** (a/b/c): passage nào xuất hiện trước trong PDF = a, kế tiếp = b, cuối = c

## Schema note (mình sẽ xử lý)

Hiện Question schema chỉ có 1 `imageUrl`. Khi vào Part 7 multi-passage, mình sẽ:
- Đổi `content.imageUrl` thành `content.imageUrls: [String]`
- Update [seedRealTest.js](../server/seeds/seedRealTest.js) để map array
- Update FE component Part 7 để render multi `<img>` stacked

Bạn không cần lo phần này — chỉ tập trung crop ảnh.
