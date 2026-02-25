// 🟡 [important] every time you get one element you call 
// document.getElementById which causes a DOM query. This is inefficient if done repeatedly. 
// Instead, cache these elements in a single object with getters, so the DOM is only queried once per element.
// This also centralizes all DOM queries in one place, making it easier to manage and update the UI structure.
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
