# LAB 04 — MODIFY & EXTEND OFFLINE-FIRST SURVEY
## Chỉnh sửa và mở rộng project demo Week 4

> **Môn:** Phát triển ứng dụng di động đa nền tảng  
> **Tuần:** 4  
> **Thời lượng dự kiến:** 2 tiết  
> **Sản phẩm:** Bản mở rộng từ project demo `VKU Field Survey`

---

# 1. Mục tiêu

Lab này **không yêu cầu viết lại toàn bộ project từ đầu**.

Sinh viên sử dụng project demo Week 4 đã chạy hoàn chỉnh, sau đó:

1. đọc lại cấu trúc project;
2. chỉnh sửa schema của form;
3. thêm một skip logic mới;
4. mở rộng thông tin hiển thị của local submissions;
5. thêm một extension nhỏ;
6. kiểm tra lại toàn bộ luồng Offline → Pending → Synced.

Mục tiêu chính:

> Hiểu và sửa được một hệ thống offline-first đã có sẵn, thay vì chỉ chạy lại code mẫu.

---

# 2. Project bắt đầu

Sử dụng project demo hoàn chỉnh Week 4.

Project đã có sẵn:

```text
Dynamic Form
Skip Logic
Validation
IndexedDB
UUID
Local-first submission
Pending queue
Sync engine
Retry
Mock API
Service Worker
Cache API
Offline support
```

Luồng chính:

```text
Schema
  ↓
Dynamic Form
  ↓
Submit
  ↓
IndexedDB
  ↓
pending
  ↓
Online
  ↓
POST API
  ↓
synced
```

---

# 3. Chạy project trước khi sửa

Cài package:

```bash
npm install
```

Terminal 1:

```bash
npm run api
```

Terminal 2:

```bash
npm run dev
```

Mở URL Vite cung cấp, thường là:

```text
http://localhost:5173
```

Trước khi sửa code, cần kiểm tra demo gốc chạy đúng:

```text
Form render được
IndexedDB lưu được
Offline submit → pending
Online lại → synced
```

---

# 4. Yêu cầu 1 — Mở rộng schema của form

Project demo hiện có các field cơ bản như:

```text
facility_name
condition
damage_description
priority
```

Hãy sửa form thành một phiên bản chi tiết hơn.

Bắt buộc có tối thiểu các field:

```text
facility_name
building
facility_type
condition
damage_description
priority
note
```

Gợi ý:

```text
facility_name
→ Tên khu vực / phòng

building
→ Tòa nhà
→ Khu A / Khu B / Khu C

facility_type
→ Loại hạng mục
→ Điện / Nước / Bàn ghế / Thiết bị / Khác

condition
→ Tốt / Hư hỏng

damage_description
→ Mô tả hư hỏng

priority
→ Thấp / Trung bình / Cao

note
→ Ghi chú thêm
```

## Điều kiện

Không hardcode toàn bộ form trực tiếp trong `index.html`.

Form vẫn phải được sinh theo mô hình:

```text
Schema
→ FormRenderer
→ UI
```

### PASS khi

Thay label/options trong schema thì UI thay đổi tương ứng.

---

# 5. Yêu cầu 2 — Thêm một Skip Logic mới

Ngoài skip logic đã có:

```text
condition = damaged
→ hiện damage_description
→ hiện priority
```

hãy thêm **ít nhất một conditional field mới**.

Có thể chọn một trong các gợi ý sau.

## Gợi ý A

```text
facility_type = other
→ hiện other_facility_name
```

## Gợi ý B

```text
priority = high
→ hiện action_required
```

## Gợi ý C

```text
building = other
→ hiện building_name
```

Có thể tự thiết kế rule khác nếu hợp lý.

## Yêu cầu

Conditional field phải được khai báo trong schema bằng `showIf` hoặc cơ chế tương đương.

Ví dụ:

```javascript
showIf: {
  field: "facility_type",
  equals: "other"
}
```

### PASS khi

Đổi giá trị của field điều kiện thì UI hiện/ẩn đúng.

---

# 6. Yêu cầu 3 — Xóa dữ liệu của field đã bị ẩn

Tình huống:

```text
condition = damaged
→ nhập damage_description

sau đó đổi:
condition = good
```

Khi đó:

```text
damage_description
```

không được tiếp tục nằm trong dữ liệu submission.

Tương tự với conditional field mới vừa thêm.

### PASS khi

Sau khi field bị ẩn, dữ liệu cũ của field đó không còn trong:

```javascript
answers
```

và không được lưu vào IndexedDB.

---

# 7. Yêu cầu 4 — Mở rộng danh sách Local Submissions

Project demo đã hiển thị một số thông tin như:

```text
UUID
syncStatus
syncAttempts
lastError
syncedAt
```

Hãy mở rộng card/list của mỗi submission để hiển thị thêm tối thiểu:

```text
Tên khu vực / phòng
Tòa nhà
Loại hạng mục
Tình trạng
Thời gian tạo
```

Ví dụ:

```text
Phòng A201

Tòa nhà: Khu A
Loại: Thiết bị
Tình trạng: Hư hỏng
Created: 2026-09-13 14:20

Status: pending
UUID: ...
```

### PASS khi

Thông tin được đọc từ record trong IndexedDB, không hardcode.

---

# 8. Yêu cầu 5 — Thêm một Extension

Chọn **một** trong các extension dưới đây.

## Extension A — Pending Counter

Hiển thị:

```text
Pending: 3
Synced: 5
```

Counter phải cập nhật lại sau khi:

```text
Save
Sync
Reload
```

---

## Extension B — Disable Sync Button

Nút:

```text
Sync pending
```

chỉ được enable khi:

```text
pendingCount > 0
```

Nếu không có record pending:

```text
button.disabled = true
```

---

## Extension C — Filter Submission List

Thêm filter:

```text
All
Pending
Synced
```

Khi chọn filter, danh sách local thay đổi tương ứng.

---

## Extension D — Last Sync Information

Hiển thị:

```text
Last successful sync:
13/09/2026 14:30
```

Chỉ cập nhật khi có ít nhất một submission sync thành công.

---

## Extension E — Tự đề xuất

Có thể làm một extension khác nếu:

- không phá kiến trúc hiện tại;
- liên quan trực tiếp đến local data / sync / UI state;
- có thể demo rõ ràng.

---

# 9. Checkpoint bắt buộc — Offline-first vẫn hoạt động

Sau khi hoàn thành các thay đổi trên, phải kiểm tra lại luồng chính.

## Bước 1 — Online

Chạy:

```bash
npm run api
npm run dev
```

Kiểm tra form mới render đúng.

---

## Bước 2 — Offline

Trong DevTools:

```text
Network
→ Offline
```

Nhập ít nhất 2 submission khác nhau.

Bấm:

```text
Lưu khảo sát
```

### Kết quả mong đợi

```text
IndexedDB
→ submissions
→ có 2 record mới
```

và:

```text
syncStatus = pending
```

---

## Bước 3 — Reload khi Offline

Bấm:

```text
F5
```

### PASS khi

```text
App vẫn mở
Dynamic Form vẫn render
Dữ liệu local vẫn còn
Có thể tiếp tục nhập survey mới
```

---

## Bước 4 — Online lại

Chuyển:

```text
Network
→ No throttling
```

### PASS khi

Network xuất hiện:

```text
POST /api/submissions
→ 201 Created
```

và:

```text
pending
→ synced
```

---

# 10. Kiểm tra IndexedDB

Mở:

```text
Application
→ IndexedDB
→ vku-field-survey-db
→ submissions
```

Chọn:

```text
submissions
```

Không chọn:

```text
syncStatus
```

vì đó là Index.

Mỗi record cần giữ được các thông tin chính:

```text
id
formId
answers
createdAt
syncStatus
syncAttempts
lastError
syncedAt
```

---

# 11. Kiểm tra trường hợp API không hoạt động

Không bắt buộc sửa thêm sync engine.

Chỉ cần hiểu và test lại behaviour hiện có.

Giữ browser Online:

```text
Network
→ No throttling
```

Nhưng dừng API Server.

Sau đó nhập một survey mới.

### Kết quả đúng

```text
Local save vẫn thành công
sync fail
record vẫn pending
syncAttempts tăng
lastError có dữ liệu
```

Ghi nhớ:

```text
navigator.onLine = true
```

không có nghĩa:

```text
API chắc chắn hoạt động
```

---

# 12. Production Offline Check

Sau khi hoàn thành bài:

```bash
npm run build
npm run preview
```

Mở:

```text
http://localhost:4173
```

Test:

```text
Online
→ mở app
→ F5 một lần
→ chuyển Offline
→ F5
```

### PASS khi

```text
Dynamic Form vẫn hiện
Skip Logic vẫn hoạt động
Có thể lưu IndexedDB
Submission vẫn thành pending
```

---

# 13. Yêu cầu nộp bài

Nộp:

1. Source code project đã chỉnh sửa.
2. `README.md` ngắn mô tả các thay đổi.
3. Các ảnh minh chứng theo yêu cầu bên dưới.

---

# 14. Ảnh minh chứng

## Ảnh 1 — Form mới

Cho thấy:

- các field mới;
- giao diện render từ schema.

---

## Ảnh 2 — Skip Logic mới

Cho thấy conditional field mới xuất hiện.

Ví dụ:

```text
facility_type = other
→ other_facility_name hiện
```

---

## Ảnh 3 — IndexedDB

Cho thấy:

```text
submissions
```

có ít nhất 2 record:

```text
syncStatus = pending
```

---

## Ảnh 4 — Offline + Reload

Cho thấy:

- app vẫn mở;
- form mới vẫn render;
- local submissions vẫn còn.

---

## Ảnh 5 — Synced

Cho thấy:

```text
pending
→ synced
```

và Network:

```text
POST /api/submissions
→ 201
```

---

## Ảnh 6 — Extension

Cho thấy extension đã chọn:

```text
Pending Counter
hoặc
Disable Sync Button
hoặc
Filter
hoặc
Last Sync
```

---

# 17. Checklist trước khi nộp

- [ ] Form vẫn render từ schema
- [ ] Có đủ các field mới
- [ ] Có ít nhất một skip logic mới
- [ ] Field bị ẩn không giữ answer cũ
- [ ] Local submission hiển thị thêm thông tin
- [ ] Có một extension hoàn chỉnh
- [ ] Offline submit → pending
- [ ] Offline reload → dữ liệu vẫn còn
- [ ] Online → synced
- [ ] IndexedDB hoạt động đúng
- [ ] Production Preview vẫn chạy Offline
- [ ] Có đủ ảnh minh chứng

---

# 18. Phần không cần làm lại

Không cần viết lại từ đầu:

```text
IndexedDB engine
Service Worker
Cache API
Sync engine
Retry logic
UUID mechanism
Mock API architecture
```

Các phần này đã có trong project demo.

Chỉ sửa khi cần để extension của mình hoạt động.

---

# 19. Kết quả mong đợi

Sau Lab 04, sinh viên phải giải thích được:

```text
Schema thay đổi
→ UI thay đổi

showIf
→ Conditional UI

answers
→ dữ liệu hiện tại của form

IndexedDB
→ local data

pending
→ local đã lưu, server chưa nhận

synced
→ server đã nhận

Offline-first
→ công việc cốt lõi vẫn tiếp tục khi network/API không khả dụng
```
