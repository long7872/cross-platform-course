# Mobile Stack Advisor — Checkpoint 4 & 5

## Kiến trúc 3 lớp (Checkpoint 4)

- **Data — `stacks.js`**: object `STACKS`, chỉ mô tả tên và công nghệ của từng chiến lược (Native, Capacitor, Cross-platform, PWA). Không có hàm, không có logic.
- **Business Logic — `decision.js`**: `calculateScores(requirements)` và `getRecommendation(requirements)`. Hai hàm này thuần túy nhận/trả dữ liệu, không đọc/ghi `document` hay `window`.
- **Presentation — `app.js`**: đọc 8 checkbox thành object `requirements` (state), gọi `getRecommendation()`, và render kết quả vào `#result`.
- **`index.html`**: chỉ còn HTML + CSS + 3 thẻ `<script src="...">` theo đúng thứ tự `stacks.js` → `decision.js` → `app.js`.

```text
Presentation  = app.js   (đọc checkbox, render #result)
Business Logic = decision.js (calculateScores, getRecommendation)
Data          = stacks.js (STACKS)
State         = object `requirements` được tạo trong readRequirements() (app.js)
```

## Tiêu chí mới (Checkpoint 5): "Ngân sách rất thấp" (`lowBudget`)

### Cách cho điểm

| Stack | Điểm | Lý do |
|---|---:|---|
| PWA | +3 | Không tốn chi phí build app native, không mất phí submit App Store/Play Store, hạ tầng chỉ cần web hosting thông thường → tiết kiệm chi phí nhất. |
| Capacitor | +1 | Tái dùng code web nên rẻ hơn native, nhưng vẫn phải build và trả phí developer account để submit store. |
| Cross-platform (React Native/Flutter) | -1 | Rẻ hơn Native vì dùng chung 1 codebase cho 2 nền tảng, nhưng vẫn cần chi phí build, test trên thiết bị thật và maintain app native. |
| Native | -3 | Phải phát triển và bảo trì 2 codebase (iOS + Android) song song với 2 đội ngũ/kỹ năng riêng → chi phí dev cao nhất trong 4 lựa chọn. |

Reason hiển thị trên UI khi tick `lowBudget`: *"Ngân sách thấp làm PWA trở thành lựa chọn tiết kiệm chi phí nhất."*

### Vì sao thiết kế như vậy

Chi phí ở đây được hiểu chủ yếu là **chi phí phát triển & vận hành ban đầu** (không tính chi phí server dài hạn), gồm: số codebase phải maintain, có cần trả phí developer account (Apple/Google) hay không, và có cần thiết bị/kỹ năng chuyên biệt để build hay không. PWA thấp chi phí nhất vì chỉ cần web stack quen thuộc và không phụ thuộc store; Native cao chi phí nhất vì nhân đôi effort cho 2 nền tảng.
