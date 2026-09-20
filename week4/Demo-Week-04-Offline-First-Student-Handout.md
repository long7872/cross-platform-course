# DEMO TUẦN 4 — OFFLINE-FIRST DATA
## Tài liệu thực hành dành cho sinh viên

> Tuần 3 trả lời: **“Làm sao để ứng dụng vẫn mở được khi mất mạng?”**
>
> Tuần 4 trả lời tiếp: **“Làm sao để dữ liệu người dùng vẫn được lưu khi mất mạng và tự đồng bộ khi có mạng trở lại?”**

> **Cách sử dụng tài liệu:** thực hiện lần lượt từng phần, không copy toàn bộ project một lần. Sau mỗi checkpoint, mở Chrome DevTools để quan sát Service Worker, Cache Storage, IndexedDB, Network và trạng thái `pending/synced`.

---

# 1. Mục tiêu demo

Sau khi hoàn thành demo, cần hiểu và kiểm tra được luồng:

```text
Schema
  ↓
Dynamic Form
  ↓
Skip Logic
  ↓
Submit
  ↓
IndexedDB
  ↓
syncStatus = pending
  ↓
Online trở lại
  ↓
POST /api/submissions
  ↓
syncStatus = synced
```

Các ý chính:

1. Form được sinh từ schema thay vì hardcode từng câu hỏi.
2. `showIf` dùng để làm skip logic.
3. IndexedDB lưu dữ liệu nghiệp vụ, khác Cache API của Tuần 3.
4. Mỗi submission có UUID riêng.
5. Offline vẫn lưu được submission local với trạng thái `pending`.
6. Khi online trở lại, sync engine gửi các record `pending` lên server.
7. Sync thành công thì local metadata chuyển sang `synced`.
8. Server dùng UUID để tránh duplicate khi client retry.
9. Append-only giúp tránh nhiều client cùng sửa một record.

---

# 2. Nối kiến thức từ Tuần 3

Tuần 3:

```text
Cache API
→ HTML
→ CSS
→ JavaScript
→ image/icon
→ App Shell vẫn mở khi Offline
```

Tuần 4:

```text
IndexedDB
→ survey answers
→ submission metadata
→ pending queue
→ dữ liệu không mất khi Offline
```

Ghi nhớ:

> **Cache API lưu tài nguyên Web. IndexedDB lưu dữ liệu ứng dụng.**

---

# 3. Kiến trúc demo

```text
┌─────────────────────────┐
│ Browser / PWA           │
│                         │
│ Dynamic Form            │
│ IndexedDB               │
│ Service Worker + Cache  │
│ Sync Engine             │
└────────────┬────────────┘
             │
             │ POST /api/submissions
             ▼
┌─────────────────────────┐
│ Vite Dev Proxy          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Mock API Server         │
│ localhost:3001          │
└─────────────────────────┘
```

Frontend vẫn dùng Vite như Tuần 3. Mock API dùng Express để sinh viên thấy một request sync thật sự tới server.

---

# 4. Cấu trúc project

```text
week4-offline-demo/
│
├── index.html
├── package.json
├── server.js
├── vite.config.js
│
└── public/
    ├── app.js
    ├── db.js
    ├── survey-schema.js
    ├── style.css
    ├── sw.js
    ├── manifest.json
    └── icons/
        ├── icon-192.png
        └── icon-512.png
```

---

# 5. Khởi tạo project

Có thể copy project cuối Tuần 3 rồi đổi tên:

```text
week3-pwa-demo
        ↓
week4-offline-demo
```

Nếu tạo mới:

```bash
npm create vite@latest week4-offline-demo -- --template vanilla
cd week4-offline-demo
npm install
npm install express
```

Trong `package.json`, **chỉ cần thêm** script `api` vào object `scripts` hiện có:

```json
{
  "scripts": {
    "dev": "vite",
    "api": "node server.js",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Nếu project được copy từ starter TypeScript của Tuần 3 và đang có:

```json
"build": "tsc && vite build"
```

thì **giữ nguyên** dòng đó, chỉ thêm:

```json
"api": "node server.js"
```

Sau đó cài Express:

```bash
npm install express
```

`server.js` phải nằm **cùng cấp với `package.json`**. Nếu chạy:

```bash
npm run api
```

mà thấy:

```text
Cannot find module '.../server.js'
```

thì nguyên nhân là project chưa có file `server.js` ở thư mục gốc.

Khi demo sẽ chạy hai terminal:

```text
Terminal 1
npm run api
```

```text
Terminal 2
npm run dev
```

---

# 6. Mock API Server

Tạo `server.js`:

```javascript
import express from "express";

const app = express();
const PORT = 3001;

app.use(express.json());

const submissions = [];
const receivedIds = new Set();

app.get("/api/submissions", (req, res) => {
  res.json(submissions);
});

app.post("/api/submissions", (req, res) => {
  const submission = req.body;

  if (!submission?.id) {
    return res.status(400).json({
      ok: false,
      message: "Missing submission id"
    });
  }

  if (receivedIds.has(submission.id)) {
    return res.status(200).json({
      ok: true,
      duplicate: true,
      id: submission.id
    });
  }

  receivedIds.add(submission.id);

  submissions.push({
    ...submission,
    receivedAt: new Date().toISOString()
  });

  console.log(
    `[API] received ${submission.id}`,
    submission.answers
  );

  res.status(201).json({
    ok: true,
    id: submission.id,
    receivedAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(
    `Mock API running at http://localhost:${PORT}`
  );
});
```

---

# 7. Vì sao server cần chống duplicate?

Tình huống:

```text
Client POST
   ↓
Server đã lưu
   ↓
Response bị mất
   ↓
Client tưởng sync fail
   ↓
Client retry
```

Nếu server tạo record mới cho mỗi retry thì dữ liệu bị trùng.

Ta dùng:

```text
submission UUID
→ idempotency key đơn giản
```

Cùng một UUID retry nhiều lần nhưng server chỉ lưu một record.

---

# 8. Vite Proxy — dùng cho cả Dev và Preview

Tạo `vite.config.js`:

```javascript
import { defineConfig } from "vite";

// Chức năng: dùng chung cấu hình proxy cho dev server và preview server.
const proxyConfig = {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true
  }
};

export default defineConfig({
  // Chạy với `npm run dev`.
  server: {
    proxy: proxyConfig
  },

  // Chạy với `npm run preview`.
  preview: {
    proxy: proxyConfig
  }
});
```

Frontend chỉ gọi:

```javascript
fetch("/api/submissions")
```

Khi chạy Dev:

```text
http://localhost:5173/api/submissions
→ proxy
→ http://localhost:3001/api/submissions
```

Khi chạy Preview:

```text
http://localhost:4173/api/submissions
→ proxy
→ http://localhost:3001/api/submissions
```

Điểm này quan trọng vì checkpoint Offline cuối cùng sẽ được test bằng:

```bash
npm run build
npm run preview
```

---

# 9. Survey Schema

Tạo `public/survey-schema.js`:

```javascript
export const facilitySurveySchema = {
  id: "facility-survey-v1",
  title: "Khảo sát cơ sở vật chất",

  fields: [
    {
      id: "facility_name",
      label: "Tên khu vực / phòng",
      type: "text",
      required: true
    },

    {
      id: "condition",
      label: "Tình trạng",
      type: "radio",
      required: true,
      options: [
        { value: "good", label: "Tốt" },
        { value: "damaged", label: "Hư hỏng" }
      ]
    },

    {
      id: "damage_description",
      label: "Mô tả hư hỏng",
      type: "textarea",
      required: true,
      showIf: {
        field: "condition",
        equals: "damaged"
      }
    },

    {
      id: "priority",
      label: "Mức độ ưu tiên xử lý",
      type: "radio",
      options: [
        { value: "low", label: "Thấp" },
        { value: "medium", label: "Trung bình" },
        { value: "high", label: "Cao" }
      ],
      showIf: {
        field: "condition",
        equals: "damaged"
      }
    }
  ]
};
```

---

# 10. Tại sao dùng schema? Ta đang chứng minh điều gì?

Nếu hardcode toàn bộ HTML:

```text
Form A
→ HTML riêng

Form B
→ HTML riêng

Form C
→ HTML riêng
```

thì mỗi form mới lại phải sửa UI.

Với schema:

```text
Schema
  ↓
FormRenderer
  ↓
UI
```

Ta có thể đổi:

- label;
- field type;
- options;
- thứ tự field;
- `showIf`;
- `required`;

mà không hardcode lại toàn bộ form.

Ghi nhớ:

> **Mục tiêu của Dynamic Form không phải để học cách tạo `<input>` bằng JavaScript. Mục tiêu là học cách tách cấu trúc form ra khỏi giao diện, để một renderer có thể đọc schema và sinh UI động.**

Nói cách khác:

> **Schema-driven UI biến “giao diện” thành dữ liệu có thể cấu hình.**

Điều này dẫn tới ba lợi ích:

```text
1. Reuse
Một FormRenderer dùng được cho nhiều survey.

2. Conditional UI
showIf quyết định câu hỏi hiện/ẩn.

3. Configurable App
Sau này schema có thể đến từ server
mà không cần hardcode lại toàn bộ giao diện.
```

Đây là lý do Field Survey phù hợp để minh họa kiến trúc ứng dụng thực tế hơn một form tĩnh đơn giản.

---

# 11. HTML chính

`index.html`:

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>VKU Field Survey</title>

    <link
      rel="manifest"
      href="/manifest.json"
    />

    <meta
      name="theme-color"
      content="#0f766e"
    />

    <link
      rel="stylesheet"
      href="/style.css"
    />
  </head>

  <body>
    <main class="app">
      <header>
        <p class="eyebrow">
          WEEK 4 — OFFLINE-FIRST DEMO
        </p>

        <h1>VKU Field Survey</h1>

        <p
          id="network-status"
          class="status"
        ></p>
      </header>

      <section class="panel">
        <h2 id="form-title"></h2>

        <form id="survey-form"></form>
      </section>

      <section class="panel">
        <div class="section-header">
          <h2>
            Submissions trên thiết bị
          </h2>

          <button
            id="sync-button"
            type="button"
          >
            Sync pending
          </button>
        </div>

        <div id="submission-list"></div>
      </section>
    </main>

    <script
      type="module"
      src="/app.js"
    ></script>
  </body>
</html>
```

## 11.1. Nếu copy từ Vite starter cũ

Kiểm tra cuối `index.html`.

Chỉ giữ entry script của demo:

```html
<script type="module" src="/app.js"></script>
```

Nếu project cũ vẫn còn:

```html
<script type="module" src="/src/main.ts"></script>
```

hoặc một entry script starter khác thì xóa nó.

Nếu để cả hai, production build có thể sinh thêm bundle kiểu:

```text
/assets/index-XXXX.js
```

và gây khó hiểu khi kiểm thử Offline.

---

# 12. CSS tối thiểu

`public/style.css`:

```css
:root {
  font-family: Arial, sans-serif;
  color: #1f2937;
  background: #f8fafc;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
textarea {
  font: inherit;
}

.app {
  width: min(900px, calc(100% - 32px));
  margin: 0 auto;
  padding: 40px 0;
}

.eyebrow {
  color: #0f766e;
  font-weight: 700;
}

.status {
  display: inline-block;
  padding: 8px 12px;
  background: #e2e8f0;
  border-radius: 10px;
}

.panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-top: 20px;
}

.field {
  margin-bottom: 20px;
}

.field > label,
.field > .field-label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 10px 12px;
}

textarea {
  min-height: 100px;
}

.radio-option {
  display: block;
  margin: 8px 0;
}

.actions {
  margin-top: 24px;
}

button {
  border: 0;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}

button[type="submit"] {
  background: #0f766e;
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.submission {
  border-top: 1px solid #e2e8f0;
  padding: 14px 0;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}
```

---

# 13. Bước 1 — Render Dynamic Form

Trong `public/app.js`:

```javascript
import {
  facilitySurveySchema
} from "/survey-schema.js";

const formEl =
  document.querySelector("#survey-form");

const titleEl =
  document.querySelector("#form-title");

titleEl.textContent =
  facilitySurveySchema.title;

const answers = {};

function renderForm() {
  formEl.innerHTML = "";

  for (
    const field
    of facilitySurveySchema.fields
  ) {
    if (!shouldShowField(field)) {
      continue;
    }

    formEl.appendChild(
      renderField(field)
    );
  }

  const actions =
    document.createElement("div");

  actions.className = "actions";

  const submitButton =
    document.createElement("button");

  submitButton.type = "submit";
  submitButton.textContent =
    "Lưu khảo sát";

  actions.appendChild(submitButton);
  formEl.appendChild(actions);
}

function shouldShowField(field) {
  if (!field.showIf) {
    return true;
  }

  return (
    answers[field.showIf.field]
    === field.showIf.equals
  );
}
```

---

# 14. Render từng field type

Tiếp tục trong `app.js`:

```javascript
function renderField(field) {
  const wrapper =
    document.createElement("div");

  wrapper.className = "field";

  if (field.type === "text") {
    const label =
      document.createElement("label");

    label.textContent = field.label;

    const input =
      document.createElement("input");

    input.type = "text";
    input.value =
      answers[field.id] ?? "";

    input.addEventListener(
      "input",
      () => {
        answers[field.id] =
          input.value;
      }
    );

    wrapper.append(label, input);
  }

  if (field.type === "textarea") {
    const label =
      document.createElement("label");

    label.textContent = field.label;

    const textarea =
      document.createElement("textarea");

    textarea.value =
      answers[field.id] ?? "";

    textarea.addEventListener(
      "input",
      () => {
        answers[field.id] =
          textarea.value;
      }
    );

    wrapper.append(
      label,
      textarea
    );
  }

  if (field.type === "radio") {
    const label =
      document.createElement("div");

    label.className =
      "field-label";

    label.textContent =
      field.label;

    wrapper.appendChild(label);

    for (
      const option
      of field.options
    ) {
      const optionLabel =
        document.createElement("label");

      optionLabel.className =
        "radio-option";

      const input =
        document.createElement("input");

      input.type = "radio";
      input.name = field.id;
      input.value = option.value;

      input.checked =
        answers[field.id]
        === option.value;

      input.addEventListener(
        "change",
        () => {
          answers[field.id] =
            option.value;

          renderForm();
        }
      );

      optionLabel.append(
        input,
        ` ${option.label}`
      );

      wrapper.appendChild(
        optionLabel
      );
    }
  }

  return wrapper;
}

renderForm();
```

---

# 15. Checkpoint — Dynamic Form

Thử thay:

```text
label
options
field order
```

trong schema nhưng không sửa `index.html`.

Cần quan sát:

> UI được sinh từ schema.

---

# 16. Bước 2 — Skip Logic

Trong schema:

```javascript
showIf: {
  field: "condition",
  equals: "damaged"
}
```

Trong renderer:

```javascript
function shouldShowField(field) {
  if (!field.showIf) {
    return true;
  }

  return (
    answers[field.showIf.field]
    === field.showIf.equals
  );
}
```

Test:

```text
Condition = Good
→ damage_description ẩn
→ priority ẩn
```

```text
Condition = Damaged
→ damage_description hiện
→ priority hiện
```

---

# 17. Bug thường gặp với skip logic

Tình huống:

```text
1. Chọn Damaged
2. Nhập "Hỏng quạt"
3. Đổi lại Good
```

Field đã ẩn, nhưng:

```javascript
answers.damage_description
```

có thể vẫn còn giá trị cũ.

Có hai chính sách hợp lệ:

```text
A. Giữ giá trị ẩn
B. Xóa giá trị khi field bị ẩn
```

Trong demo chọn **B** để payload sạch hơn.

Thêm:

```javascript
function removeHiddenAnswers() {
  for (
    const field
    of facilitySurveySchema.fields
  ) {
    if (!shouldShowField(field)) {
      delete answers[field.id];
    }
  }
}
```

Trong change handler:

```javascript
input.addEventListener(
  "change",
  () => {
    answers[field.id] =
      option.value;

    removeHiddenAnswers();
    renderForm();
  }
);
```

---

# 18. IndexedDB — data model

Ta dùng:

```text
Database:
vku-field-survey-db

Object Store:
submissions

keyPath:
id

Index:
syncStatus
```

Một record:

```javascript
{
  id: "uuid",

  formId:
    "facility-survey-v1",

  answers: {
    facility_name: "Phòng A201",
    condition: "damaged",
    damage_description:
      "Hỏng quạt"
  },

  createdAt: "...",

  syncStatus: "pending",
  syncAttempts: 0,
  lastError: null,
  syncedAt: null
}
```

---

# 19. Tạo IndexedDB helper

Tạo `public/db.js`:

```javascript
const DB_NAME =
  "vku-field-survey-db";

const DB_VERSION = 1;

const STORE_NAME =
  "submissions";

function requestToPromise(request) {
  return new Promise(
    (resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    }
  );
}

export function openDB() {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          if (
            !db.objectStoreNames
              .contains(STORE_NAME)
          ) {
            const store =
              db.createObjectStore(
                STORE_NAME,
                {
                  keyPath: "id"
                }
              );

            store.createIndex(
              "syncStatus",
              "syncStatus",
              {
                unique: false
              }
            );
          }
        };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    }
  );
}
```

---

# 20. Lưu submission

Trong `db.js`:

```javascript
export async function
saveSubmission(submission) {
  const db = await openDB();

  const transaction =
    db.transaction(
      STORE_NAME,
      "readwrite"
    );

  const store =
    transaction.objectStore(
      STORE_NAME
    );

  await requestToPromise(
    store.put(submission)
  );
}
```

---

# 21. Đọc tất cả submissions

```javascript
export async function
getAllSubmissions() {
  const db = await openDB();

  const transaction =
    db.transaction(
      STORE_NAME,
      "readonly"
    );

  const store =
    transaction.objectStore(
      STORE_NAME
    );

  return requestToPromise(
    store.getAll()
  );
}
```

---

# 22. Đọc pending bằng index

```javascript
export async function
getPendingSubmissions() {
  const db = await openDB();

  const transaction =
    db.transaction(
      STORE_NAME,
      "readonly"
    );

  const store =
    transaction.objectStore(
      STORE_NAME
    );

  const index =
    store.index("syncStatus");

  return requestToPromise(
    index.getAll("pending")
  );
}
```

Ghi nhớ:

> Ta tạo index `syncStatus` vì sync engine thường xuyên cần tìm các record đang `pending`.

---

# 23. Cập nhật local sync metadata

```javascript
export async function
updateSubmission(id, changes) {
  const db = await openDB();

  const transaction =
    db.transaction(
      STORE_NAME,
      "readwrite"
    );

  const store =
    transaction.objectStore(
      STORE_NAME
    );

  const current =
    await requestToPromise(
      store.get(id)
    );

  if (!current) {
    throw new Error(
      "Submission not found"
    );
  }

  const updated = {
    ...current,
    ...changes
  };

  await requestToPromise(
    store.put(updated)
  );

  return updated;
}
```

---

# 24. Append-only nghĩa là gì ở đây?

Business submission trên server:

```text
submission mới
→ POST
→ record mới
```

Mỗi submission có UUID riêng:

```text
Survey #1 → UUID A
Survey #2 → UUID B
Survey #3 → UUID C
```

Ta không có bài toán:

```text
Client 1 sửa record X
Client 2 sửa record X
→ merge conflict
```

Lưu ý:

> Local `syncStatus`, `syncAttempts`, `syncedAt` vẫn được cập nhật vì đây là metadata của sync engine. Điều đó không mâu thuẫn với append-only business model trên server.

---

# 25. Bước 3 — Submit vào IndexedDB

Trong `app.js`:

```javascript
import {
  saveSubmission,
  getAllSubmissions,
  getPendingSubmissions,
  updateSubmission
} from "/db.js";
```

Thêm submit handler:

```javascript
formEl.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    removeHiddenAnswers();

    const submission = {
      id: crypto.randomUUID(),

      formId:
        facilitySurveySchema.id,

      answers: {
        ...answers
      },

      createdAt:
        new Date().toISOString(),

      syncStatus: "pending",
      syncAttempts: 0,
      lastError: null,
      syncedAt: null
    };

    await saveSubmission(
      submission
    );

    console.log(
      "Saved locally:",
      submission
    );

    clearForm();

    await renderSubmissionList();

    if (navigator.onLine) {
      await syncPendingSubmissions();
    }
  }
);
```

---

# 26. Clear form

```javascript
function clearForm() {
  for (
    const key
    of Object.keys(answers)
  ) {
    delete answers[key];
  }

  renderForm();
}
```

---

# 27. Checkpoint — Submit khi Offline

Trong DevTools:

```text
Network
→ Offline
```

Điền form:

```text
Tên:
Phòng A201

Condition:
Damaged

Mô tả:
Hỏng quạt

Priority:
High
```

Bấm:

```text
Lưu khảo sát
```

Kết quả mong đợi:

```text
Không sync lên server
nhưng submission vẫn được lưu local
```

---

# 28. Quan sát IndexedDB

Mở:

```text
Application
→ IndexedDB
→ vku-field-survey-db
→ submissions
```

**Click vào `submissions`**, không click vào index con `syncStatus`.

Cần thấy các record có:

```text
id
formId
answers
createdAt
syncStatus = pending
syncAttempts = 0
lastError
syncedAt
```

Nếu DevTools hiện:

```text
Data may be stale
```

thì bấm nút **Refresh** ở phía trên.

Node:

```text
submissions
```

là **Object Store** chứa record thật.

Node:

```text
syncStatus
```

bên dưới là **Index**, chỉ hỗ trợ query theo trạng thái sync.

Đây là checkpoint quan trọng đầu tiên.

---

# 29. Reload khi vẫn Offline

Giữ:

```text
Network → Offline
```

Reload.

Do Tuần 3:

```text
Service Worker + Cache
→ App Shell vẫn mở
```

Do Tuần 4:

```text
IndexedDB
→ submission vẫn tồn tại
```

Ghi nhớ:

```text
Cache API
→ application resources

IndexedDB
→ application data
```

---

# 30. Hiển thị local submissions

Trong `app.js`:

```javascript
const listEl =
  document.querySelector(
    "#submission-list"
  );

async function
renderSubmissionList() {
  const submissions =
    await getAllSubmissions();

  submissions.sort(
    (a, b) =>
      new Date(b.createdAt)
      - new Date(a.createdAt)
  );

  listEl.innerHTML = "";

  if (
    submissions.length === 0
  ) {
    listEl.textContent =
      "Chưa có submission.";

    return;
  }

  for (
    const submission
    of submissions
  ) {
    const item =
      document.createElement(
        "div"
      );

    item.className =
      "submission";

    item.innerHTML = `
      <strong>
        ${
          submission.answers
            .facility_name
          ?? "(Không tên)"
        }
      </strong>

      <p>
        ID:
        <code>
          ${submission.id}
        </code>
      </p>

      <span class="badge">
        ${submission.syncStatus}
      </span>
    `;

    listEl.appendChild(item);
  }
}
```

Cuối file:

```javascript
renderSubmissionList();
```

---

# 31. Bước 4 — Sync Engine

Luồng:

```text
get pending
   ↓
POST từng record
   ↓
success?
├── yes → synced
└── no  → pending + attempts + error
```

Trong `app.js`:

```javascript
let syncInProgress = false;

async function
syncPendingSubmissions() {
  if (syncInProgress) {
    return;
  }

  if (!navigator.onLine) {
    return;
  }

  syncInProgress = true;

  try {
    const pending =
      await getPendingSubmissions();

    console.log(
      `Sync ${pending.length}
       pending submission(s)`
    );

    for (
      const submission
      of pending
    ) {
      await syncOneSubmission(
        submission
      );
    }
  } finally {
    syncInProgress = false;

    await renderSubmissionList();
  }
}
```

---

# 32. Sync một submission

```javascript
async function
syncOneSubmission(submission) {
  try {
    const response =
      await fetch(
        "/api/submissions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            id: submission.id,

            formId:
              submission.formId,

            answers:
              submission.answers,

            createdAt:
              submission.createdAt
          })
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    await updateSubmission(
      submission.id,
      {
        syncStatus: "synced",

        syncedAt:
          new Date()
            .toISOString(),

        lastError: null
      }
    );

    console.log(
      "Synced:",
      submission.id
    );
  } catch (error) {
    await updateSubmission(
      submission.id,
      {
        syncStatus: "pending",

        syncAttempts:
          submission.syncAttempts
          + 1,

        lastError:
          String(
            error.message
            ?? error
          )
      }
    );

    console.error(
      "Sync failed:",
      submission.id,
      error
    );
  }
}
```

---

# 33. Vì sao không gửi `syncStatus` lên server?

Server cần business data:

```text
id
formId
answers
createdAt
```

Các field:

```text
syncStatus
syncAttempts
lastError
syncedAt
```

là local sync metadata.

Ghi nhớ:

> Không mặc định gửi toàn bộ local state lên backend.

---

# 34. Auto-sync khi Online trở lại

```javascript
window.addEventListener(
  "online",
  async () => {
    updateNetworkStatus();

    console.log(
      "Online again → try sync"
    );

    await syncPendingSubmissions();
  }
);
```

Trong `syncPendingSubmissions()` có guard:

```javascript
if (!navigator.onLine) {
  console.log("Skip sync: browser is offline");
  return;
}
```

Vì vậy:

```text
Network = Offline
→ bấm "Sync pending"
→ không POST API
→ record vẫn pending
```

Đây là hành vi **đúng**.

Cũng cần nhắc lại:

> `navigator.onLine === true` không đảm bảo API server đang sống. Browser có thể Online nhưng Express server vẫn down.

Offline event:

```javascript
window.addEventListener(
  "offline",
  updateNetworkStatus
);
```

Nút sync thủ công:

```javascript
document
  .querySelector("#sync-button")
  .addEventListener(
    "click",
    syncPendingSubmissions
  );
```

---

# 35. Checkpoint chính — Offline → Pending → Online → Synced

## Bước A — chạy API

Terminal 1:

```bash
npm run api
```

Kết quả:

```text
Mock API running at http://localhost:3001
```

## Bước B — chạy frontend

Trong lúc code/debug:

```bash
npm run dev
```

Để kiểm thử PWA Offline cuối cùng:

```bash
npm run build
npm run preview
```

## Bước C — chuyển Offline

```text
Network
→ Offline
```

Submit ít nhất 2 survey.

Kiểm tra UI:

```text
pending
UUID
Sync attempts
Last error (nếu đã từng thử sync)
```

Kiểm tra IndexedDB:

```text
Application
→ IndexedDB
→ vku-field-survey-db
→ submissions
```

Các record phải có:

```text
syncStatus = pending
```

## Bước D — reload khi Offline

Cả hai thứ phải còn:

```text
App Shell
→ Service Worker + Cache API

Submission
→ IndexedDB
```

Form vẫn phải nhập và lưu được.

## Bước E — trở lại Online

```text
Network
→ No throttling
```

Event `online` gọi sync.

Terminal API phải xuất hiện:

```text
[API] received <UUID> ...
```

Network phải thấy:

```text
POST /api/submissions
→ 201 Created
```

## Bước F — xem local state lại

UI:

```text
pending
→ synced
```

IndexedDB:

```text
syncStatus: "synced"
syncedAt: "..."
lastError: null
```

Nếu `syncAttempts` khá cao thì không có nghĩa sync sai. Nó cho thấy app đã retry trong thời gian API/network chưa khả dụng.

Khi cần làm lại từ đầu, có thể reset sạch:

```text
Application
→ IndexedDB
→ vku-field-survey-db
→ Delete database
```

để số lần retry bắt đầu lại từ 0.

Đây là checkpoint trung tâm.

---

# 36. Kiểm tra dữ liệu ở server

Mở:

```text
http://localhost:5173/api/submissions
```

Vite proxy sẽ trả dữ liệu từ mock API.

So sánh:

```text
IndexedDB local
vs.
API server
```

---

# 37. Challenge demo — Browser Online nhưng API Server Down

Giữ browser Online nhưng dừng:

```bash
npm run api
```

Sau đó submit survey.

Có thể vẫn thấy:

```javascript
navigator.onLine === true
```

nhưng:

```text
POST /api/submissions
→ fail
```

Submission phải:

```text
vẫn ở IndexedDB
syncStatus = pending
syncAttempts tăng
lastError có dữ liệu
```

Ghi nhớ:

> **Online không có nghĩa server đang khả dụng.**

Đây là lý do app offline-first cần queue và retry.

---

# 38. Exponential Backoff

Ý tưởng:

```javascript
delay =
  baseDelay * 2 ** attempt
```

Ví dụ:

```text
attempt 0 → 1 giây
attempt 1 → 2 giây
attempt 2 → 4 giây
attempt 3 → 8 giây
```

Helper:

```javascript
function getRetryDelay(attempt) {
  const baseDelay = 1000;
  const maxDelay = 30000;

  return Math.min(
    baseDelay * 2 ** attempt,
    maxDelay
  );
}
```

Không cần chờ nhiều vòng retry để kiểm tra cơ chế.

Mục tiêu:

```text
không retry liên tục ngay lập tức
→ tránh spam server/network
```

---

# 39. Validation theo visible field

Ta không nên submit nếu field đang hiện + required nhưng chưa có dữ liệu.

```javascript
function validateAnswers() {
  const errors = [];

  for (
    const field
    of facilitySurveySchema.fields
  ) {
    if (!shouldShowField(field)) {
      continue;
    }

    if (
      field.required
      && !answers[field.id]
    ) {
      errors.push(
        `${field.label}
         là bắt buộc`
      );
    }
  }

  return errors;
}
```

Trong submit:

```javascript
const errors =
  validateAnswers();

if (errors.length > 0) {
  alert(errors.join("\n"));
  return;
}
```

Ghi nhớ:

> Validation phải dựa trên **field đang visible**, không bắt người dùng nhập một câu hỏi đang bị skip logic ẩn.

---

# 40. Service Worker Week 4 — bản đã chạy thử ổn định

Week 4 có thêm:

```text
app.js
db.js
survey-schema.js
```

và cần giữ được toàn bộ Dynamic Form khi Offline.

## 40.1. APP_SHELL

```javascript
const CACHE_NAME =
  "vku-field-survey-v6";

const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/db.js",
  "/survey-schema.js",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];
```

## 40.2. Vì sao chỉ precache vẫn có thể chưa đủ?

Trong quá trình chạy thử, có hai tình huống gây cache miss:

### Trường hợp A — Vite production bundle có tên hash

Production build có thể sinh file như:

```text
/assets/index-P2Xu9kJm.js
```

Tên file này thay đổi theo build nên ta không thể hardcode vào `APP_SHELL`.

### Trường hợp B — Response có `Vary: Origin`

DevTools có thể hiển thị:

```text
Vary Header = Origin
```

Khi module request có header `Origin`, `caches.match(request)` có thể không match variant đã precache như ta kỳ vọng.

Trong demo này các static asset đều same-origin, nên ta dùng:

```javascript
caches.match(request, {
  ignoreVary: true
});
```

để việc match ổn định hơn.

## 40.3. `sw.js` hoàn chỉnh

```javascript
// Chức năng: đặt version cho App Shell cache.
const CACHE_NAME =
  "vku-field-survey-v6";

// Chức năng: precache các tài nguyên có URL ổn định.
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/db.js",
  "/survey-schema.js",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Chức năng: precache App Shell khi install.
self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(
            APP_SHELL
          );
        })
    );

    self.skipWaiting();
  }
);

// Chức năng: xóa cache version cũ.
self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => {
          return Promise.all(
            keys
              .filter(
                (key) =>
                  key !== CACHE_NAME
              )
              .map(
                (key) =>
                  caches.delete(key)
              )
          );
        })
    );

    self.clients.claim();
  }
);

// Chức năng: Cache First + Runtime Cache cho static resources.
self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    const url =
      new URL(request.url);

    // Quan trọng:
    // API data không dùng Cache First.
    if (
      url.pathname
        .startsWith("/api/")
    ) {
      return;
    }

    if (
      request.method !== "GET"
    ) {
      return;
    }

    event.respondWith(
      (async () => {
        // Quan trọng:
        // ignoreVary giúp match static asset
        // ổn định hơn khi response có Vary: Origin.
        const cachedResponse =
          await caches.match(
            request,
            {
              ignoreVary: true
            }
          );

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          // Cache miss → thử network.
          const networkResponse =
            await fetch(request);

          // Runtime-cache static asset cùng origin.
          // Nhờ vậy bundle hash của Vite cũng được lưu.
          if (
            networkResponse.ok
            && url.origin
              === self.location.origin
          ) {
            const cache =
              await caches.open(
                CACHE_NAME
              );

            await cache.put(
              request,
              networkResponse.clone()
            );
          }

          return networkResponse;
        } catch (error) {
          // Navigation fail khi Offline
          // → trả offline fallback.
          if (
            request.mode
              === "navigate"
          ) {
            return caches.match(
              "/offline.html",
              {
                ignoreVary: true
              }
            );
          }

          throw error;
        }
      })()
    );
  }
);
```

## 40.4. Vì sao runtime caching cần thiết?

Luồng:

```text
Lần đầu Online
→ request static asset
→ cache miss
→ network thành công
→ clone response
→ cache.put()
```

Lần sau:

```text
Offline
→ cùng request
→ Cache Storage
→ app vẫn chạy
```

Với bundle production:

```text
/assets/index-XXXX.js
```

đây là cách để cache file có tên hash mà ta không biết trước.

## 40.5. Quy trình test Production đúng

Chạy:

```bash
npm run build
npm run preview
```

Mở:

```text
http://localhost:4173
```

Sau đó:

```text
1. Online
2. Mở app
3. Application → Service Workers
   → kiểm tra activated
4. F5 thêm một lần khi vẫn Online
5. Cache Storage
   → vku-field-survey-v6
6. Kiểm tra static assets/runtime assets đã có
7. Network → Offline
8. F5
```

### PASS khi

```text
Form vẫn render             ✅
Skip logic vẫn chạy         ✅
Có thể nhập dữ liệu         ✅
Có thể lưu IndexedDB        ✅
Submission thành pending    ✅
Sync server                 ❌ tạm thời
```

Khi Online lại:

```text
pending
→ POST API
→ synced
```

## 40.6. Một lưu ý về port/origin

```text
localhost:5173
≠
localhost:4173
```

Do đó:

```text
Service Worker 5173
≠
Service Worker 4173

IndexedDB 5173
≠
IndexedDB 4173

Cache Storage 5173
≠
Cache Storage 4173
```

Khi chuyển sang Preview, phải load app **Online trước** để origin `4173` tự tạo Service Worker, Cache Storage và IndexedDB của riêng nó.

---

# 41. Kiến trúc tổng hợp Week 3 + Week 4

```text
┌──────────────────────────┐
│ Dynamic Form             │
│ Schema + Skip Logic      │
└────────────┬─────────────┘
             │ Submit
             ▼
┌──────────────────────────┐
│ IndexedDB                │
│ pending / synced         │
└────────────┬─────────────┘
             │
             │ Sync Engine
             ▼
┌──────────────────────────┐
│ POST /api/submissions    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Mock Server              │
│ append-only records      │
└──────────────────────────┘
```

Song song:

```text
Service Worker + Cache API
→ giữ App Shell khi Offline
```

---

# 42. Các lỗi thường gặp

## Lỗi 1 — IndexedDB không có object store

Có thể DB đã được tạo ở version cũ.

Cách xử lý demo:

```text
Application
→ IndexedDB
→ Delete database
```

hoặc tăng:

```javascript
DB_VERSION
```

## Lỗi 2 — Skip logic không render lại

Kiểm tra:

```text
answers đã update?
renderForm() đã gọi?
```

## Lỗi 3 — Field ẩn nhưng dữ liệu cũ vẫn submit

Cần:

```javascript
removeHiddenAnswers()
```

## Lỗi 4 — Pending không chuyển Synced

Kiểm tra:

```text
API server có chạy?
Vite proxy đúng?
POST có 2xx?
Network có Offline?
Console có fetch error?
```

## Lỗi 5 — Reload xong list trống

Có thể quên:

```javascript
renderSubmissionList()
```

lúc app khởi động.

## Lỗi 6 — Duplicate khi retry

Server phải dedupe theo UUID.

## Lỗi 7 — Online nhưng sync fail

Hoàn toàn có thể xảy ra:

```text
navigator.onLine = true
nhưng API down
```

Queue phải giữ `pending`.

## Lỗi 8 — Offline + F5 chỉ còn HTML/CSS, Dynamic Form biến mất

Dấu hiệu:

```text
HTML/CSS vẫn hiện
nhưng form động trống
```

Nguyên nhân:

```text
JavaScript entry/module không load được
```

Kiểm tra Network xem có request đỏ:

```text
/app.js
/db.js
/survey-schema.js
/assets/index-XXXX.js
```

Kiểm tra Cache Storage và Service Worker.

## Lỗi 9 — Cache có `/app.js` nhưng request vẫn miss

Kiểm tra cột:

```text
Vary Header
```

Nếu thấy:

```text
Origin
```

thì trong demo này dùng:

```javascript
caches.match(request, {
  ignoreVary: true
});
```

## Lỗi 10 — Vite Preview có `/assets/index-XXXX.js` nhưng Offline không chạy

Production build có bundle tên hash.

Cần Service Worker **runtime-cache** static asset sau lần load Online.

Quy trình:

```text
Online
→ mở Preview
→ worker activated
→ F5 thêm một lần Online
→ runtime cache bundle
→ Offline
→ F5
```

## Lỗi 11 — DevTools IndexedDB trông như không có dữ liệu

Có thể đang click vào:

```text
syncStatus
```

đó là Index.

Hãy click:

```text
submissions
```

và bấm Refresh nếu thấy:

```text
Data may be stale
```

---

# 43. DevTools checklist

### Cache / Service Worker

```text
Application
→ Service Workers

Application
→ Cache storage
```

### IndexedDB

```text
Application
→ IndexedDB
→ vku-field-survey-db
→ submissions
```

Chọn **Object Store `submissions`** để xem record.  
`syncStatus` bên dưới là Index.

### Network

```text
Network
→ Offline / No throttling
```

### Console

Quan sát:

```text
Saved locally
Sync pending
Synced
Sync failed
```

### API Terminal

Quan sát:

```text
[API] received ...
```

---

# 44. Checklist demo cuối

- [ ] Form render từ schema
- [ ] Skip logic hoạt động
- [ ] Hidden answer được xử lý
- [ ] Submit tạo UUID
- [ ] Offline submit vẫn lưu IndexedDB
- [ ] `syncStatus = pending`
- [ ] Reload Offline dữ liệu vẫn còn
- [ ] Online lại tự sync
- [ ] API nhận POST
- [ ] Local record chuyển `synced`
- [ ] Retry cùng UUID không tạo duplicate
- [ ] App Shell vẫn hoạt động từ cache
- [ ] Production Preview Offline + F5 vẫn render Dynamic Form
- [ ] POST `/api/submissions` trả `201 Created` khi Online

Nếu đủ:

```text
Week 4 Demo: PASS
```

---

---

# Tổng kết

Sau khi hoàn thành demo, cần kiểm tra được toàn bộ chuỗi:

```text
Schema
→ Dynamic Form
→ Skip Logic
→ IndexedDB
→ pending
→ Online
→ POST API
→ synced
```

Đồng thời cần phân biệt:

```text
Cache API
→ lưu application resources

IndexedDB
→ lưu application data
```

Và nhớ rằng:

```text
Online
≠
API chắc chắn hoạt động
```

Vì vậy ứng dụng offline-first phải ưu tiên **lưu local trước**, sau đó mới đồng bộ khi điều kiện mạng/server cho phép.
