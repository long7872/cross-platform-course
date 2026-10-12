# LAB 06 — MODIFY & EXTEND REACT NATIVE ROOM BOOKING
## React Native + Expo Foundations

> **Môn:** Phát triển ứng dụng di động đa nền tảng  
> **Tuần:** 6  
> **Thời lượng dự kiến:** 2 tiết  
> **Project bắt đầu:** Demo Complete Week 6 — Room Booking Foundation

---

# 1. Mục tiêu

Lab này **không yêu cầu tạo lại project React Native từ đầu**.

Sinh viên sử dụng project Demo Complete Week 6 đã chạy ổn định, sau đó:

1. đọc lại cấu trúc `App.tsx`;
2. chỉnh sửa dữ liệu Room;
3. mở rộng `RoomCard`;
4. kết hợp props + state + event;
5. thêm một tính năng nhỏ liên quan đến Room Booking;
6. kiểm tra lại workflow:

```text
Data
→ Component
→ Props
→ Interaction
→ State
→ Re-render
→ UI
```

Mục tiêu chính:

> Hiểu cách thay đổi data, component và state trong một React Native app mà không phá vỡ workflow chính.

---

# 2. Project bắt đầu

Sử dụng:

```text
week6-room-booking-demo-complete
```

Project đã có:

```text
Expo
React Native
TypeScript

rooms[]
RoomCard
Props
FlatList

selectedRoom state
purpose state
message state

Pressable
TextInput

Book validation
```

Không cần viết lại các phần này từ đầu.

---

# 3. Chạy project trước khi sửa

Mở terminal trong project.

Cài package:

```cmd
npm install
```

Chạy:

```cmd
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

PASS trước khi bắt đầu Lab:

```text
Room list hiển thị
→ chọn được room
→ nhập được purpose
→ Book hoạt động
```

Nếu demo gốc chưa chạy đúng, chưa tiếp tục sửa code.

---

# 4. Workflow cần nhớ

App hiện tại:

```text
rooms[]
   ↓
FlatList
   ↓
RoomCard
   ↓
Props
   ↓
Press Select
   ↓
setSelectedRoom()
   ↓
selectedRoom
   ↓
React re-render
   ↓
UI cập nhật
```

Purpose:

```text
TextInput
   ↓
onChangeText
   ↓
setPurpose()
   ↓
purpose state
```

Book:

```text
selectedRoom
+
purpose
   ↓
handleBookRoom()
   ↓
message state
   ↓
UI result
```

---

# 5. YÊU CẦU 1 — MODIFY ROOM DATA

Mở dữ liệu:

```tsx
const rooms: Room[] = [
  // ...
];
```

Thực hiện:

## 5.1. Thêm ít nhất 2 phòng mới

Ví dụ:

```text
A203
B202
```

Mỗi phòng phải có:

```text
id
name
capacity
available
```

Ví dụ:

```tsx
{
  id: "a203",
  name: "A203",
  capacity: 25,
  available: true,
}
```

---

## 5.2. Có ít nhất 1 phòng unavailable

Ví dụ:

```tsx
{
  id: "b202",
  name: "B202",
  capacity: 60,
  available: false,
}
```

---

## PASS

Sau khi sửa:

```text
FlatList tự hiển thị thêm room mới
```

và có ít nhất:

```text
1 room Available
1 room Unavailable
```

Không được viết thêm card bằng tay.

---

# 6. YÊU CẦU 2 — EXTEND ROOM MODEL

Mở rộng type:

```tsx
type Room = {
  id: string;
  name: string;
  capacity: number;
  available: boolean;

  building: string;
};
```

Sau đó bổ sung `building` cho tất cả room.

Ví dụ:

```tsx
{
  id: "a201",
  name: "A201",
  capacity: 30,
  available: true,
  building: "Block A",
}
```

---

# 7. HIỂN THỊ `building` TRONG RoomCard

Trong `RoomCard`, hiển thị thêm:

```text
Building: Block A
```

Ví dụ:

```tsx
<Text>
  Building: {room.building}
</Text>
```

Không hardcode:

```text
Building: Block A
```

cho mọi card.

Dữ liệu phải lấy từ:

```tsx
room.building
```

---

## PASS

Mỗi card hiển thị được:

```text
Room name
Capacity
Building
Availability
```

và các room khác nhau có thể hiển thị building khác nhau.

---

# 8. YÊU CẦU 3 — KHÔNG CHO CHỌN ROOM UNAVAILABLE

Hiện tại nút:

```text
Select
```

có thể chọn mọi room.

Hãy thay đổi behavior:

```text
available = true
→ Select hoạt động

available = false
→ không được chọn
```

Có thể làm theo một trong hai cách:

```text
Cách A
→ disable Pressable

Cách B
→ không gọi onSelect(room)
```

Khuyến nghị:

```tsx
<Pressable
  disabled={!room.available}
  onPress={() => onSelect(room)}
>
```

UI nên giúp người dùng nhận biết trạng thái.

Ví dụ:

```text
Available
→ Select

Unavailable
→ Not available
```

---

## PASS

Test:

```text
Chọn A201 available
→ Selected thay đổi
```

và:

```text
B202 unavailable
→ không thể trở thành selectedRoom
```

---

# 9. YÊU CẦU 4 — HIỂN THỊ ROOM ĐANG ĐƯỢC CHỌN

Project hiện đã có:

```text
Selected: A201
```

Hãy mở rộng để `RoomCard` của room đang chọn có trạng thái khác rõ hơn.

Ví dụ:

```text
A201
Capacity: 30
Building: Block A
Available
[ Selected ]
```

trong khi room khác:

```text
A203
...
[ Select ]
```

---

# 10. GỢI Ý STATE + PROPS

Không tạo một state mới cho từng card.

Sử dụng state đã có:

```tsx
selectedRoom
```

Từ `App()`, truyền thêm prop:

```text
isSelected
```

Ví dụ:

```tsx
<RoomCard
  room={item}
  onSelect={setSelectedRoom}
  isSelected={
    selectedRoom?.id === item.id
  }
/>
```

Mở rộng props:

```tsx
type RoomCardProps = {
  room: Room;
  onSelect: (room: Room) => void;
  isSelected: boolean;
};
```

Sau đó trong `RoomCard`:

```tsx
{isSelected
  ? "Selected"
  : "Select"}
```

Có thể thay đổi style khi `isSelected = true`.

---

## PASS

Test:

```text
Chọn A201
→ A201 hiển thị Selected

Chọn A203
→ A201 trở lại Select
→ A203 hiển thị Selected
```

Chỉ có **một room** được chọn tại một thời điểm.

---

# 11. YÊU CẦU 5 — BOOKING SUMMARY

Hiện tại khi Book thành công, app chỉ hiển thị:

```text
Booked A201
```

Hãy mở rộng message để hiển thị thêm:

```text
Room
Building
Purpose
```

Ví dụ:

```text
Booking created
Room: A201
Building: Block A
Purpose: Team meeting
```

Có thể dùng một chuỗi:

```tsx
setMessage(
  `Booking created - ${selectedRoom.name}
   - ${selectedRoom.building}
   - ${purpose}`
);
```

hoặc render summary bằng component/UI riêng.

Không cần lưu database.

---

## PASS

Với:

```text
Room = A201
Building = Block A
Purpose = Team meeting
```

sau khi Book, UI phải hiển thị đúng các dữ liệu trên.

---

# 12. RESET FORM SAU KHI BOOK

Sau khi booking thành công, reset:

```text
purpose
```

về:

```text
""
```

Ví dụ:

```tsx
setPurpose("");
```

Có thể chọn:

```text
Giữ selectedRoom
```

hoặc:

```text
setSelectedRoom(null)
```

nhưng phải ghi rõ lựa chọn trong README.

Khuyến nghị Lab:

```text
reset purpose
giữ selectedRoom
```

để SV dễ quan sát state hơn.

---

## PASS

Sau Book thành công:

```text
message vẫn hiển thị booking vừa tạo
purpose input trở về rỗng
```

---

# 13. YÊU CẦU 6 — THÊM MỘT EXTENSION

Chọn **một** trong các extension sau.

---

## Extension A — Capacity Filter

Thêm lựa chọn đơn giản:

```text
Show rooms with capacity >= 40
```

Có thể dùng một state:

```tsx
const [largeOnly, setLargeOnly] =
  useState(false);
```

và tạo data:

```tsx
const visibleRooms = largeOnly
  ? rooms.filter(
      (room) => room.capacity >= 40
    )
  : rooms;
```

Sau đó:

```tsx
<FlatList
  data={visibleRooms}
  // ...
/>
```

---

## Extension B — Available Only

Thêm toggle/button:

```text
Available only
```

Khi bật:

```text
FlatList chỉ hiển thị room available
```

Gợi ý:

```tsx
rooms.filter(
  (room) => room.available
)
```

---

## Extension C — Room Counter

Hiển thị:

```text
Total rooms: 5
Available: 4
Unavailable: 1
```

Giá trị phải tính từ `rooms[]`.

Không hardcode:

```text
Total rooms: 5
```

---

## Extension D — Clear Selection

Thêm nút:

```text
Clear Selection
```

Khi bấm:

```tsx
setSelectedRoom(null);
```

UI trở về:

```text
Selected: None
```

---

## Extension E — Tự đề xuất

Có thể làm extension khác nếu:

- liên quan trực tiếp Room data / props / state / interaction;
- không cần backend;
- không cần navigation;
- có thể demo trong vài phút;
- không phá workflow chính.

---

## PASS

Extension:

```text
hoạt động
→ state/data thay đổi hợp lý
→ UI cập nhật
```

---

# 14. CHECKPOINT BẮT BUỘC — DATA → STATE → UI

Sau khi hoàn thành các yêu cầu, kiểm tra lại luồng chính.

## Bước 1 — App chạy

```cmd
npm start
```

PASS:

```text
Room List render
không có red screen/error
```

---

## Bước 2 — Data mới

PASS:

```text
room mới xuất hiện
building xuất hiện
available/unavailable đúng
```

---

## Bước 3 — Select room

PASS:

```text
available room
→ chọn được

unavailable room
→ không chọn được
```

---

## Bước 4 — State + Props

PASS:

```text
chỉ room đang chọn
→ hiển thị trạng thái Selected
```

---

## Bước 5 — Purpose

Nhập:

```text
Team meeting
```

PASS:

```text
TextInput hiển thị đúng text
purpose state cập nhật
```

---

## Bước 6 — Book

PASS:

```text
Room + Purpose hợp lệ
→ Booking Summary xuất hiện
→ purpose reset
```

---

## Bước 7 — Extension

PASS:

```text
extension hoạt động
và app chính vẫn hoạt động
```

---

# 15. TEST VALIDATION

Phải kiểm tra ít nhất ba tình huống.

---

## Test A — chưa chọn room

```text
Selected = None
Purpose = Meeting
```

Bấm Book.

PASS:

```text
Please select a room.
```

---

## Test B — có room nhưng purpose rỗng

```text
Selected = A201
Purpose = ""
```

PASS:

```text
Please enter purpose.
```

---

## Test C — đủ dữ liệu

```text
Selected = A201
Purpose = Team meeting
```

PASS:

```text
Booking Summary hiển thị
```

---

# 16. TEST ROOM UNAVAILABLE

Ví dụ:

```text
B202
available = false
```

Thử chọn.

PASS:

```text
B202 không trở thành selectedRoom
```

và UI cho thấy rõ:

```text
Unavailable
```

---

# 17. CÁC FILE CÓ THỂ CẦN SỬA

Trong Lab 06, chủ yếu chỉ cần:

```text
App.tsx
```

Không cần chỉnh:

```text
package.json
app.json
tsconfig.json
```

trừ khi có lý do rõ ràng.

---

# 18. CÁC PHẦN KHÔNG CẦN LÀM

Không cần:

```text
tạo project Expo mới
Expo Router
React Navigation
backend
API
Firebase
Supabase
database
authentication
AsyncStorage
SQLite
Context
Redux
Zustand
Camera
Geolocation
```

Lab 06 tập trung:

```text
Data
Component
Props
State
Event
Re-render
```

---

# 19. DEBUG NHANH

## App không chạy

```cmd
npm start
```

Kiểm tra terminal.

---

## Điện thoại không kết nối QR

Kiểm tra:

```text
Expo Go
cùng Wi-Fi
Metro đang chạy
Firewall
```

Nếu cần:

```cmd
npx expo start --tunnel
```

---

## `RoomCard` báo thiếu prop

Kiểm tra:

```tsx
type RoomCardProps
```

và nơi gọi:

```tsx
<RoomCard ... />
```

Nếu thêm:

```tsx
isSelected
```

thì cả type và component call đều phải có.

---

## Room mới báo TypeScript error

Nếu đã thêm:

```tsx
building: string;
```

vào `Room`, mọi phần tử trong `rooms[]` phải có:

```tsx
building
```

---

## UI không đổi sau khi Select

Kiểm tra:

```text
onPress
→ onSelect
→ setSelectedRoom
→ selectedRoom
```

Không dùng biến thường thay cho state.

---

# 20. YÊU CẦU NỘP BÀI

Nộp:

1. Screenshot minh chứng.


---

# 21. README.md (Không bắt buộc)

README chỉ cần trả lời ngắn:

```text
1. Room model đã được mở rộng như thế nào?

2. App xử lý room unavailable như thế nào?

3. selectedRoom được dùng để thay đổi UI ra sao?

4. Booking Summary hiển thị những dữ liệu gì?

5. Extension đã chọn là gì?

6. Trong Lab này, dữ liệu booking được lưu ở đâu?
```

Câu 6 cần trả lời đúng:

```text
Chỉ nằm trong local React state/UI.
Chưa có backend/database.
```

---

# 22. ẢNH MINH CHỨNG

## Ảnh 1 — Room List

Cho thấy:

```text
nhiều room
building
capacity
available/unavailable
```

---

## Ảnh 2 — Selected Room

Cho thấy:

```text
một room đang ở trạng thái Selected
```

---

## Ảnh 3 — Unavailable Room

Cho thấy:

```text
room unavailable
và không thể chọn
```

---

## Ảnh 4 — Validation

Ví dụ:

```text
chưa chọn room
→ Book
→ bị chặn
```

hoặc:

```text
purpose rỗng
→ bị chặn
```

---

## Ảnh 5 — Booking Summary

Cho thấy:

```text
Room
Building
Purpose
```

---

## Ảnh 6 — Extension

Cho thấy extension đã chọn đang hoạt động.

---

# 23. CHECKLIST TRƯỚC KHI NỘP

- [ ] Project chạy bằng Expo.
- [ ] App chạy trên Emulator hoặc điện thoại thật.
- [ ] Có ít nhất 5 room.
- [ ] Có ít nhất 1 room unavailable.
- [ ] `Room` có thêm `building`.
- [ ] `RoomCard` hiển thị building.
- [ ] Room unavailable không chọn được.
- [ ] `selectedRoom` vẫn dùng state.
- [ ] Room đang chọn có trạng thái UI riêng.
- [ ] `purpose` vẫn dùng state.
- [ ] Validation vẫn hoạt động.
- [ ] Booking Summary có Room + Building + Purpose.
- [ ] Purpose được reset sau Book thành công.
- [ ] Có một extension hoàn chỉnh.
- [ ] Không thêm backend/database/navigation.
- [ ] README hoàn chỉnh.
- [ ] Có ảnh minh chứng.

---

# 24. KẾT QUẢ MONG ĐỢI

Sau Lab 06, sinh viên cần giải thích được:

```text
Room data
   ↓
FlatList
   ↓
RoomCard
   ↓
Props
   ↓
User interaction
   ↓
State change
   ↓
React re-render
   ↓
UI result
```

Và phân biệt được:

```text
rooms[]
→ application data

props
→ dữ liệu truyền vào component

selectedRoom / purpose / message
→ state

Pressable / TextInput
→ user interaction

setState
→ làm state thay đổi

re-render
→ UI phản ánh state mới
```

Điểm quan trọng nhất:

> **Không sửa UI trực tiếp. Thay đổi data/state đúng chỗ, React sẽ render lại UI từ dữ liệu mới.**
