import { gameState } from "../state.js";
import { dom } from "../dom.js";
import { submitScore, fetchScores } from "../api/index.js";
import { computeScore } from "../utilities/score.js";
import { formatScoreboardDate } from "../utilities/date.js";

export async function showWinModal() {
  const finalScore = computeScore(
    gameState.totalPairs,
    gameState.totalSeconds,
    gameState.moves
  );
  const finalMovesEl = document.getElementById("finalMoves");
  const finalTimeEl = document.getElementById("finalTime");
  const finalScoreEl = document.getElementById("finalScore");
  if (finalMovesEl) finalMovesEl.textContent = gameState.moves;
  if (finalTimeEl) {
    finalTimeEl.textContent =
      gameState.hours > 0
        ? `${gameState.hours}:${String(gameState.minutes).padStart(2, "0")}:${String(gameState.seconds).padStart(2, "0")}`
        : `${gameState.minutes}:${String(gameState.seconds).padStart(2, "0")}`;
  }
  if (finalScoreEl) finalScoreEl.textContent = finalScore;
  if (dom.winModal) dom.winModal.classList.add("show");

  const playerName = dom.getStoredUserName();
  if (playerName) {
    try {
      await submitScore(playerName, finalScore);
    } catch (e) {
      console.error("Failed to save score:", e);
    }
  }
}

export function closeModal() {
  if (dom.winModal) dom.winModal.classList.remove("show");
}

export async function openScoreboard() {
  if (!dom.scoreboardList || !dom.scoreboardModal) return;
  dom.scoreboardList.innerHTML = "<p>Loading…</p>";
  dom.scoreboardModal.classList.add("show");
  try {
    const data = await fetchScores(1);
    if (!Array.isArray(data) || data.length === 0) {
      dom.scoreboardList.innerHTML = "<p>No scores yet.</p>";
      return;
    }
    dom.scoreboardList.innerHTML =
      `<div class="score-row score-row-header"><span>Player</span><span>Score</span><span>Date</span></div>` +
      data
        .map(
          (row) =>
            `<div class="score-row"><span>#${row.rank} ${row.playerName}</span><span>${row.score}</span><span>${formatScoreboardDate(row.dateTime)}</span></div>`
        )
        .join("");
  } catch (e) {
    console.error(e);
    dom.scoreboardList.innerHTML = "<p>Could not load scoreboard.</p>";
  }
}

export function closeScoreboard() {
  if (dom.scoreboardModal) dom.scoreboardModal.classList.remove("show");
}
