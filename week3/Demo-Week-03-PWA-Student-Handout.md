# DEMO TUẦN 3 — PWA FOUNDATION
## Tài liệu thực hành dành cho sinh viên

> Mục tiêu của demo: đi từ một Web App bình thường → thêm Manifest → Service Worker → Cache API → kiểm thử offline.
>
> **Checkpoint cuối:** chạy bản production preview, bật `Offline` trong Chrome DevTools, reload trang và ứng dụng vẫn hiển thị được giao diện chính **kèm hình ảnh đã cache**.

> **Cách sử dụng tài liệu:** thực hiện lần lượt từng bước, không copy toàn bộ code một lần. Sau mỗi bước, mở Chrome DevTools để kiểm tra Manifest, Service Worker, Cache Storage và trạng thái Offline.

---

# 1. Mục tiêu demo

Sau phần demo, cần hiểu được 6 ý chính:

1. Web App Manifest cung cấp metadata để browser nhận diện ứng dụng.
2. Service Worker được đăng ký và chạy tách biệt với UI.
3. Service Worker có thể lưu App Shell vào Cache Storage.
4. Khi mất mạng, request có thể được phục vụ từ cache thay vì server.
5. Static asset như hình ảnh vẫn có thể hiển thị khi offline nếu đã được cache.
6. `navigator.onLine` chỉ là tín hiệu tham khảo, không phải phép kiểm tra Internet tuyệt đối.

Mạch demo:

```text
Web App bình thường
        ↓
Web App Manifest
        ↓
Service Worker
        ↓
install → precache App Shell
        ↓
fetch → Cache First
        ↓
Production preview
        ↓
Offline → Reload → App + hình ảnh vẫn mở
```

---

# 2. Bước 0 — Tạo Web App bình thường

## 2.1. Tạo project

```bash
npm create vite@latest week3-pwa-demo -- --template vanilla
cd week3-pwa-demo
npm install
npm run dev
```

Mở URL Vite cung cấp, thường là:

```text
http://localhost:5173
```

## 2.2. Tạo giao diện demo đơn giản

### `index.html`

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VKU Campus Quick Guide</title>
    <link rel="stylesheet" href="/style.css" />
  </head>

  <body>
    <main class="app">
      <header class="hero">
        <img
          src="/icons/icon-192.png"
          alt="VKU Campus Quick Guide"
          class="app-logo"
        />

        <div>
          <p class="eyebrow">WEEK 3 — PWA DEMO</p>
          <h1>VKU Campus Quick Guide</h1>
          <p>Một Web App nhỏ để quan sát Manifest, Service Worker và Cache API.</p>
        </div>
      </header>

      <section class="cards">
        <article class="card">
          <h2>Phòng học</h2>
          <p>Tra cứu nhanh thông tin khu giảng đường.</p>
        </article>
        <article class="card">
          <h2>Thư viện</h2>
          <p>Thông tin cơ bản về khu vực học tập và thư viện.</p>
        </article>
        <article class="card">
          <h2>Hỗ trợ</h2>
          <p>Thông tin liên hệ khi cần hỗ trợ.</p>
        </article>
      </section>

      <p id="network-status" class="status"></p>
    </main>

    <script src="/app.js"></script>
  </body>
</html>
```

### `public/style.css`

```css
:root {
  font-family: Arial, sans-serif;
  color: #1f2937;
  background: #f8fafc;
}

* { box-sizing: border-box; }
body { margin: 0; }

.app {
  width: min(900px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0;
}

.hero {
  display: flex;
  align-items: center;
  gap: 20px;
}

.app-logo {
  width: 96px;
  height: 96px;
  border-radius: 20px;
  flex-shrink: 0;
}

.eyebrow {
  font-weight: 700;
  color: #0f766e;
}

h1 {
  margin: 0 0 8px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 32px;
}

.card {
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 1px solid #e2e8f0;
}

.status {
  margin-top: 32px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #e2e8f0;
  font-weight: 700;
}
```

### `public/app.js`

```javascript
const statusEl = document.querySelector("#network-status");

function updateNetworkStatus() {
  statusEl.textContent = navigator.onLine
    ? "Trạng thái: ONLINE"
    : "Trạng thái: OFFLINE";
}

window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

updateNetworkStatus();
```

### Lưu ý về `navigator.onLine`

Giữ phần hiển thị:

```text
Trạng thái: ONLINE
Trạng thái: OFFLINE
```

để quan sát event `online` / `offline`. Cần lưu ý:

> `navigator.onLine` chỉ phản ánh tín hiệu kết nối do browser/OS cung cấp. Nó **không đảm bảo** Internet hoặc server cụ thể đang truy cập được.

Trong một số tình huống khi DevTools đang mô phỏng `Offline`, sau reload giá trị này vẫn có thể không phản ánh đúng trạng thái mà ta kỳ vọng.

Vì vậy:

```text
Dòng trạng thái ONLINE/OFFLINE
≠
tiêu chí duy nhất để kết luận PWA offline thành công
```

Checkpoint thật sự là:

```text
Network → Offline
→ Reload
→ App Shell + hình ảnh đã cache vẫn render
```

---

# 3. Quan sát trước khi có PWA

Đây là bước nên làm trước khi thêm bất kỳ thành phần PWA nào.

1. Mở `DevTools → Network`.
2. Chọn throttling `Offline`.
3. Reload trang.

### Cần quan sát

Web App phụ thuộc network nên không thể tải bình thường.

### Ghi nhớ

> Mục tiêu đầu tiên của PWA không phải làm mọi chức năng offline. Mục tiêu đầu tiên là giúp **App Shell** có thể mở được khi mất mạng.

Sau đó chuyển Network về `No throttling`.

---

# 4. Bước 1 — Thêm Web App Manifest

## 4.1. Tạo `public/manifest.json`

```json
{
  "name": "VKU Campus Quick Guide",
  "short_name": "VKU Guide",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0f766e",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Đặt icon tại:

```text
public/icons/icon-192.png
public/icons/icon-512.png
```

## 4.2. Link Manifest vào HTML

Trong `<head>` của `index.html`, thêm:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0f766e" />
```

## 4.3. Kiểm tra

Mở:

```text
DevTools
→ Application
→ Manifest
```

Cần thấy:

- Name;
- Short name;
- Start URL;
- Display = `standalone`;
- theme color;
- icons.

### Tự kiểm tra

> Có Manifest thì app đã chạy offline chưa?

**Chưa.** Manifest chỉ mô tả ứng dụng cho browser.

---

# 5. Bước 2 — Đăng ký Service Worker

## 5.1. Tạo `public/sw.js`

Ban đầu chỉ cần:

```javascript
console.log("Service Worker loaded");
```

## 5.2. Đăng ký Service Worker

Cuối `public/app.js`, thêm:

```javascript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration.scope);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  });
}
```

## 5.3. Kiểm tra trong DevTools

Reload trang rồi mở:

```text
Application
→ Service Workers
```

Cần thấy trạng thái tương đương:

```text
activated and running
```

Nếu chưa thấy:

```text
Application → Service Workers → Unregister → Reload
```

hoặc:

```text
Application → Storage → Clear site data
```

## 5.4. Phân biệt `app.js` và `sw.js`

Đây là chỗ sinh viên rất dễ nhầm vì cả hai đều là JavaScript.

```text
app.js
→ chạy trong Window context
→ có window, document, navigator
→ thao tác UI
→ đăng ký Service Worker
```

```text
sw.js
→ chạy trong Service Worker context
→ không có DOM/document
→ xử lý install / activate / fetch / cache
```

Ví dụ, đoạn sau thuộc `app.js`:

```javascript
navigator.serviceWorker.register("/sw.js");
```

Còn đoạn sau thuộc `sw.js`:

```javascript
self.addEventListener("install", ...);
```

> Không ghép code của `app.js` và `sw.js` vào cùng một file. Nếu đưa `document.querySelector(...)` vào `sw.js`, Service Worker sẽ lỗi vì không có `document`.

---

# 6. Kiến trúc Service Worker

```text
              Internet / Server
                    ▲
                    │
                    ▼
UI / Browser ──► Service Worker
                    ▲
                    │
                    ▼
                Cache API
```

Điểm cần nhấn mạnh:

- Service Worker không phải UI;
- không thao tác DOM trực tiếp;
- có lifecycle riêng;
- có thể intercept request;
- ba event cần nhớ: `install`, `activate`, `fetch`.

---

# 7. Bước 3 — Cache App Shell trong `install`

## 7.1. App Shell của demo

```text
/
index.html
style.css
app.js
manifest.json
icons
```

Trong giao diện demo, `icon-192.png` đang được hiển thị trực tiếp bằng:

```html
<img src="/icons/icon-192.png" ...>
```

Mục đích là để khi chuyển Offline, sinh viên nhìn thấy trực quan rằng **ảnh cũng được phục vụ từ Cache Storage**, không chỉ HTML/CSS/JS.

## 7.2. Sửa `public/sw.js`

```javascript
const CACHE_NAME = "vku-guide-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  console.log("[SW] install");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] caching app shell");
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log("[SW] app shell cached successfully");
      })
      .catch((error) => {
        console.error("[SW] cache failed:", error);
      })
  );

  self.skipWaiting();
});
```

## 7.3. Giải thích các API

### `caches.open(CACHE_NAME)`

Mở cache hiện có hoặc tạo cache mới.

### `cache.addAll(APP_SHELL)`

Request các tài nguyên trong danh sách và lưu response vào cache.

> Nếu một đường dẫn trong `APP_SHELL` sai, precache có thể thất bại.

### `event.waitUntil(...)`

Giữ event `install` sống cho đến khi thao tác cache hoàn thành.

---

# 8. Quan sát Cache Storage

Sau khi lưu `sw.js`:

1. `Application → Service Workers`;
2. bấm `Update` nếu cần;
3. reload trang;
4. mở `Application → Cache Storage`.

Cần thấy:

```text
vku-guide-v1
```

và các request đã được lưu bên trong.

## 6.1. Phân biệt hai mục `Storage` trong DevTools

Chrome DevTools có hai chỗ tên gần giống nhau:

```text
Application → Storage
```

Đây là trang **tổng hợp/quản lý storage** của origin. Thường dùng khi cần:

```text
Clear site data
```

Còn:

```text
Storage section → Cache storage
```

là nơi xem **dữ liệu Cache API thực tế**, ví dụ:

```text
vku-guide-v1
  ├── /
  ├── index.html
  ├── app.js
  ├── style.css
  ├── manifest.json
  ├── icons/icon-192.png
  └── icons/icon-512.png
```

Trong demo:

- muốn reset toàn bộ site → `Application → Storage`;
- muốn kiểm tra App Shell đã cache chưa → `Storage section → Cache storage`.

### Ghi nhớ

> Tài nguyên đã nằm trong cache, nhưng browser vẫn chưa được yêu cầu dùng cache để trả request. Ta cần event `fetch`.

---

# 9. Bước 4 — `fetch` với Cache First

Thêm vào `public/sw.js`:

```javascript
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("[SW] cache hit:", event.request.url);
        return cachedResponse;
      }

      console.log("[SW] network:", event.request.url);
      return fetch(event.request);
    })
  );
});
```

Luồng Cache First:

```text
Request
   ↓
Tìm trong Cache
   ↓
Có?
├── YES → trả cached response
└── NO  → fetch từ network
```

Phù hợp cho App Shell và static assets như CSS, JS, icon, font.

## 7.1. Lưu ý khi đang chạy `npm run dev`

Vite development mode tự chèn HMR client:

```text
/@vite/client
```

Nếu chuyển DevTools sang `Offline`, request này có thể báo đỏ vì:

```text
/@vite/client
→ không nằm trong APP_SHELL
→ Service Worker thử fetch network
→ network đang Offline
→ request fail
```

Đây **không phải lỗi cốt lõi của Service Worker**.

Vì vậy có thể dùng dev server để quan sát quá trình, nhưng checkpoint offline chính thức nên kiểm tra lại bằng:

```bash
npm run build
npm run preview
```

---

# 10. Quan sát Offline trong dev mode

## 10.1. Online trước

Đảm bảo:

```text
Network → No throttling
```

Reload một lần để Service Worker và cache hoàn tất.

## 10.2. Chuyển Offline

```text
DevTools
→ Network
→ Offline
```

Sau đó reload.

### Kết quả mong đợi

Ứng dụng vẫn hiển thị giao diện chính và `icon-192.png` vẫn xuất hiện nếu các tài nguyên đã được cache đúng.

Dòng trạng thái **có thể** hiển thị:

```text
Trạng thái: OFFLINE
```

nhưng không dùng `navigator.onLine` làm tiêu chí duy nhất để chấm checkpoint.

### Tự kiểm tra

> Server có đang trả HTML/CSS/JS cho browser không?

Không.

> Vậy tài nguyên đến từ đâu?

```text
Cache Storage
```

---

# 11. Quan sát request trong Network

Giữ `Offline` và reload lại.

Giải thích luồng:

```text
Page request
   ↓
Service Worker intercept
   ↓
caches.match()
   ↓
cached response
   ↓
UI render
```

Đây là quan sát quan trọng để hiểu luồng Service Worker. Tuy nhiên checkpoint cuối sẽ được xác nhận lại bằng **production preview** để loại nhiễu từ Vite HMR.

---

# 12. Bước 5 — `activate` và Cache Versioning

Đổi:

```javascript
const CACHE_NAME = "vku-guide-v1";
```

thành:

```javascript
const CACHE_NAME = "vku-guide-v2";
```

Thêm event `activate`:

```javascript
self.addEventListener("activate", (event) => {
  console.log("[SW] activate");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] delete old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );

  self.clients.claim();
});
```

Mở:

```text
Application → Cache Storage
```

Cần thấy cache cũ được xóa sau khi Service Worker mới activate.

---

# 13. File `sw.js` hoàn chỉnh

```javascript
const CACHE_NAME = "vku-guide-v2";

const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
```

---

# 14. Checkpoint chính — Test bằng bản build

Trong lúc chạy `npm run dev`, Vite còn có cơ chế development/HMR. Để checkpoint offline ổn định và gần production hơn, test lại bằng bản build:

```bash
npm run build
npm run preview
```

Mở URL Vite Preview cung cấp, thường là:

```text
http://localhost:4173
```

> `localhost:5173` và `localhost:4173` là **hai origin khác nhau**. Service Worker và Cache Storage của origin dev không tự chuyển sang origin preview.

## 14.1. Quy trình test đúng

Ở origin preview:

```text
1. Network → No throttling
2. Mở app một lần khi Online
3. Application → Service Workers
4. Kiểm tra worker activated and running
5. Storage section → Cache storage
6. Kiểm tra cache vku-guide-v2
7. Network → Offline
8. Reload
```

## 14.2. PASS khi

- HTML vẫn hiển thị;
- CSS vẫn áp dụng;
- JavaScript của app vẫn chạy;
- `icon-192.png` vẫn xuất hiện;
- các static resource đã cache vẫn được phục vụ;
- không phụ thuộc `/@vite/client`.

## 14.3. Luồng của hình ảnh khi Offline

```text
<img src="/icons/icon-192.png">
          ↓
Browser tạo request
          ↓
Service Worker intercept
          ↓
caches.match()
          ↓
Cache Storage
          ↓
cached response
          ↓
ảnh vẫn hiển thị
```

### Ghi nhớ

> Offline support không chỉ áp dụng cho HTML. CSS, JavaScript, font, icon và hình ảnh đều có thể tiếp tục hoạt động nếu request tương ứng đã được cache.

> Đây là lựa chọn triển khai để demo ổn định hơn; PWA không phụ thuộc Vite.

---

# 15. DevTools checklist

Sinh viên phải trực tiếp thấy đủ 4 nơi:

### Manifest

```text
Application → Manifest
```

### Service Worker

```text
Application → Service Workers
```

### Cache

```text
Application
→ Storage section
→ Cache storage
```

Đây là nơi kiểm tra từng cache cụ thể.

### Offline

```text
Network → Offline
```

---

# 16. Checklist demo cuối cùng

- [ ] App chạy bình thường khi Online
- [ ] Browser nhận `manifest.json`
- [ ] Service Worker `activated`
- [ ] Cache Storage có `vku-guide-v2`
- [ ] App Shell nằm trong cache
- [ ] Chạy `npm run build` + `npm run preview`
- [ ] Load app Preview một lần khi Online
- [ ] Bật `Offline`
- [ ] Reload
- [ ] Giao diện chính vẫn hiển thị
- [ ] `icon-192.png` vẫn xuất hiện từ cache

Nếu đủ các mục:

```text
Checkpoint Week 3 Demo: PASS
```

---

# 17. Các lỗi rất hay gặp khi demo

## Lỗi 1 — Service Worker không cập nhật

```text
Application → Service Workers → Update
```

Nếu vẫn lỗi:

```text
Unregister → Reload
```

## Lỗi 2 — Cache cũ làm app không đổi

```text
Application → Storage → Clear site data
```

## Lỗi 3 — `cache.addAll()` thất bại

Nguyên nhân thường gặp: một path trong `APP_SHELL` không tồn tại.

## Lỗi 4 — `sw.js` đặt sai vị trí

Trong demo này đặt:

```text
public/sw.js
```

để được serve tại:

```text
/sw.js
```

## Lỗi 5 — Bật Offline ngay từ lần đầu

Nếu app chưa từng chạy Online thì browser chưa có cơ hội register Service Worker và precache.

Quy trình đúng:

```text
Online
→ Load app
→ Service Worker activated
→ Cache được tạo
→ Offline
→ Reload
```

---

# 18. Reset project về trạng thái sạch

Trước khi demo lại:

```text
Application
→ Service Workers
→ Unregister
```

sau đó:

```text
Application
→ Storage
→ Clear site data
```

rồi reload.


---
