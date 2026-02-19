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

  window.newGame = newGame;
  window.closeModal = closeModal;
  window.closeScoreboard = closeScoreboard;
  window.openScoreboard = openScoreboard;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
