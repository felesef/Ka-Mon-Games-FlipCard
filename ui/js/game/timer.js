import { gameState } from "../state.js";
import { dom } from "../dom.js";

export function startTimer() {
  gameState.isTimerOn = true;
  gameState.timerInterval = setInterval(() => {
    gameState.seconds++;
    gameState.totalSeconds++;
    if (gameState.seconds === 60) {
      gameState.seconds = 0;
      gameState.minutes++;
    }
    if (gameState.minutes === 60) {
      gameState.minutes = 0;
      gameState.hours++;
    }
    const el = dom.timeCounterElement;
    if (el) {
      if (gameState.hours === 0) {
        el.textContent = `${gameState.minutes}:${String(gameState.seconds).padStart(2, "0")}`;
      } else {
        el.textContent = `${gameState.hours}:${String(gameState.minutes).padStart(2, "0")}:${String(gameState.seconds).padStart(2, "0")}`;
      }
    }
  }, 1000);
}

export function stopTimer() {
  gameState.isTimerOn = false;
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

export function resetTimer() {
  stopTimer();
  gameState.seconds = 0;
  gameState.minutes = 0;
  gameState.hours = 0;
  gameState.totalSeconds = 0;
  const el = dom.timeCounterElement;
  if (el) el.textContent = "0:00";
}

export function movesCounter() {
  gameState.moves++;
  const el = dom.movesCounterElement;
  if (el) el.textContent = gameState.moves;
}
