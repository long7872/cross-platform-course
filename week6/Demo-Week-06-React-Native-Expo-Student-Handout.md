# DEMO TUẦN 6 — REACT NATIVE + EXPO FOUNDATIONS
## Build Your First React Native App
### Mini-project 2: Room Booking — Foundation

> **Tài liệu thực hành dành cho sinh viên**  
> Week 6 là buổi đầu tiên làm quen với React Native. Mục tiêu chính là tạo, chạy, đọc và chỉnh sửa một app React Native đầu tiên bằng Expo.

---

# 1. Mục tiêu

Sau khi hoàn thành demo, cần hiểu và kiểm tra được luồng:

```text
Data
→ Component
→ UI
→ User Interaction
→ State change
→ React re-render
→ UI changes
```

Trong mini-project Room Booking:

```text
rooms[]
→ FlatList
→ RoomCard
→ Press Select
→ selectedRoom thay đổi
→ UI hiển thị phòng đã chọn
```

Cuối buổi cần làm được:

- tạo project React Native bằng Expo;
- chạy app trên Android Emulator hoặc điện thoại thật;
- hiểu vai trò của `App.tsx`;
- sử dụng `View`, `Text`, `TextInput`, `Pressable`, `FlatList`;
- style bằng `StyleSheet`;
- tách `RoomCard` thành component;
- truyền dữ liệu bằng props;
- dùng `useState()` để lưu state thay đổi theo tương tác;
- hiểu:

```text
Event
→ setState
→ Re-render
→ UI changes
```

---

# 2. Phạm vi Week 6

Week 6 tập trung vào:

```text
Expo
+ React Native Core Components
+ JSX
+ StyleSheet / Flexbox
+ Component
+ Props
+ FlatList
+ useState
+ Pressable
+ TextInput
```

Chưa học:

```text
Navigation
Backend
Realtime
Database
Authentication
Global State
Native APIs
```

---

# 3. Chuẩn bị môi trường

Kiểm tra:

```cmd
node -v
npm -v
```

Có thể chạy app theo hai cách:

```text
Cách 1
→ Android Emulator

Cách 2
→ Điện thoại Android/iPhone thật
→ Expo Go
→ quét QR
```

---

# 4. Tạo project React Native đầu tiên

Trên Windows CMD, dùng **một dòng**:

```cmd
npx create-expo-app@latest room-booking --template blank-typescript
```

Nếu npm hỏi:

```text
Need to install the following packages:
create-expo-app@...
Ok to proceed? (y)
```

nhập:

```text
y
```

rồi Enter.

> Không dùng dấu `\` để xuống dòng trong Windows CMD.

Sau khi tạo xong:

```cmd
cd room-booking
npm start
```

Có thể dùng tương đương:

```cmd
npx expo start
```

---

# 5. Chạy app

## Cách 1 — Android Emulator

Khi Metro đang chạy, nhấn:

```text
a
```

PASS khi app mặc định mở trên Android Emulator.

---

## Cách 2 — Android thật bằng Expo Go

1. Cài **Expo Go** trên điện thoại Android.
2. Máy tính và điện thoại nên cùng mạng Wi-Fi.
3. Chạy:

```cmd
npm start
```

4. Mở Expo Go.
5. Quét QR trong terminal.

QR thường trỏ tới địa chỉ dạng:

```text
exp://<IP-máy-tính>:8081
```

PASS khi app mở trong Expo Go.

---

## Cách 3 — iPhone thật

1. Cài Expo Go.
2. Máy tính và iPhone nên cùng Wi-Fi.
3. Chạy:

```cmd
npm start
```

4. Dùng Camera của iPhone quét QR.
5. Mở app bằng Expo Go.

---

## Nếu quét QR nhưng không kết nối được

Thử:

```cmd
npx expo start --tunnel
```

Sau đó quét QR mới.

---

# 6. Checkpoint đầu tiên

Khi app mặc định chạy, có thể thấy nội dung:

```text
Open up App.tsx to start working on your app!
```

Điều này có nghĩa project đã chạy đúng.

PASS:

```text
create-expo-app
→ npm start
→ Emulator hoặc Expo Go
→ app hiển thị
```

---

# 7. Quan sát cấu trúc project

Cấu trúc tối giản:

```text
room-booking/
├── App.tsx
├── package.json
├── tsconfig.json
├── assets/
└── node_modules/
```

Trong Week 6, phần quan trọng nhất là:

```text
App.tsx
```

Ghi nhớ:

```text
App.tsx
→ UI + logic chính của demo

package.json
→ scripts + dependencies

assets/
→ tài nguyên tĩnh
```

---

# 8. Hello React Native

Mở:

```text
App.tsx
```

thay bằng:

```tsx
import { Text, View } from "react-native";

export default function App() {
  return (
    <View>
      <Text>Hello React Native</Text>
    </View>
  );
}
```

Save file.

PASS khi app trên Emulator/điện thoại tự cập nhật thành:

```text
Hello React Native
```

Đây là **Fast Refresh**.

---

# 9. React Native không dùng HTML

So sánh để dễ hình dung:

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<p>` / `<span>` | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button>` | thường dùng `<Pressable>` |
| CSS | `StyleSheet` / style object |
| `click` | `onPress` |

Đây chỉ là mapping để dễ hiểu. React Native component không phải bản dịch 1:1 của HTML element.

---

# 10. JSX và Component Tree

Sửa:

```tsx
import { Text, View } from "react-native";

export default function App() {
  return (
    <View>
      <Text>Room Booking</Text>
      <Text>Available Rooms</Text>
    </View>
  );
}
```

Có thể hình dung:

```text
App
└── View
    ├── Text
    └── Text
```

JSX mô tả UI bằng các component.

---

# 11. StyleSheet

Sửa:

```tsx
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Room Booking
      </Text>

      <Text style={styles.sectionTitle}>
        Available Rooms
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
});
```

Ghi nhớ:

```text
StyleSheet.create(...)
→ tạo style object

style={styles.container}
→ gắn style vào component
```

---

# 12. Flexbox vừa đủ cho demo

Một số thuộc tính thường gặp:

```text
flex
flexDirection
justifyContent
alignItems
```

Ví dụ:

```text
flexDirection: "column"
→ xếp dọc

flexDirection: "row"
→ xếp ngang
```

---

# 13. Tạo dữ liệu Room

Thêm trước `App()`:

```tsx
type Room = {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
};

const rooms: Room[] = [
  {
    id: "a201",
    name: "A201",
    capacity: 30,
    available: true,
  },
  {
    id: "a202",
    name: "A202",
    capacity: 50,
    available: true,
  },
  {
    id: "b101",
    name: "B101",
    capacity: 40,
    available: true,
  },
];
```

Ý chính:

```text
rooms[]
→ data của app
```

Không viết lặp nhiều card bằng tay nếu UI có thể render từ data.

---

# 14. TypeScript ở mức cơ bản

```tsx
type Room = {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
};
```

Có thể hiểu đơn giản:

```text
Room
→ mô tả một room cần những field nào

Room[]
→ mảng các room
```

---

# 15. Tạo `RoomCard` Component

Thêm:

```tsx
function RoomCard({
  room,
}: {
  room: Room;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.roomName}>
        {room.name}
      </Text>

      <Text>
        Capacity: {room.capacity}
      </Text>

      <Text>
        {room.available
          ? "Available"
          : "Unavailable"}
      </Text>
    </View>
  );
}
```

Thêm style:

```tsx
card: {
  backgroundColor: "#ffffff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
},

roomName: {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 4,
},
```

Component có thể hiểu là:

```text
RoomCard
├── Room name
├── Capacity
└── Availability
```

---

# 16. Props

Thử render:

```tsx
<RoomCard room={rooms[0]} />
```

Luồng:

```text
rooms[0]
   ↓
room prop
   ↓
RoomCard
   ↓
UI
```

Nếu đổi:

```tsx
rooms[0]
```

thành:

```tsx
rooms[1]
```

thì cùng một `RoomCard` sẽ render dữ liệu phòng khác.

Ghi nhớ:

```text
Component giống nhau
+ Props khác nhau
→ UI khác nhau
```

---

# 17. Render danh sách bằng FlatList

Import thêm:

```tsx
FlatList
```

Trong `App()`:

```tsx
<FlatList
  data={rooms}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <RoomCard room={item} />
  )}
/>
```

Ba prop cần hiểu:

```text
data
→ nguồn dữ liệu

keyExtractor
→ lấy key ổn định cho item

renderItem
→ mô tả UI cho mỗi item
```

Workflow:

```text
rooms[]
   ↓
FlatList
   ↓
item
   ↓
RoomCard
```

---

# 18. Checkpoint — Data → List UI

PASS khi app hiển thị ít nhất:

```text
A201
Capacity: 30

A202
Capacity: 50

B101
Capacity: 40
```

Nếu thêm một phần tử mới vào `rooms[]`, không cần viết thêm một `RoomCard` bằng tay.

---

# 19. Thêm nút Select bằng Pressable

Mở rộng props:

```tsx
type RoomCardProps = {
  room: Room;
  onSelect: (room: Room) => void;
};
```

Sửa component:

```tsx
function RoomCard({
  room,
  onSelect,
}: RoomCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.roomName}>
        {room.name}
      </Text>

      <Text>
        Capacity: {room.capacity}
      </Text>

      <Text>
        {room.available
          ? "Available"
          : "Unavailable"}
      </Text>

      <Pressable
        style={styles.selectButton}
        onPress={() => onSelect(room)}
      >
        <Text style={styles.selectButtonText}>
          Select
        </Text>
      </Pressable>
    </View>
  );
}
```

Nhớ import:

```tsx
Pressable
```

---

# 20. Vì sao cần State?

Nếu chỉ dùng biến thường:

```tsx
let selectedRoom = null;
```

thì biến có thể đổi, nhưng React không xem việc đổi biến thường là tín hiệu để cập nhật UI.

Nếu đặt biến này bên trong `App()`:

```tsx
export default function App() {
  let selectedRoom = null;

  // ...
}
```

mỗi lần component render lại, biến lại được khởi tạo.

State giải quyết hai việc:

```text
1. Giữ giá trị giữa các lần render.

2. Khi state đổi
   → React render lại
   → UI đọc state mới.
```

Rule đơn giản:

```text
Dữ liệu chỉ dùng tạm để tính toán
→ variable bình thường

Dữ liệu thay đổi theo tương tác
và UI phải phản ánh thay đổi đó
→ state
```

---

# 21. `selectedRoom` State

Import:

```tsx
import { useState } from "react";
```

Trong `App()`:

```tsx
const [selectedRoom, setSelectedRoom] =
  useState<Room | null>(null);
```

Có thể hiểu:

```text
selectedRoom
→ state hiện tại

setSelectedRoom(...)
→ hàm cập nhật state
```

Ban đầu:

```text
selectedRoom = null
```

---

# 22. Truyền event handler vào `RoomCard`

Trong `FlatList`:

```tsx
<FlatList
  data={rooms}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <RoomCard
      room={item}
      onSelect={setSelectedRoom}
    />
  )}
/>
```

Sau list:

```tsx
<Text style={styles.selectedText}>
  Selected:{" "}
  {selectedRoom
    ? selectedRoom.name
    : "None"}
</Text>
```

---

# 23. Checkpoint — Event → State → UI

Bấm:

```text
Select ở A201
```

PASS:

```text
Selected: A201
```

Bấm:

```text
Select ở A202
```

PASS:

```text
Selected: A202
```

Luồng:

```text
Press A201
→ onPress
→ onSelect(room)
→ setSelectedRoom(room)
→ selectedRoom = A201
→ React render lại
→ UI hiển thị Selected: A201
```

Đây là workflow quan trọng nhất của Week 6.

---

# 24. `purpose` State + TextInput

Trong `App()`:

```tsx
const [purpose, setPurpose] =
  useState("");
```

Import:

```tsx
TextInput
```

Thêm:

```tsx
<Text style={styles.label}>
  Purpose
</Text>

<TextInput
  style={styles.input}
  value={purpose}
  onChangeText={setPurpose}
  placeholder="Booking purpose"
/>

<Text>
  Current purpose: {purpose || "(empty)"}
</Text>
```

Dòng `Current purpose` chỉ dùng để dễ quan sát state trong lúc học.

Khi nhập:

```text
Team meeting
```

màn hình sẽ hiển thị:

```text
Purpose
[ Team meeting ]

Current purpose: Team meeting
```

---

# 25. `TextInput` và State

Hai prop quan trọng:

```tsx
value={purpose}
onChangeText={setPurpose}
```

Có thể hiểu:

```text
value={purpose}
→ đưa state vào TextInput

onChangeText={setPurpose}
→ đưa nội dung user nhập trở lại state
```

Luồng:

```text
User typing
→ onChangeText(text)
→ setPurpose(text)
→ purpose state đổi
→ React render lại
→ value={purpose}
→ TextInput hiển thị giá trị mới
```

---

# 26. Mini experiment — bỏ `onChangeText`

Tạm comment:

```tsx
// onChangeText={setPurpose}
```

chỉ giữ:

```tsx
<TextInput
  style={styles.input}
  value={purpose}
  placeholder="Booking purpose"
/>
```

Vì `purpose` không được cập nhật nên input gần như không nhập được hoặc ký tự vừa nhập bị trả về giá trị state cũ.

Bật lại:

```tsx
onChangeText={setPurpose}
```

rồi thử nhập lại.

Điểm cần nhớ:

```text
State
→ UI
→ User interaction
→ Event
→ State
→ UI
```

---

# 27. Thêm state `message`

Trong `App()`:

```tsx
const [message, setMessage] =
  useState("");
```

---

# 28. `handleBookRoom()` phải nằm ở đâu?

Trong demo này, đặt `handleBookRoom()` **bên trong `App()`**, sau các `useState(...)` và trước `return (...)`.

Cấu trúc:

```tsx
export default function App() {
  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);

  const [purpose, setPurpose] =
    useState("");

  const [message, setMessage] =
    useState("");

  function handleBookRoom() {
    // đọc selectedRoom
    // đọc purpose
    // gọi setMessage(...)
  }

  return (
    // UI
  );
}
```

Lý do:

```text
handleBookRoom()
cần đọc:
→ selectedRoom
→ purpose

và cần gọi:
→ setMessage(...)
```

Các biến/hàm này thuộc scope của `App()`.

Nếu đặt `handleBookRoom()` ra ngoài `App()` nhưng giữ nguyên code bên trong, hàm sẽ không truy cập trực tiếp được các state của component.

---

# 29. Validation đơn giản

Trong `App()`:

```tsx
function handleBookRoom() {
  if (!selectedRoom) {
    setMessage(
      "Please select a room."
    );
    return;
  }

  if (!purpose.trim()) {
    setMessage(
      "Please enter purpose."
    );
    return;
  }

  setMessage(
    `Booked ${selectedRoom.name}`
  );
}
```

Thêm nút:

```tsx
<Pressable
  style={styles.bookButton}
  onPress={handleBookRoom}
>
  <Text style={styles.bookButtonText}>
    Book Room
  </Text>
</Pressable>
```

Thêm message:

```tsx
{message ? (
  <Text style={styles.message}>
    {message}
  </Text>
) : null}
```

---

# 30. Test Validation

## Case A — chưa chọn Room

```text
selectedRoom = null
purpose = "Meeting"
```

Bấm:

```text
Book Room
```

PASS:

```text
Please select a room.
```

---

## Case B — có Room nhưng purpose rỗng

```text
selectedRoom = A201
purpose = ""
```

PASS:

```text
Please enter purpose.
```

---

## Case C — đủ dữ liệu

```text
selectedRoom = A201
purpose = "Team meeting"
```

PASS:

```text
Booked A201
```

Lưu ý:

> Week 6 chỉ cập nhật state local và message trên UI. Chưa có dữ liệu nào được gửi lên server.

---

# 31. Code hoàn chỉnh `App.tsx`

```tsx
import { useState } from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Room = {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
};

type RoomCardProps = {
  room: Room;
  onSelect: (room: Room) => void;
};

const rooms: Room[] = [
  {
    id: "a201",
    name: "A201",
    capacity: 30,
    available: true,
  },
  {
    id: "a202",
    name: "A202",
    capacity: 50,
    available: true,
  },
  {
    id: "b101",
    name: "B101",
    capacity: 40,
    available: true,
  },
];

function RoomCard({
  room,
  onSelect,
}: RoomCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.roomName}>
        {room.name}
      </Text>

      <Text style={styles.roomMeta}>
        Capacity: {room.capacity}
      </Text>

      <Text style={styles.roomMeta}>
        {room.available
          ? "Available"
          : "Unavailable"}
      </Text>

      <Pressable
        style={styles.selectButton}
        onPress={() => onSelect(room)}
      >
        <Text style={styles.selectButtonText}>
          Select
        </Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);

  const [purpose, setPurpose] =
    useState("");

  const [message, setMessage] =
    useState("");

  function handleBookRoom() {
    if (!selectedRoom) {
      setMessage(
        "Please select a room."
      );
      return;
    }

    if (!purpose.trim()) {
      setMessage(
        "Please enter purpose."
      );
      return;
    }

    setMessage(
      `Booked ${selectedRoom.name}`
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>
        WEEK 6 · REACT NATIVE + EXPO
      </Text>

      <Text style={styles.title}>
        Room Booking
      </Text>

      <Text style={styles.sectionTitle}>
        Available Rooms
      </Text>

      <FlatList
        style={styles.list}
        contentContainerStyle={
          styles.listContent
        }
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onSelect={setSelectedRoom}
          />
        )}
      />

      <View style={styles.bookingPanel}>
        <Text style={styles.selectedText}>
          Selected:{" "}
          {selectedRoom
            ? selectedRoom.name
            : "None"}
        </Text>

        <Text style={styles.label}>
          Purpose
        </Text>

        <TextInput
          style={styles.input}
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Booking purpose"
          returnKeyType="done"
        />

        <Pressable
          style={styles.bookButton}
          onPress={handleBookRoom}
        >
          <Text style={styles.bookButtonText}>
            Book Room
          </Text>
        </Pressable>

        {message ? (
          <Text style={styles.message}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 8,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  roomName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  roomMeta: {
    marginBottom: 2,
  },

  selectButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#222222",
  },

  selectButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  bookingPanel: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  selectedText: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  bookButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#222222",
  },

  bookButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  message: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
```

---

# 32. Workflow cuối cần nhớ

Luồng Room List:

```text
rooms[]
   ↓
FlatList
   ↓
RoomCard
   ↓
Props
```

Luồng chọn Room:

```text
Press Select
   ↓
setSelectedRoom()
   ↓
selectedRoom state
   ↓
React re-render
   ↓
Selected: A201
```

Luồng Purpose:

```text
TextInput
   ↓
onChangeText
   ↓
setPurpose()
   ↓
purpose state
```

Luồng Book:

```text
selectedRoom
+
purpose
   ↓
handleBookRoom()
   ↓
setMessage()
   ↓
message state
   ↓
UI result
```

---

# 33. Checkpoint cuối Demo

- [ ] Project tạo được bằng Expo.
- [ ] App chạy trên Android Emulator hoặc điện thoại thật qua Expo Go.
- [ ] `App.tsx` render được.
- [ ] Biết dùng `View` và `Text`.
- [ ] StyleSheet hoạt động.
- [ ] `rooms[]` có dữ liệu.
- [ ] `FlatList` render được nhiều phòng.
- [ ] `RoomCard` là component riêng.
- [ ] `room` được truyền bằng props.
- [ ] Press `Select` thay đổi `selectedRoom`.
- [ ] UI hiển thị đúng room đang chọn.
- [ ] `TextInput` cập nhật `purpose`.
- [ ] Hiểu vai trò của `value` và `onChangeText`.
- [ ] Validation chặn khi chưa chọn room.
- [ ] Validation chặn khi chưa nhập purpose.
- [ ] Book đủ dữ liệu hiển thị message.
- [ ] Giải thích được State → Re-render → UI.

Nếu đủ:

```text
Week 6 Demo: PASS
```

---

# 34. Debug nhanh

## Metro không chạy

```cmd
npm start
```

hoặc:

```cmd
npx expo start
```

---

## Android Emulator chưa mở

```text
Android Studio
→ Device Manager
→ Start Emulator
```

Sau đó quay lại Metro và nhấn:

```text
a
```

---

## Điện thoại quét QR nhưng không mở được app

Kiểm tra:

```text
Expo Go đã cài?
Máy tính và điện thoại cùng Wi-Fi?
Metro còn chạy?
Windows Firewall có chặn?
```

Nếu cần:

```cmd
npx expo start --tunnel
```

---

## App không cập nhật

Kiểm tra:

```text
file đã Save?
Metro còn chạy?
app còn kết nối development server?
```

---

## `useState` báo lỗi

Kiểm tra:

```tsx
import { useState } from "react";
```

---

## Component chưa được import

Kiểm tra:

```tsx
import {
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
```

---

# 35. Những phần Week 6 chưa làm

Không cần mở rộng sang:

```text
Expo Router
React Navigation
Context
Redux
Zustand
AsyncStorage
SQLite
Firebase
Supabase
API
Authentication
Camera
Geolocation
Push Notification
```

Mục tiêu của Week 6 là hiểu chắc:

```text
Data
+ Components
+ Props
+ State
+ Events
```

---

# 36. Kết nối sang Week tiếp theo

Hiện tại app chỉ có local state:

```text
Device A
→ local state

Device B
→ local state
```

Câu hỏi tiếp theo:

> Nếu nhiều thiết bị cần nhìn thấy cùng dữ liệu booking thì local state có đủ không?

Week 6 dừng tại đây.

---

# 37. Tổng kết

Sau Week 6 cần giải thích được:

```text
Data
→ Components
→ Interaction
→ State change
→ Re-render
→ UI
```

Và phân biệt:

```text
Props
→ dữ liệu component nhận vào

State
→ dữ liệu có thể thay đổi
→ React giữ giữa các lần render
→ thay đổi state làm UI render lại
```

Điểm quan trọng nhất:

> **React Native không bắt đầu từ một app lớn. Nó bắt đầu từ data + components + state + events.**
