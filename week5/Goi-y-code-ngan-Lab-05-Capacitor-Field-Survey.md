# GỢI Ý CODE NGẮN — LAB 05
## Modify & Extend Capacitor Field Survey

> Tài liệu hỗ trợ cuối buổi.  
> Không cần copy nguyên file. Chỉ đối chiếu với `index.html` và `src/app.js` của Demo Complete Week 5, rồi bổ sung đúng phần còn thiếu.

---

# 0. Nhớ workflow sau khi sửa Web code

```bash
npm run build
npx cap sync android
```

Sau đó Run lại app trong Android Studio.

---

# 1. Yêu cầu 1 — Hiển thị Native Evidence rõ hơn

## 1.1. Thêm Accuracy vào `index.html`

Trong card Geolocation, thêm:

```html
<p id="location-accuracy" class="native-value" hidden></p>
```

Ví dụ:

```html
<div class="evidence-card">
  <h3>Geolocation</h3>

  <p id="location-status" class="hint">
    Chưa có vị trí.
  </p>

  <p
    id="location-coordinates"
    class="native-value"
    hidden
  ></p>

  <p
    id="location-accuracy"
    class="native-value"
    hidden
  ></p>
</div>
```

## 1.2. Lấy element trong `src/app.js`

```javascript
const locationAccuracyEl =
  document.querySelector("#location-accuracy");
```

## 1.3. Mở rộng `renderNativeEvidence()`

Phần location có thể sửa thành:

```javascript
if (currentLocation) {
  locationStatusEl.textContent =
    "Đã lấy vị trí hiện tại.";

  locationCoordinatesEl.textContent =
    `${currentLocation.latitude.toFixed(6)}, `
    + `${currentLocation.longitude.toFixed(6)}`;

  locationAccuracyEl.textContent =
    `Accuracy: ${Math.round(currentLocation.accuracy)} m`;

  locationCoordinatesEl.hidden = false;
  locationAccuracyEl.hidden = false;
} else {
  locationStatusEl.textContent =
    "Chưa có vị trí.";

  locationCoordinatesEl.textContent = "";
  locationAccuracyEl.textContent = "";

  locationCoordinatesEl.hidden = true;
  locationAccuracyEl.hidden = true;
}
```

### PASS

```text
Chụp ảnh
→ trạng thái ảnh đổi

Lấy GPS
→ latitude / longitude xuất hiện
→ accuracy xuất hiện
```

---

# 2. Yêu cầu 2 — Validation Form + Native Data

Thêm hàm:

```javascript
function validateNativeEvidence() {
  const errors = [];

  if (!currentLocation) {
    errors.push(
      "Vui lòng lấy vị trí trước khi lưu khảo sát."
    );
  }

  if (
    answers.condition === "damaged"
    && !currentPhoto
  ) {
    errors.push(
      "Khảo sát hư hỏng phải có ảnh hiện trường."
    );
  }

  return errors;
}
```

Trong `handleSubmit()` hiện có:

```javascript
const errors = validateAnswers();
```

đổi thành:

```javascript
const errors = [
  ...validateAnswers(),
  ...validateNativeEvidence()
];
```

Phần sau giữ nguyên:

```javascript
if (errors.length > 0) {
  alert(errors.join("\n"));
  return;
}
```

### Test

```text
Good + không location
→ FAIL

Damaged + location + không photo
→ FAIL

Damaged + location + photo
→ PASS
```

---

# 3. Yêu cầu 3 — Mở rộng Local Submissions

Trong `renderSubmissionList()`, trước `item.innerHTML`, có thể chuẩn bị:

```javascript
const condition =
  submission.answers.condition ?? "-";

const createdAt =
  new Date(submission.createdAt)
    .toLocaleString();

const hasPhoto =
  Boolean(submission.photo);

const location =
  submission.location;
```

Sau đó mở rộng HTML:

```javascript
item.innerHTML = `
  <div class="submission-top">
    <strong>
      ${escapeHTML(facilityName)}
    </strong>

    <span class="${badgeClass}">
      ${escapeHTML(submission.syncStatus)}
    </span>
  </div>

  <p>
    Tình trạng:
    ${escapeHTML(condition)}
  </p>

  <p>
    Created:
    ${escapeHTML(createdAt)}
  </p>

  <p>
    Photo:
    ${hasPhoto ? "Có" : "Không"}
  </p>

  ${
    location
      ? `
        <p>
          Location:
          ${location.latitude.toFixed(6)},
          ${location.longitude.toFixed(6)}
        </p>

        <p>
          Accuracy:
          ${Math.round(location.accuracy)} m
        </p>
      `
      : `<p>Location: Không có</p>`
  }

  <p>
    Status:
    ${escapeHTML(submission.syncStatus)}
  </p>
`;
```

Nếu có ảnh, thêm thumbnail:

```javascript
if (submission.photo?.previewDataUrl) {
  const img =
    document.createElement("img");

  img.src =
    submission.photo.previewDataUrl;

  img.alt =
    "Ảnh hiện trường";

  img.className =
    "submission-photo";

  item.appendChild(img);
}
```

Demo Complete đã có CSS:

```css
.submission-photo
```

nên không cần viết lại CSS thumbnail.

---

# 4. Yêu cầu 4 — Reset Native State sau Submit

Thêm:

```javascript
function resetNativeEvidence() {
  currentPhoto = null;
  currentLocation = null;

  renderNativeEvidence();
}
```

Trong `handleSubmit()`, sau:

```javascript
await saveSubmission(submission);
```

và sau `clearForm()`:

```javascript
clearForm();
resetNativeEvidence();

await renderSubmissionList();
```

### PASS

Sau khi lưu Survey A:

```text
Photo → Chưa có ảnh
Location → Chưa có vị trí
```

Survey B không được dùng lại Camera/GPS của Survey A.

---

# 5. Yêu cầu 5 — Extension

Chỉ cần chọn **một**.

## Gợi ý đơn giản: Extension A — Xóa ảnh

### 5.1. Thêm nút vào `index.html`

Đặt gần nút Camera:

```html
<button
  id="clear-photo-button"
  type="button"
  class="button-secondary"
>
  Xóa ảnh
</button>
```

### 5.2. Lấy element

```javascript
const clearPhotoButton =
  document.querySelector(
    "#clear-photo-button"
  );
```

### 5.3. Handler

```javascript
function clearCurrentPhoto() {
  currentPhoto = null;
  renderNativeEvidence();
}
```

### 5.4. Đăng ký event

Ở cuối `app.js`:

```javascript
clearPhotoButton.addEventListener(
  "click",
  clearCurrentPhoto
);
```

### PASS

```text
Take Photo
→ preview hiện

Xóa ảnh
→ currentPhoto = null
→ preview ẩn
→ trạng thái = Chưa có ảnh
```

---

# 6. Nếu chọn Extension B — Accuracy Indicator

Có thể dùng helper:

```javascript
function getAccuracyLabel(accuracy) {
  if (accuracy <= 20) {
    return "Tốt";
  }

  if (accuracy <= 50) {
    return "Trung bình";
  }

  return "Thấp";
}
```

Sau đó trong `renderNativeEvidence()`:

```javascript
locationAccuracyEl.textContent =
  `Accuracy: `
  + `${Math.round(currentLocation.accuracy)} m`
  + ` — ${getAccuracyLabel(currentLocation.accuracy)}`;
```

---

# 7. Checklist cuối

Sau khi hoàn thành:

```text
1. Native Evidence hiện Photo + GPS + Accuracy
2. Good bắt buộc Location
3. Damaged bắt buộc Location + Photo
4. Local Submission hiển thị native data
5. Thumbnail đọc từ submission.photo.previewDataUrl
6. Submit xong reset currentPhoto/currentLocation
7. Extension hoạt động
8. API down → vẫn lưu pending
9. Đóng/mở app → record còn
10. API up → pending → synced
```

Cuối cùng nhớ:

```bash
npm run build
npx cap sync android
```

rồi Run lại Android App.
