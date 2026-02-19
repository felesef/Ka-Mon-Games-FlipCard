export const dom = {
  get gameBoard() {
    return document.getElementById("gameBoard");
  },
  get movesCounterElement() {
    return document.getElementById("movesCounter");
  },
  get timeCounterElement() {
    return document.getElementById("timeCounter");
  },
  get winModal() {
    return document.getElementById("winModal");
  },
  get setupContainer() {
    return document.getElementById("setupContainer");
  },
  get gameArea() {
    return document.getElementById("gameArea");
  },
  get scoreboardModal() {
    return document.getElementById("scoreboardModal");
  },
  get scoreboardList() {
    return document.getElementById("scoreboardList");
  },
  getStoredUserName() {
    const input = document.getElementById("userName");
    return input ? String(input.value || "").trim() : "";
  },
};
