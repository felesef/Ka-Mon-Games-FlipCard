import { gameState } from "../state.js";
import { dom } from "../dom.js";
import { LEVELS } from "../config.js";
import { newGame } from "../game/board.js";

export function onStartGame() {
  const name = dom.getStoredUserName();
  if (!name) {
    alert("Please enter your name.");
    return;
  }
  const themeSelect = document.getElementById("theme");
  const levelSelect = document.getElementById("level");
  const theme = themeSelect ? themeSelect.value : "dogs";
  const levelKey = levelSelect ? levelSelect.value : "4x4";
  const level = LEVELS[levelKey] || LEVELS["4x4"];

  gameState.currentTheme = theme;
  gameState.currentPairCount = level.pairCount;
  gameState.currentCols = level.cols;
  gameState.currentRows = level.rows;

  if (dom.setupContainer) dom.setupContainer.hidden = true;
  if (dom.gameArea) dom.gameArea.hidden = false;

  newGame();
}
