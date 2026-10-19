# LAB 07 — MODIFY & EXTEND REAL-TIME ROOM BOOKING
## React Native + Firebase Firestore

> **Môn:** Phát triển ứng dụng di động đa nền tảng  
> **Tuần:** 7  
> **Thời lượng dự kiến:** 2 tiết  
> **Project bắt đầu:** Demo Complete Week 7 — Real-Time Room Booking

---

# 1. Mục tiêu

Lab này **không yêu cầu tạo lại Firebase project hoặc viết lại app từ đầu**.

Sinh viên sử dụng Demo Complete Week 7 đã chạy ổn định, sau đó:

1. đọc lại luồng Firestore → React state → UI;
2. mở rộng dữ liệu `Room` trong Firestore;
3. cập nhật `RoomCard` để hiển thị dữ liệu mới;
4. mở rộng booking payload;
5. kiểm tra realtime trên hai client;
6. thêm một extension nhỏ liên quan đến shared data/realtime;
7. xác nhận workflow chính vẫn hoạt động.

Mục tiêu quan trọng nhất:

> Hiểu cách thay đổi **shared data trên Firestore** và quan sát React Native app tự cập nhật thông qua **real-time listener**, thay vì chỉ thay đổi local state trong một thiết bị.

---

# 2. Project bắt đầu

Sử dụng:

```text
week7-room-booking-firestore-demo-complete
```

Project nền đã có:

```text
React Native + Expo
Firebase JS SDK
Firestore

rooms collection
bookings collection

RoomCard
FlatList

selectedRoom
selectedSlot
purpose

useEffect
onSnapshot
addDoc
serverTimestamp

Recent Bookings
two-device realtime workflow
```

Không viết lại các phần này từ đầu.

---

# 3. Chạy project trước khi sửa

Trong project:

```cmd
npm install
npm start
```

Có thể chạy bằng:

```text
Android Emulator
```

hoặc:

```text
Điện thoại thật
→ Expo Go
→ quét QR
```

Nếu có thể, chuẩn bị **hai client**:

```text
Phone A + Phone B
```

hoặc:

```text
Emulator + Phone
```

---

## PASS trước khi bắt đầu Lab

Project gốc phải chạy được:

```text
Firestore rooms
→ Room List hiển thị

Select Room
→ Select Slot
→ nhập Purpose
→ Book Room

Firestore bookings
→ Recent Bookings cập nhật
```

Nếu dùng hai client:

```text
Phone A tạo booking
→ Phone B tự thấy booking
```

Nếu demo gốc chưa PASS, chưa tiếp tục sửa Lab.

---

# 4. Workflow cần nhớ

## Room Data

```text
Firestore rooms
      ↓
onSnapshot()
      ↓
setRooms(...)
      ↓
rooms state
      ↓
FlatList
      ↓
RoomCard
```

## Booking Data

```text
User
Room + Slot + Purpose
      ↓
handleBookRoom()
      ↓
addDoc()
      ↓
Firestore bookings
      ↓
onSnapshot()
      ↓
setBookings(...)
      ↓
Recent Bookings
```

## Hai thiết bị

```text
Phone A
→ addDoc()
→ Firestore
→ onSnapshot()
→ Phone B state
→ Phone B UI
```

---

# 5. YÊU CẦU 1 — MODIFY SHARED ROOM DATA

Mở rộng Room model với field:

```text
floor
```

Type có thể đổi thành:

```tsx
type Room = {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  available: boolean;
};
```

Sau đó vào Firebase Console và bổ sung field `floor` cho **tất cả** document trong collection:

```text
rooms
```

Ví dụ:

```text
rooms/a201
floor = 2
```

```text
rooms/a202
floor = 2
```

```text
rooms/b101
floor = 1
```

```text
rooms/b202
floor = 2
```

---

## PASS

Firestore phải có:

```text
rooms/a201
├── name
├── building
├── floor
├── capacity
└── available
```

và tương tự với các room khác.

---

# 6. YÊU CẦU 2 — HIỂN THỊ `floor` TRONG RoomCard

Mở rộng `RoomCard` để hiển thị:

```text
Floor: 2
```

Ví dụ:

```tsx
<Text style={styles.roomMeta}>
  Floor: {room.floor}
</Text>
```

Không hardcode:

```text
Floor: 2
```

cho mọi card.

Dữ liệu phải lấy từ:

```tsx
room.floor
```

---

## PASS

Ví dụ RoomCard:

```text
A201
Building: Block A
Floor: 2
Capacity: 30
Available
[ Select ]
```

---

# 7. CHECKPOINT REALTIME — SỬA FIRESTORE, KHÔNG SỬA APP

Đây là checkpoint bắt buộc.

Trong Firebase Console, sửa:

```text
rooms/a201/floor
2 → 3
```

Không reload app.

Không sửa `App.tsx`.

---

## PASS

App tự cập nhật:

```text
A201
Floor: 3
```

Luồng cần giải thích:

```text
Firestore changed
      ↓
onSnapshot()
      ↓
setRooms(...)
      ↓
rooms state changed
      ↓
React re-render
      ↓
RoomCard updated
```

Sau khi test có thể đổi lại:

```text
floor = 2
```

---

# 8. YÊU CẦU 3 — MỞ RỘNG BOOKING DATA

Thêm field:

```text
bookedBy
```

Mục đích: lưu tên người tạo booking.

Thêm state trong `App()`:

```tsx
const [bookedBy, setBookedBy] =
  useState("");
```

Thêm một `TextInput`:

```tsx
<Text style={styles.label}>
  Booked By
</Text>

<TextInput
  style={styles.input}
  value={bookedBy}
  onChangeText={setBookedBy}
  placeholder="Your name"
/>
```

---

# 9. VALIDATION `bookedBy`

Mở rộng `handleBookRoom()`.

Sau validation Room / Slot / Purpose, thêm:

```tsx
if (!bookedBy.trim()) {
  setMessage(
    "Please enter your name."
  );
  return;
}
```

---

## PASS

Nếu:

```text
Room = A201
Slot = 08:00-09:00
Purpose = Team meeting
Booked By = ""
```

bấm Book:

```text
→ không tạo document mới
→ hiển thị validation message
```

---

# 10. GHI `bookedBy` LÊN FIRESTORE

Trong `addDoc()` thêm:

```tsx
bookedBy:
  bookedBy.trim(),
```

Booking payload sau khi mở rộng:

```text
roomId
roomName
building
slot
purpose
bookedBy
createdAt
```

Ví dụ:

```tsx
await addDoc(
  collection(db, "bookings"),
  {
    roomId:
      selectedRoom.id,

    roomName:
      selectedRoom.name,

    building:
      selectedRoom.building,

    slot:
      selectedSlot,

    purpose:
      purpose.trim(),

    bookedBy:
      bookedBy.trim(),

    createdAt:
      serverTimestamp(),
  }
);
```

---

# 11. CẬP NHẬT `Booking` TYPE

Thêm:

```tsx
bookedBy: string;
```

Ví dụ:

```tsx
type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  slot: string;
  purpose: string;
  bookedBy: string;
  createdAt?: unknown;
};
```

---

# 12. HIỂN THỊ `bookedBy` TRONG RECENT BOOKINGS

Trong Recent Bookings:

```tsx
<Text style={styles.roomMeta}>
  Booked by: {booking.bookedBy}
</Text>
```

Ví dụ:

```text
A201
Block A
Slot: 08:00-09:00
Purpose: Team meeting
Booked by: Minh
```

---

## PASS

Booking mới trong Firestore có:

```text
bookedBy
```

và Recent Bookings hiển thị đúng.

---

# 13. RESET FORM SAU KHI BOOK

Sau booking thành công, reset:

```tsx
setPurpose("");
setBookedBy("");
```

Có thể giữ:

```text
selectedRoom
selectedSlot
```

để dễ tiếp tục demo Week 8.

---

## PASS

Sau Book thành công:

```text
Purpose
→ rỗng

Booked By
→ rỗng
```

nhưng booking vừa tạo vẫn xuất hiện trong Recent Bookings.

---

# 14. YÊU CẦU 4 — FILTER ROOM THEO BUILDING

Thêm state:

```tsx
const [
  selectedBuilding,
  setSelectedBuilding,
] = useState("ALL");
```

Có ba lựa chọn:

```text
ALL
Block A
Block B
```

Có thể dùng `Pressable`.

---

# 15. TẠO `visibleRooms`

Trước `return`:

```tsx
const visibleRooms =
  selectedBuilding === "ALL"
    ? rooms
    : rooms.filter(
        (room) =>
          room.building
          === selectedBuilding
      );
```

Sau đó đổi:

```tsx
data={rooms}
```

thành:

```tsx
data={visibleRooms}
```

---

## PASS

```text
ALL
→ thấy tất cả room

Block A
→ chỉ thấy room Block A

Block B
→ chỉ thấy room Block B
```

Dữ liệu gốc vẫn lấy từ Firestore.

---

# 16. YÊU CẦU 5 — REALTIME BOOKING COUNTER

Hiển thị:

```text
Total Bookings: N
```

Không tạo state riêng nếu không cần.

Có thể dùng trực tiếp:

```tsx
<Text>
  Total Bookings: {bookings.length}
</Text>
```

---

## PASS

Ban đầu:

```text
Total Bookings: 3
```

Phone A tạo booking mới.

Phone B phải tự đổi:

```text
Total Bookings: 4
```

không reload.

Đây là evidence cho:

```text
Firestore
→ onSnapshot
→ bookings state
→ UI
```

---

# 17. YÊU CẦU 6 — THÊM MỘT EXTENSION

Chọn **một** extension.

---

## Extension A — Available Rooms Counter

Hiển thị:

```text
Available Rooms: 3
```

Có thể tính:

```tsx
const availableRoomCount =
  rooms.filter(
    (room) => room.available
  ).length;
```

Không hardcode số.

---

## Extension B — Available Only

Thêm state:

```tsx
const [
  availableOnly,
  setAvailableOnly,
] = useState(false);
```

Khi bật:

```text
FlatList
→ chỉ hiển thị available room
```

Có thể kết hợp với building filter.

---

## Extension C — Filter Recent Bookings by Room

Cho phép chọn:

```text
All Bookings
A201
A202
...
```

Sau đó chỉ hiển thị bookings của room đã chọn.

Không query Firestore mới cũng được.

Có thể filter từ:

```tsx
bookings
```

state hiện tại.

---

## Extension D — Latest Booking Highlight

Nếu:

```text
bookings[0]
```

là booking mới nhất, hiển thị một khu vực:

```text
Latest Booking
A201
08:00-09:00
Booked by: Minh
```

Dữ liệu phải lấy từ listener.

---

## Extension E — Tự đề xuất

Extension khác được chấp nhận nếu:

- liên quan trực tiếp Firestore/shared data/realtime;
- không dùng transaction;
- không thêm authentication;
- không phá workflow chính;
- demo được trong vài phút.

---

## PASS

Extension phải:

```text
hoạt động
→ data/state hợp lý
→ UI tự cập nhật
```

---

# 18. CHECKPOINT BẮT BUỘC — TWO-DEVICE REALTIME

Chuẩn bị:

```text
Client A
Client B
```

Cả hai:

```text
→ chạy cùng app
→ cùng Firebase project
```

---

## Bước 1 — Client A tạo Booking

Ví dụ:

```text
Room: A201
Slot: 09:00-10:00
Purpose: Project meeting
Booked By: An
```

Bấm:

```text
Book Room
```

---

## PASS Client A

```text
Booking created.
→ Recent Bookings xuất hiện
→ Total Bookings tăng
```

---

## PASS Client B

Không reload.

Client B phải tự cập nhật:

```text
Recent Bookings
→ booking mới xuất hiện

Total Bookings
→ tăng
```

---

# 19. GIẢI THÍCH WORKFLOW HAI THIẾT BỊ

```text
Client A
   ↓
addDoc()
   ↓
Firestore bookings
   ↓
data changed
   ↓
Client B onSnapshot()
   ↓
setBookings(...)
   ↓
bookings state changed
   ↓
React re-render
   ↓
Client B UI updated
```

Điểm quan trọng:

> Client A không gửi dữ liệu trực tiếp cho Client B.

Cả hai dùng:

```text
Firestore
```

làm shared backend.

---

# 20. CHECKPOINT — REALTIME ROOMS

Ngoài bookings, phải test lại room listener.

Firebase Console:

```text
rooms/b202/available
false → true
```

Không reload app.

---

## PASS

Client A và Client B đều tự đổi:

```text
B202
Unavailable
→ Available
```

Nếu dùng extension Available Rooms Counter:

```text
counter cũng phải tăng
```

---

# 21. VALIDATION TEST

Phải test tối thiểu bốn case.

---

## Test A — chưa chọn Room

```text
selectedRoom = null
```

PASS:

```text
Please select a room.
```

---

## Test B — chưa chọn Slot

```text
Room = A201
selectedSlot = null
```

PASS:

```text
Please select a time slot.
```

---

## Test C — Purpose rỗng

```text
Room = A201
Slot = 08:00-09:00
Purpose = ""
```

PASS:

```text
Please enter purpose.
```

---

## Test D — Booked By rỗng

```text
Room = A201
Slot = 08:00-09:00
Purpose = Meeting
Booked By = ""
```

PASS:

```text
Please enter your name.
```

---

# 22. TEST BOOKING THÀNH CÔNG

Ví dụ:

```text
Room = A201
Slot = 08:00-09:00
Purpose = Team meeting
Booked By = Lan
```

PASS trong Firestore:

```text
bookings/<id>
├── roomId
├── roomName
├── building
├── slot
├── purpose
├── bookedBy
└── createdAt
```

PASS trên UI:

```text
Recent Bookings
→ có Lan
```

---

# 23. KHÔNG XỬ LÝ DOUBLE BOOKING TRONG LAB 07

Nếu hai client cùng tạo:

```text
A201
08:00-09:00
```

Firestore có thể lưu cả hai booking.

Đây **không phải lỗi cần sửa trong Lab 07**.

Week 7 đang chứng minh:

```text
Shared Data
+
Realtime
```

Week 8 mới xử lý:

```text
Race Condition
+
Transaction
```

Không tự thêm logic kiểu:

```text
đọc bookings trước
→ nếu chưa thấy thì addDoc
```

để cố ngăn double booking.

Cách đó vẫn có race condition.

---

# 24. DEBUG — FIELD MỚI KHÔNG HIỂN THỊ

Nếu:

```text
room.floor = undefined
```

kiểm tra:

```text
Firestore document đã có floor?
Type Room có floor?
RoomCard đọc room.floor?
```

---

# 25. DEBUG — `bookedBy` KHÔNG CÓ TRONG FIRESTORE

Kiểm tra đủ:

```text
bookedBy state
→ TextInput
→ validation
→ addDoc payload
```

---

# 26. DEBUG — PHONE B KHÔNG CẬP NHẬT

Kiểm tra theo thứ tự:

```text
1. Booking đã xuất hiện trên Firestore chưa?

2. Phone B có cùng Firebase projectId?

3. Phone B có bookings onSnapshot listener?

4. Console Phone B có permission/query error?

5. bookings state Phone B có thay đổi?
```

Tư duy debug:

```text
Write
→ Backend
→ Listener
→ State
→ UI
```

---

# 27. DEBUG — FIRESTORE PERMISSION

Nếu có:

```text
Missing or insufficient permissions
```

kiểm tra:

```text
Firestore Security Rules
```

Lab 07 chưa làm Authentication.

Chỉ dùng môi trường demo/test được GV cấu hình.

---

# 28. DEBUG — `orderBy(createdAt)` KHÔNG HOẠT ĐỘNG

Kiểm tra booking document có:

```text
createdAt
```

Nếu có document test cũ thiếu field này, có thể xóa document test cũ rồi thử lại.

Không bỏ `serverTimestamp()` ở booking mới.

---

# 29. FILE CẦN SỬA

Chủ yếu:

```text
App.tsx
```

và dữ liệu:

```text
Firestore Console
→ rooms
```

Thông thường không cần sửa:

```text
src/firebase.ts
package.json
app.json
tsconfig.json
```

nếu Demo Complete đã kết nối đúng Firebase.

---

# 30. PHẦN KHÔNG CẦN LÀM

Không thêm:

```text
Authentication
Transaction
Waitlist
Cancel / Promote
React Navigation
Expo Router
Redux
Zustand
AsyncStorage
SQLite
Offline sync
```

Lab 07 tập trung:

```text
Firestore Data
→ Listener
→ State
→ UI

User
→ addDoc
→ Firestore
→ Other Client
```

---

# 31. YÊU CẦU NỘP BÀI

Nộp:

1. Source code project đã chỉnh sửa.
2. `README.md` ngắn.
3. Các ảnh minh chứng bên dưới.

Không cần nộp:

```text
node_modules/
.expo/
```

Không yêu cầu Git/GitHub.

---

# 32. README.md

README chỉ cần trả lời ngắn:

```text
1. Room model đã được thêm field nào?

2. Vì sao sửa floor trên Firebase Console
   mà app tự cập nhật?

3. Booking payload đã được thêm field nào?

4. bookedBy được lưu vào Firestore như thế nào?

5. Building filter hoạt động trên dữ liệu nào?

6. Extension đã chọn là gì?

7. Vì sao Phone B thấy booking do Phone A tạo?

8. Week 7 đã ngăn double booking chưa? Vì sao?
```

Câu 8 cần trả lời:

```text
Chưa.

Realtime không tự giải quyết race condition.
Transaction được xử lý ở Week 8.
```

---

# 33. ẢNH MINH CHỨNG

## Ảnh 1 — Firestore Room Data

Cho thấy một room có:

```text
name
building
floor
capacity
available
```

---

## Ảnh 2 — Room UI

Cho thấy:

```text
RoomCard
→ Floor hiển thị
```

---

## Ảnh 3 — Firestore Realtime Update

Cho thấy app sau khi sửa:

```text
floor
hoặc
available
```

trên Firebase Console.

---

## Ảnh 4 — Booking Form

Cho thấy:

```text
Room
Slot
Purpose
Booked By
```

---

## Ảnh 5 — Booking Document

Cho thấy Firestore booking có:

```text
bookedBy
createdAt
slot
purpose
```

---

## Ảnh 6 — Two-device Realtime

Cho thấy booking tạo ở Client A xuất hiện ở Client B.

Nếu khó chụp hai thiết bị trong một ảnh, có thể nộp hai screenshot.

---

## Ảnh 7 — Extension

Cho thấy extension đã chọn đang hoạt động.

---

# 34. CHECKLIST TRƯỚC KHI NỘP

- [ ] Demo Complete Week 7 chạy ổn.
- [ ] Firebase config đúng.
- [ ] Firestore rooms có field `floor`.
- [ ] `Room` type có `floor`.
- [ ] RoomCard hiển thị Floor.
- [ ] Sửa Firestore → UI tự cập nhật.
- [ ] Có `bookedBy` state.
- [ ] Có Booked By TextInput.
- [ ] Validation `bookedBy` hoạt động.
- [ ] Booking document có `bookedBy`.
- [ ] Recent Bookings hiển thị `bookedBy`.
- [ ] Purpose reset sau Book.
- [ ] Booked By reset sau Book.
- [ ] Có Building Filter.
- [ ] Building Filter dùng `rooms` state.
- [ ] Có Total Bookings realtime counter.
- [ ] Client A tạo booking.
- [ ] Client B tự cập nhật.
- [ ] Có một extension hoàn chỉnh.
- [ ] Không thêm transaction.
- [ ] Không thêm authentication.
- [ ] README hoàn chỉnh.
- [ ] Có ảnh minh chứng.

---

# 35. KẾT QUẢ MONG ĐỢI

Sau Lab 07, sinh viên cần giải thích được:

```text
Firestore rooms
      ↓
onSnapshot()
      ↓
rooms state
      ↓
Filter
      ↓
FlatList
      ↓
RoomCard
```

và:

```text
Booking Form
      ↓
addDoc()
      ↓
Firestore bookings
      ↓
onSnapshot()
      ↓
bookings state
      ↓
Recent Bookings
      ↓
Realtime Counter
```

và đặc biệt:

```text
Client A
→ Firestore
→ Client B
```

---

# 36. Điểm quan trọng nhất

> **Week 6:** State làm UI của một client thay đổi.

> **Week 7:** Firestore làm nhiều client chia sẻ cùng dữ liệu; `onSnapshot()` đưa thay đổi đó trở lại React state để UI cập nhật.

Workflow cần nhớ:

```text
Shared Data
→ Listener
→ State
→ UI
```

và:

```text
User Action
→ Firestore Write
→ Shared Data Change
→ Other Client Listener
→ Other Client UI
```

Week 7 dừng ở đây.

Week 8 sẽ giải quyết:

```text
Two clients
→ Same room
→ Same slot
→ Same time
→ Race Condition
→ Transaction
```
