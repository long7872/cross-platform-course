# DEMO TUẦN 7 — REACT NATIVE + FIREBASE FIRESTORE
## Shared Data & Real-Time Updates
### Mini-project 2: Real-Time Room Booking — Part 2

> **Tài liệu thực hành dành cho sinh viên**  
> Week 7 tiếp tục trực tiếp từ Week 6.  
> Mục tiêu chính là đưa Room Booking từ **local state của một app** sang **shared data trên Firestore**, sau đó quan sát dữ liệu thay đổi realtime trên nhiều thiết bị.

---

# 1. Mục tiêu

Week 6:

```text
Data
→ Component
→ Props
→ State
→ Event
→ Re-render
```

Week 7 trả lời câu hỏi:

```text
Nếu hai thiết bị cần nhìn thấy cùng dữ liệu
→ local state có đủ không?
```

Không.

Cần:

```text
Shared Data
→ Firestore
```

Workflow trung tâm của Week 7:

```text
Firestore
   ↓
onSnapshot()
   ↓
setState(...)
   ↓
React state
   ↓
UI
```

và:

```text
User action
   ↓
addDoc(...)
   ↓
Firestore
   ↓
listener của các client
   ↓
state cập nhật
   ↓
UI cập nhật realtime
```

Sau Demo cần hiểu được:

- local state khác shared data như thế nào;
- Collection / Document trong Firestore;
- cách kết nối Expo app với Firebase;
- cách đọc `rooms` realtime;
- cách đưa Firestore data vào React state;
- cách ghi booking mới;
- cách listen `bookings` realtime;
- vì sao một thiết bị có thể tự thấy dữ liệu do thiết bị khác tạo;
- vì sao:

```text
Realtime
≠
Correct under concurrency
```

---

# 2. Phạm vi Week 7

Week 7 tập trung:

```text
Firebase project
Firestore Database
Firebase JS SDK

firebase.ts
rooms collection
bookings collection

useEffect
onSnapshot
addDoc
serverTimestamp

selectedSlot
two-device realtime
```

Chưa làm:

```text
Authentication
Production Security Rules
Transaction
Race condition handling
Waitlist
Cancel / Promote
Offline-first architecture
Redux / Zustand
Navigation phức tạp
```

Transaction và double booking sẽ được xử lý ở Week 8.

---

# 3. Project bắt đầu

Sử dụng project Week 6 làm nền.

Cấu trúc Week 7:

```text
room-booking/
├── App.tsx
├── src/
│   └── firebase.ts
├── package.json
├── app.json
└── tsconfig.json
```

Không cần tạo Expo project mới.

---

# 4. Kiểm tra Week 6 trước khi thêm Firestore

Trong project:

```cmd
npm install
npm start
```

PASS khi:

```text
Room List render
→ Select room được
→ nhập Purpose được
→ Book Room local hoạt động
```

Chỉ tiếp tục khi project Week 6 chạy ổn.

---

# 5. Local State và Shared Data

Week 6:

```text
Phone A
→ local state

Phone B
→ local state
```

Hai state này độc lập:

```text
Phone A state
≠
Phone B state
```

Week 7:

```text
Phone A
   │
   ▼
Firestore
   ▲
   │
Phone B
```

Kiến trúc:

```text
React Native App
      ↓
Firebase JS SDK
      ↓
Cloud Firestore
      ↓
Realtime listener
      ↓
React State
      ↓
UI
```

Điểm cần nhớ:

> **Firestore lưu shared data. React state vẫn giữ dữ liệu mà UI của từng app đang render.**

---

# 6. Firestore mental model

Chỉ cần nhớ ba khái niệm:

```text
Collection
→ nhóm document

Document
→ một record

Field
→ dữ liệu bên trong document
```

Ví dụ:

```text
rooms
 └── a201
      ├── name
      ├── building
      ├── capacity
      └── available
```

Path:

```text
rooms/a201
```

Booking:

```text
bookings/<auto-id>
```

---

# 7. Data Model — Room

```ts
type Room = {
  id: string;
  name: string;
  building: string;
  capacity: number;
  available: boolean;
};
```

Firestore:

```text
rooms/a201
```

Fields:

```text
name        "A201"
building    "Block A"
capacity    30
available   true
```

---

# 8. Data Model — Booking

```ts
type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  slot: string;
  purpose: string;
  createdAt?: unknown;
};
```

Firestore:

```text
bookings/<auto-id>
```

Fields:

```text
roomId
roomName
building
slot
purpose
createdAt
```

Week 7 chưa cần:

```text
userId
status
waitlist
transaction metadata
```

---

# 9. Tạo Firebase Project

Mở Firebase Console.

Chọn:

```text
Create project
```

Có thể tắt Google Analytics nếu không dùng.

Sau khi tạo project:

```text
Project Overview
→ Add app
→ Web
```

Ví dụ app name:

```text
VKU Room Booking
```

Không cần Firebase Hosting.

---

# 10. Lấy `firebaseConfig`

Firebase cung cấp dạng:

```ts
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

Thông tin này giúp app biết cần kết nối Firebase project nào.

Week 7 chưa đi sâu Authentication/Security Rules.

---

# 11. Bật Firestore Database

Trong Firebase Console:

```text
Build
→ Firestore Database
→ Create database
```

Week 7 chưa có Authentication.

Trong môi trường học tập, có thể dùng **Test mode tạm thời** để demo.

> Test mode không dùng cho production.

---

# 12. Tạo Collection `rooms`

Trong:

```text
Firestore Database
→ Start collection
→ rooms
```

Tạo các document sau.

---

## `a201`

```text
name        string    A201
building    string    Block A
capacity    number    30
available   boolean   true
```

---

## `a202`

```text
name        string    A202
building    string    Block A
capacity    number    50
available   boolean   true
```

---

## `b101`

```text
name        string    B101
building    string    Block B
capacity    number    40
available   boolean   true
```

---

## `b202`

```text
name        string    B202
building    string    Block B
capacity    number    60
available   boolean   false
```

Chưa cần tạo collection `bookings`.

`bookings` sẽ xuất hiện khi app ghi booking đầu tiên.

---

# 13. Checkpoint Firestore

PASS khi:

```text
Firestore Database
└── rooms
    ├── a201
    ├── a202
    ├── b101
    └── b202
```

Mỗi document có:

```text
name
building
capacity
available
```

---

# 14. Cài Firebase SDK

Trong project:

```cmd
npx expo install firebase
```

Sau đó chạy:

```cmd
npm start
```

Nếu Metro đang chạy khi cài package mới, có thể restart Metro.

---

# 15. Tạo `src/firebase.ts`

Tạo:

```text
src/firebase.ts
```

Code:

```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
```

Thay các giá trị placeholder bằng config thật của Firebase project.

---

# 16. Vì sao tách `firebase.ts`?

```text
firebase.ts
→ Firebase initialization

App.tsx
→ UI
→ state
→ listeners
→ user interaction
```

Week 7 chưa cần Repository/Service layer.

---

# 17. Checkpoint kết nối

Trong `App.tsx` import:

```tsx
import { db } from "./src/firebase";
```

Có thể test tạm:

```tsx
console.log("Firestore ready:", db);
```

PASS:

```text
app chạy
→ không có Firebase initialization error
```

Sau đó có thể xóa log.

---

# 18. Chuyển `rooms` từ hardcoded data sang State

Week 6:

```tsx
const rooms: Room[] = [
  // ...
];
```

Week 7:

```tsx
const [rooms, setRooms] =
  useState<Room[]>([]);
```

Tức là:

```text
Week 6
source = App.tsx

Week 7
source = Firestore
```

Nhưng:

```text
FlatList
→ vẫn đọc rooms state
```

---

# 19. `useEffect`

Import:

```tsx
import {
  useEffect,
  useState,
} from "react";
```

Có thể hiểu đơn giản:

```text
useState
→ giữ dữ liệu cho UI

useEffect
→ kết nối component với hệ thống bên ngoài
```

Trong Week 7:

```text
hệ thống bên ngoài
→ Firestore
```

Mental model:

```text
App appears
   ↓
useEffect()
   ↓
subscribe Firestore
```

Khung:

```tsx
useEffect(() => {
  // connect

  return () => {
    // disconnect
  };
}, []);
```

---

# 20. Import Firestore Functions

Trong `App.tsx`:

```tsx
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./src/firebase";
```

---

# 21. Listen `rooms` Realtime

Trong `App()`:

```tsx
useEffect(() => {
  const roomsRef =
    collection(db, "rooms");

  const unsubscribe =
    onSnapshot(
      roomsRef,
      (snapshot) => {
        const roomItems =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Room[];

        setRooms(roomItems);
      }
    );

  return unsubscribe;
}, []);
```

---

# 22. Hiểu `onSnapshot()`

```tsx
collection(db, "rooms")
```

→ tham chiếu collection:

```text
rooms
```

```tsx
onSnapshot(...)
```

→ đăng ký realtime listener.

```tsx
snapshot.docs
```

→ danh sách document hiện tại.

```tsx
setRooms(roomItems)
```

→ đưa dữ liệu Firestore vào React state.

---

# 23. Workflow quan trọng — Firestore → UI

```text
Firestore rooms
      ↓
onSnapshot()
      ↓
snapshot.docs
      ↓
map(...)
      ↓
roomItems
      ↓
setRooms(roomItems)
      ↓
rooms state
      ↓
FlatList
      ↓
RoomCard
```

Điểm cần nhớ:

> `FlatList` không đọc Firestore trực tiếp. `FlatList` đọc React state.

---

# 24. Vì sao có `unsubscribe`?

```tsx
const unsubscribe =
  onSnapshot(...);

return unsubscribe;
```

Có thể hiểu:

```text
Component xuất hiện
→ subscribe

Component không còn dùng
→ unsubscribe
```

Listener nên được hủy khi không cần nữa.

---

# 25. Loading/Error tối thiểu

State:

```tsx
const [loadingRooms, setLoadingRooms] =
  useState(true);

const [errorMessage, setErrorMessage] =
  useState("");
```

Listener:

```tsx
useEffect(() => {
  const roomsRef =
    collection(db, "rooms");

  const unsubscribe =
    onSnapshot(
      roomsRef,
      (snapshot) => {
        const roomItems =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Room[];

        setRooms(roomItems);
        setLoadingRooms(false);
      },
      (error) => {
        console.error(
          "Listen rooms failed:",
          error
        );

        setErrorMessage(
          "Cannot load rooms."
        );

        setLoadingRooms(false);
      }
    );

  return unsubscribe;
}, []);
```

UI:

```tsx
{loadingRooms ? (
  <Text>Loading rooms...</Text>
) : null}

{errorMessage ? (
  <Text>{errorMessage}</Text>
) : null}
```

---

# 26. Checkpoint — Rooms Realtime

PASS:

```text
App mở
→ rooms từ Firestore xuất hiện
```

Sau đó vào Firebase Console sửa:

```text
rooms/a201/capacity
30 → 35
```

Không reload app.

PASS:

```text
A201
Capacity: 35
```

Workflow:

```text
Firestore changed
→ listener fired
→ setRooms
→ React re-render
→ UI changed
```

---

# 27. Thêm Time Slot

Week 7 bổ sung time slot để chuẩn bị cho bài toán double booking ở Week 8.

Ngoài `App()`:

```tsx
const slots = [
  "08:00-09:00",
  "09:00-10:00",
  "14:00-15:00",
];
```

Trong `App()`:

```tsx
const [
  selectedSlot,
  setSelectedSlot,
] = useState<string | null>(null);
```

---

# 28. Slot UI

```tsx
<Text style={styles.label}>
  Time Slot
</Text>

<View style={styles.slotRow}>
  {slots.map((slot) => (
    <Pressable
      key={slot}
      style={[
        styles.slotButton,
        selectedSlot === slot
          ? styles.selectedSlotButton
          : null,
      ]}
      onPress={() =>
        setSelectedSlot(slot)
      }
    >
      <Text>
        {slot}
      </Text>
    </Pressable>
  ))}
</View>
```

PASS:

```text
tap 08:00-09:00
→ selectedSlot = 08:00-09:00

tap 14:00-15:00
→ selectedSlot thay đổi
→ UI highlight slot mới
```

---

# 29. Booking State

Thêm type:

```tsx
type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  slot: string;
  purpose: string;
  createdAt?: unknown;
};
```

State:

```tsx
const [bookings, setBookings] =
  useState<Booking[]>([]);
```

---

# 30. Import Firestore Functions để Write

Mở rộng import:

```tsx
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
```

---

# 31. Ghi Booking lên Firestore

`handleBookRoom()` nằm **bên trong `App()`**, sau các `useState(...)` và trước `return (...)`.

```tsx
async function handleBookRoom() {
  setMessage("");

  if (!selectedRoom) {
    setMessage(
      "Please select a room."
    );
    return;
  }

  if (!selectedSlot) {
    setMessage(
      "Please select a time slot."
    );
    return;
  }

  if (!purpose.trim()) {
    setMessage(
      "Please enter purpose."
    );
    return;
  }

  try {
    await addDoc(
      collection(db, "bookings"),
      {
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        building:
          selectedRoom.building,
        slot: selectedSlot,
        purpose: purpose.trim(),
        createdAt:
          serverTimestamp(),
      }
    );

    setMessage(
      "Booking created."
    );

    setPurpose("");
  } catch (error) {
    console.error(
      "Create booking failed:",
      error
    );

    setMessage(
      "Cannot create booking."
    );
  }
}
```

---

# 32. Hiểu `addDoc()`

```tsx
addDoc(
  collection(db, "bookings"),
  data
)
```

nghĩa là:

```text
Create document mới
→ trong collection bookings
→ Firestore tự tạo document ID
```

---

# 33. Vì sao dùng `serverTimestamp()`?

```tsx
createdAt:
  serverTimestamp()
```

Thay vì phụ thuộc hoàn toàn vào đồng hồ từng thiết bị.

Mental model:

```text
Phone A clock
Phone B clock
→ có thể khác nhau

Firestore server timestamp
→ timestamp từ backend
```

---

# 34. Checkpoint — Booking Write

Trên app:

```text
Select A201
→ Select 08:00-09:00
→ Purpose = Team meeting
→ Book Room
```

PASS trong Firebase Console:

```text
bookings
→ xuất hiện document mới
```

Có fields:

```text
roomId
roomName
building
slot
purpose
createdAt
```

---

# 35. Listen `bookings` Realtime

Thêm `useEffect()` thứ hai trong `App()`:

```tsx
useEffect(() => {
  const bookingsQuery =
    query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc")
    );

  const unsubscribe =
    onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingItems =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Booking[];

        setBookings(
          bookingItems
        );
      },
      (error) => {
        console.error(
          "Listen bookings failed:",
          error
        );
      }
    );

  return unsubscribe;
}, []);
```

---

# 36. `query + orderBy`

```tsx
collection(db, "bookings")
```

→ collection bookings.

```tsx
orderBy(
  "createdAt",
  "desc"
)
```

→ booking mới hơn hiển thị trước.

---

# 37. Recent Bookings UI

```tsx
<Text style={styles.sectionTitle}>
  Recent Bookings
</Text>

{bookings.map((booking) => (
  <View
    key={booking.id}
    style={styles.bookingCard}
  >
    <Text style={styles.roomName}>
      {booking.roomName}
    </Text>

    <Text>
      {booking.slot}
    </Text>

    <Text>
      {booking.purpose}
    </Text>
  </View>
))}
```

Có thể giới hạn:

```tsx
bookings.slice(0, 5)
```

---

# 38. Workflow Booking Realtime

```text
User
Select Room
+
Select Slot
+
Purpose
   ↓
handleBookRoom()
   ↓
addDoc()
   ↓
Firestore bookings
   ↓
onSnapshot()
   ↓
setBookings()
   ↓
bookings state
   ↓
Recent Bookings
```

Điểm quan trọng:

> UI Recent Bookings được cập nhật từ Firestore listener.

---

# 39. Test Realtime với Hai Thiết Bị

Chuẩn bị:

```text
Phone A
Phone B
```

hoặc:

```text
Emulator
+
Phone
```

Cả hai:

```text
→ chạy cùng app
→ cùng Firebase project
```

Trên Phone A:

```text
A201
08:00-09:00
Team meeting
```

bấm:

```text
Book Room
```

PASS khi Phone B:

```text
Recent Bookings
→ tự xuất hiện booking mới
```

Không cần:

```text
reload
restart
scan QR lại
```

---

# 40. Vì sao Phone B tự cập nhật?

```text
Phone A
   ↓
addDoc()
   ↓
Firestore
   ↓
data changed
   ↓
Phone B onSnapshot()
   ↓
setBookings()
   ↓
React re-render
   ↓
Phone B UI updated
```

Hai điện thoại không nói trực tiếp với nhau.

Cả hai kết nối với cùng backend:

```text
Firestore
```

---

# 41. `useState` và Firestore

Không phải:

```text
Firestore thay useState
```

Mà là:

```text
Firestore
→ shared data

useState
→ state mà UI của client đang render
```

Ví dụ:

| Local React state | Shared Firestore data |
|---|---|
| `selectedRoom` | rooms |
| `selectedSlot` | bookings |
| `purpose` | changes từ client khác |
| `message` | shared records |

Workflow:

```text
Firestore
→ listener
→ React state
→ UI
```

---

# 42. Mini Experiment — Sửa Firestore trực tiếp

Trong Firebase Console:

```text
rooms/a201/name
A201
→ A201 - Updated
```

Quan sát:

```text
Phone A cập nhật
Phone B cập nhật
```

Không sửa `App.tsx`.

PASS:

```text
Firestore
→ listener
→ state
→ UI
```

Sau đó có thể đổi lại tên phòng.

---

# 43. Debug nhanh

## Firebase initialization error

Kiểm tra:

```text
src/firebase.ts
firebaseConfig
projectId
```

---

## `Missing or insufficient permissions`

Kiểm tra:

```text
Firestore Security Rules
```

Nếu đang dùng môi trường demo chưa Auth, kiểm tra rules/Test mode phù hợp.

---

## Rooms không hiển thị

Kiểm tra:

```text
Firestore có collection rooms?
field names đúng?
onSnapshot rooms có chạy?
console có error?
```

---

## Booking được tạo nhưng Recent Bookings không hiển thị

Kiểm tra:

```text
Firestore có document booking?
listener bookings có chạy?
createdAt có tồn tại?
console có query/listener error?
```

---

## Hai thiết bị không đồng bộ

Kiểm tra:

```text
Cả hai đang dùng cùng Firebase project?
firebaseConfig.projectId giống nhau?
Firestore có data mới?
Phone B có listener?
```

---

# 44. Checkpoint cuối Demo

- [ ] Week 6 app chạy trước khi mở rộng.
- [ ] Firebase project đã tạo.
- [ ] Firestore Database đã bật.
- [ ] Firebase Web App/config có sẵn.
- [ ] Firebase SDK đã cài.
- [ ] Có `src/firebase.ts`.
- [ ] `rooms` nằm trong Firestore.
- [ ] App đọc `rooms` bằng `onSnapshot()`.
- [ ] `rooms` được đưa vào React state.
- [ ] Sửa room trên Firebase Console → UI đổi realtime.
- [ ] Có `selectedSlot`.
- [ ] Slot UI hoạt động.
- [ ] Validation Room + Slot + Purpose hoạt động.
- [ ] `addDoc()` tạo booking.
- [ ] Booking có `serverTimestamp()`.
- [ ] `bookings` được listen realtime.
- [ ] Recent Bookings hiển thị.
- [ ] Phone A tạo booking.
- [ ] Phone B tự thấy booking.
- [ ] Không cần reload.
- [ ] Phân biệt được local state và shared data.

Nếu đủ:

```text
Week 7 Demo: PASS
```

---

# 45. Cố tình tạo Double Booking

Đây là phần kết Week 7.

Phone A chọn:

```text
A201
08:00-09:00
```

Phone B cũng chọn:

```text
A201
08:00-09:00
```

Cả hai Book gần như cùng lúc.

Week 7 có thể tạo:

```text
booking-1
→ A201
→ 08:00-09:00

booking-2
→ A201
→ 08:00-09:00
```

Realtime vẫn hoạt động.

Nhưng nghiệp vụ sai.

---

# 46. Điểm quan trọng nhất Week 7

```text
Realtime
≠
Correct under concurrency
```

Week 7:

```text
shared data
+
realtime
```

Week 8:

```text
race condition
+
transaction
+
waitlist
```

---

# 47. Tổng kết

Sau Week 7 cần giải thích được hai luồng.

## Shared Room Data

```text
Firestore rooms
→ onSnapshot()
→ setRooms()
→ rooms state
→ FlatList
→ RoomCard
```

## Shared Booking Data

```text
Phone A
→ addDoc()
→ Firestore bookings
→ onSnapshot()
→ Phone B bookings state
→ Phone B UI
```

Ba ý cần nhớ:

```text
1. Firestore
→ shared data.

2. onSnapshot
→ shared data changes
→ React state
→ UI.

3. Realtime
→ chưa tự giải quyết double booking.
```

---

# 48. Câu hỏi mở sang Week 8

```text
Hai client
→ cùng room
→ cùng slot
→ cùng Book
```

Làm sao để chỉ **một booking** thành công?

Đó là bài toán tiếp theo:

```text
Race Condition
→ Transaction
```
