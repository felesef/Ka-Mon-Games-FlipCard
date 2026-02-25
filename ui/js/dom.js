// 🟡 [important] every time you get one element you call
// document.getElementById which causes a DOM query. This is inefficient if done repeatedly.
// Instead, cache these elements in a single object with getters, so the DOM is only queried once per element.
// This also centralizes all DOM queries in one place, making it easier to manage and update the UI structure.
// → Fixed: with cache each element is queried once; repeated calls return the cached reference.
const _cache = {};

function get(id) {
  if (_cache[id] === undefined) _cache[id] = document.getElementById(id);
  return _cache[id];
}

export const dom = {
  get gameBoard() {
    return get("gameBoard");
  },
  get movesCounterElement() {
    return get("movesCounter");
  },
  get timeCounterElement() {
    return get("timeCounter");
  },
  get winModal() {
    return get("winModal");
  },
  get setupContainer() {
    return get("setupContainer");
  },
  get gameArea() {
    return get("gameArea");
  },
  get scoreboardModal() {
    return get("scoreboardModal");
  },
  get scoreboardList() {
    return get("scoreboardList");
  },
  getStoredUserName() {
    const input = get("userName");
    return input ? String(input.value || "").trim() : "";
  },
};
