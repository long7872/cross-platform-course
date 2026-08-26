# CHECKPOINTS — MOBILE STACK ADVISOR

## Tổng thời gian gợi ý

| Checkpoint | Thời gian |
|---|---:|
| 1. State từ UI | 10–15 phút |
| 2. Rule-based recommendation | 15 phút |
| 3. Scoring engine | 20–25 phút |
| 4. Refactor 3 lớp | 20–25 phút |
| 5. Custom criterion | 15–20 phút |

---

# Checkpoint 1 — Tạo state từ giao diện

## Nhiệm vụ

Khi người dùng bấm **Phân tích**, hãy đọc trạng thái của 7 checkbox và tạo object:

```js
const requirements = {
  appStore: false,
  highPerformance: false,
  hardwareAccess: false,
  existingWebApp: false,
  offline: false,
  webTeam: false,
  fastMvp: false
};
```

Sau đó hiển thị object này vào vùng kết quả bằng `JSON.stringify()` để kiểm tra.

## Hoàn thành khi

- Tick/bỏ tick checkbox làm giá trị `true/false` thay đổi đúng.
- Không hard-code state.
- Không cần đề xuất stack ở checkpoint này.

## Câu hỏi nhanh

**State của ứng dụng này là gì?**

Gợi ý: hãy nghĩ đến dữ liệu nào thay đổi khi người dùng tương tác với UI.

---

# Checkpoint 2 — Rule-based recommendation

## Nhiệm vụ

Viết hàm:

```js
function recommendByRules(req) {
  // TODO
}
```

Phiên bản đầu có thể sử dụng `if/else`.

Ví dụ logic khởi đầu:

- Nếu hiệu năng rất cao **và** cần truy cập phần cứng nhiều → nghiêng về **Native**.
- Nếu đã có Web App **và** cần App Store → nghiêng về **Capacitor**.
- Nếu không ưu tiên App Store nhưng cần offline và cần MVP nhanh → có thể nghiêng về **PWA**.
- Các ứng dụng nghiệp vụ cần Android + iOS có thể nghiêng về **Cross-platform**.

## Test case bắt buộc

### Case A
```text
High performance = true
Hardware access = true
```

Kỳ vọng: **Native**

### Case B
```text
Existing Web App = true
App Store = true
Web/JS team = true
```

Kỳ vọng: **Capacitor**

### Case C
```text
Offline = true
Fast MVP = true
App Store = false
```

Kỳ vọng: **PWA**

### Case D
```text
App Store = true
High performance = false
Existing Web App = false
```

Kỳ vọng: **Cross-platform**

## Câu hỏi thảo luận

Điều gì xảy ra nếu một dự án cùng lúc thỏa nhiều rule?

Đây là lý do chúng ta chuyển sang Checkpoint 3.

---

# Checkpoint 3 — Xây dựng scoring engine

## Nhiệm vụ

Thay `if/else` bằng một hệ thống điểm.

Khởi tạo:

```js
const scores = {
  native: 0,
  capacitor: 0,
  crossPlatform: 0,
  pwa: 0
};
```

Mỗi requirement sẽ cộng/trừ điểm cho một hoặc nhiều chiến lược.

Trong đáp án mẫu của giảng viên, **Cross-platform bắt đầu với 1 điểm nền** để biểu diễn việc đây là ứng viên hợp lý cho nhiều ứng dụng nghiệp vụ thông thường. Bạn có thể để tất cả bằng 0 nếu giải thích được cách thiết kế của mình.

## Một scoring model gợi ý

> Bạn có thể điều chỉnh điểm nếu có lý do hợp lý.

### `highPerformance`

```text
Native          +4
Cross-platform  +2
```

### `hardwareAccess`

```text
Native          +3
Capacitor       +2
Cross-platform  +2
PWA             -2
```

### `existingWebApp`

```text
Capacitor       +4
PWA             +2
```

### `appStore`

```text
Native          +2
Capacitor       +2
Cross-platform  +2
PWA             -3
```

### `offline`

```text
Native          +1
Capacitor       +2
Cross-platform  +2
PWA             +3
```

### `webTeam`

```text
Capacitor       +3
PWA             +3
Cross-platform  +1
```

### `fastMvp`

```text
PWA             +3
Capacitor       +2
Cross-platform  +2
Native          -1
```

## Yêu cầu output

Sau khi bấm **Phân tích**, giao diện phải hiển thị:

1. Stack được đề xuất.
2. Điểm của cả 4 chiến lược.
3. Ít nhất 2 lý do liên quan đến các requirement đã chọn.

Ví dụ:

```text
Đề xuất: Capacitor

Native: 1
Capacitor: 9
Cross-platform: 5
PWA: 4

Lý do:
- Dự án đã có Web App nên Capacitor có lợi thế tái sử dụng code.
- Dự án cần App Store nên PWA thuần không phải lựa chọn thuận lợi.
```

## Bonus

Nếu hai stack đồng điểm cao nhất, hãy hiển thị:

```text
Cần xem xét thêm: Capacitor và Cross-platform đang đồng điểm.
```

---

# Checkpoint 4 — Refactor thành kiến trúc 3 lớp

Bạn đang có logic UI, dữ liệu mô tả framework và scoring logic trộn trong cùng `index.html`.

Hãy refactor thành:

```text
project/
├── index.html
├── stacks.js
├── decision.js
└── app.js
```

## Data — `stacks.js`

Chứa dữ liệu mô tả các chiến lược.

Ví dụ:

```js
const STACKS = {
  native: {
    name: "Native",
    technology: "Swift / Kotlin"
  }
};
```

## Business Logic — `decision.js`

Chứa:

```js
function calculateScores(requirements) {
  // ...
}

function getRecommendation(requirements) {
  // ...
}
```

Không đọc DOM trong file này.

## Presentation — `app.js`

Chứa:

- đọc checkbox;
- tạo state;
- gọi business logic;
- render kết quả lên giao diện.

## `index.html`

Chỉ còn:

- HTML;
- CSS;
- các thẻ `<script src="...">`.

Dùng script theo thứ tự:

```html
<script src="stacks.js"></script>
<script src="decision.js"></script>
<script src="app.js"></script>
```

## Câu hỏi checkpoint

Hãy chỉ ra trong project của bạn:

```text
Presentation = ?
Business Logic = ?
Data = ?
State = ?
```

---

# Checkpoint 5 — Thêm một tiêu chí mới

Chọn **một** trong các tiêu chí sau hoặc đề xuất tiêu chí khác:

- cần AR/VR;
- không muốn phát hành qua App Store;
- ngân sách rất thấp;
- phải chạy cả desktop/web;
- UI cần kiểm soát pixel rất chặt;
- team có kinh nghiệm Dart;
- team có kinh nghiệm React/JavaScript.

## Yêu cầu

Bạn phải thay đổi đủ các phần liên quan:

1. UI có checkbox/input mới.
2. State có thuộc tính mới.
3. Scoring logic xử lý tiêu chí mới.
4. Giao diện giải thích tác động của tiêu chí mới.
5. README giải thích vì sao bạn cho điểm như vậy.

---

# Bài kiểm tra cuối lab

Hãy chạy ít nhất 4 tình huống:

## Tình huống 1 — Game/AR nặng

```text
High performance
Hardware access
App Store
```

## Tình huống 2 — Công ty đã có Web App

```text
Existing Web App
Web/JS team
App Store
Fast MVP
```

## Tình huống 3 — Thu thập dữ liệu nơi mạng yếu

```text
Offline
Hardware access
Fast MVP
```

## Tình huống 4 — App nghiệp vụ Android + iOS

```text
App Store
Offline
Không có Existing Web App
Không yêu cầu High performance
```

Với mỗi tình huống, hãy trả lời:

```text
Advisor chọn gì?
Bạn có đồng ý không?
Nếu không, tiêu chí nào còn thiếu?
```
