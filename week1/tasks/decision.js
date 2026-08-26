// Business logic layer — tinh diem va chon de xuat.
// KHONG duoc doc/ghi DOM (khong document, khong window) trong file nay.

function calculateScores(req) {
  // Cross-platform bat dau voi 1 diem nen vi day la ung vien hop ly cho
  // nhieu business app thong thuong khi chua co requirement dac biet.
  const scores = { native: 0, capacitor: 0, crossPlatform: 1, pwa: 0 };
  const reasons = [];

  if (req.highPerformance) {
    scores.native += 4;
    scores.crossPlatform += 2;
    reasons.push("Hieu nang cao lam Native co loi the.");
  }
  if (req.hardwareAccess) {
    scores.native += 3;
    scores.capacitor += 2;
    scores.crossPlatform += 2;
    scores.pwa -= 2;
    reasons.push("Nhu cau hardware/native API lam PWA kem thuan loi hon.");
  }
  if (req.existingWebApp) {
    scores.capacitor += 4;
    scores.pwa += 2;
    reasons.push("Da co Web App nen Capacitor co loi the tai su dung code.");
  }
  if (req.appStore) {
    scores.native += 2;
    scores.capacitor += 2;
    scores.crossPlatform += 2;
    scores.pwa -= 3;
    reasons.push("Yeu cau store lam PWA thuan kem thuan loi.");
  }
  if (req.offline) {
    scores.native += 1;
    scores.capacitor += 2;
    scores.crossPlatform += 2;
    scores.pwa += 3;
    reasons.push("Offline la requirement quan trong.");
  }
  if (req.webTeam) {
    scores.capacitor += 3;
    scores.pwa += 3;
    scores.crossPlatform += 1;
    reasons.push("Team Web/JS lam PWA va Capacitor co loi the.");
  }
  if (req.fastMvp) {
    scores.pwa += 3;
    scores.capacitor += 2;
    scores.crossPlatform += 2;
    scores.native -= 1;
    reasons.push("MVP nhanh co loi cho giai phap dung mot codebase/web stack.");
  }
  // Checkpoint 5 — tieu chi moi: ngan sach rat thap.
  if (req.lowBudget) {
    scores.pwa += 3;
    scores.capacitor += 1;
    scores.crossPlatform -= 1;
    scores.native -= 3;
    reasons.push("Ngan sach thap lam PWA tro thanh lua chon tiet kiem chi phi nhat.");
  }

  return { scores, reasons };
}

function getRecommendation(req) {
  const { scores, reasons } = calculateScores(req);
  const ranking = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore = ranking[0][1];
  const winners = ranking.filter(([, score]) => score === topScore).map(([key]) => key);
  return { scores, reasons, ranking, winners };
}
