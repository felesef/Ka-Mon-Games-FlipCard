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
  // 🔴 [blocking] - There are no elements with id="theme" or id="level" in index.html.
  // The theme is selected via radio buttons (name="choice"), not a <select id="theme">.
  // This means themeSelect is always null, and theme always defaults to "dogs" (which has no images).
  // Fix: read the selected radio value instead:
  //   const checkedRadio = document.querySelector('input[name="choice"]:checked');
  //   const theme = checkedRadio ? checkedRadio.value : "animals";
  const checkedRadio = document.querySelector('input[name="choice"]:checked');
  const theme = checkedRadio ? checkedRadio.value : "animals";
  const level = LEVELS[gameState.currentLevel] || LEVELS[1];

  gameState.currentTheme = theme;
  gameState.currentPairCount = level.pairCount;
  gameState.currentCols = level.cols;
  gameState.currentRows = level.rows;

  if (dom.setupContainer) dom.setupContainer.hidden = true;
  if (dom.gameArea) dom.gameArea.hidden = false;

  newGame();
}

export function initThemeSelection() {
  const titleList = document.querySelector(".title-list[data-group='choice']");
  if (!titleList) return;

  titleList.addEventListener("click", (e) => {
    const wrap = e.target.closest(".title-wrap");
    if (!wrap) return;
    const radio = wrap.querySelector("input[type='radio'][name='choice']");
    if (!radio) return;
    radio.checked = true;
    gameState.currentTheme = radio.value;
  });

  titleList.addEventListener("change", (e) => {
    if (e.target.matches("input[type='radio'][name='choice']")) {
      gameState.currentTheme = e.target.value;
    }
  });
}
