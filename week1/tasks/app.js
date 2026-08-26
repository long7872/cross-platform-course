// Presentation layer — doc checkbox, tao state, goi business logic, render ket qua.
// Dua vao STACKS (stacks.js) va getRecommendation (decision.js).

function readRequirements() {
  return {
    appStore: document.querySelector("#appStore").checked,
    highPerformance: document.querySelector("#highPerformance").checked,
    hardwareAccess: document.querySelector("#hardwareAccess").checked,
    existingWebApp: document.querySelector("#existingWebApp").checked,
    offline: document.querySelector("#offline").checked,
    webTeam: document.querySelector("#webTeam").checked,
    fastMvp: document.querySelector("#fastMvp").checked,
    lowBudget: document.querySelector("#lowBudget").checked
  };
}

function renderRecommendation(rec) {
  const winnerNames = rec.winners.map(key => STACKS[key].name);
  const title = rec.winners.length === 1
    ? `Đề xuất: ${winnerNames[0]}`
    : `Cần xem xét thêm: ${winnerNames.join(" và ")} đang đồng điểm.`;

  const scores = rec.ranking.map(([key, score]) => `${STACKS[key].name}: ${score}`).join("\n");
  const reasons = rec.reasons.length
    ? rec.reasons.slice(0, 4).map(r => `- ${r}`).join("\n")
    : "- Chưa chọn tiêu chí nào; cần thêm thông tin.";

  document.querySelector("#result").textContent = `${title}

Điểm:
${scores}

Lý do:
${reasons}`;
}

document.querySelector("#analyzeButton").addEventListener("click", function () {
  const requirements = readRequirements();
  renderRecommendation(getRecommendation(requirements));
});
