import { onStartGame } from "./ui/setup.js";
import {
  closeModal,
  closeScoreboard,
  openScoreboard,
} from "./ui/modals.js";
import { newGame } from "./game/board.js";

function init() {
  const startBtn = document.getElementById("startGameBtn");
  if (startBtn) startBtn.addEventListener("click", onStartGame);

  const newGameBtn = document.getElementById("newGameBtn");
  if (newGameBtn) newGameBtn.addEventListener("click", () => newGame());

  const scoreboardBtn = document.getElementById("scoreboardBtn");
  if (scoreboardBtn) scoreboardBtn.addEventListener("click", () => openScoreboard());

  const closeWinModalBtn = document.getElementById("closeWinModalBtn");
  if (closeWinModalBtn) closeWinModalBtn.addEventListener("click", closeModal);

  const closeScoreboardBtn = document.getElementById("closeScoreboardBtn");
  if (closeScoreboardBtn) closeScoreboardBtn.addEventListener("click", closeScoreboard);

  // 🔴 [blocking] - finishGame() and nextLevel() are called via onclick in index.html but are
  // never imported or exposed here. Add them: window.finishGame = finishGame; window.nextLevel = nextLevel;
  // Or better yet, use addEventListener for those buttons too and remove all inline onclick handlers
  window.newGame = newGame;
  window.closeModal = closeModal;
  window.closeScoreboard = closeScoreboard;
  window.openScoreboard = openScoreboard;

  // 🟡 [important] - IDs "newGameBtn", "scoreboardBtn", "closeWinModalBtn", "closeScoreboardBtn"
  // do not exist in index.html, so lines 13-23 above never attach any listeners.
  // The onclick attributes in the HTML are doing all the work instead
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
