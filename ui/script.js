const API_BASE = typeof window !== "undefined" && window.API_BASE != null
  ? window.API_BASE
  : "";

const THEMES = ["dogs", "flags", "animals", "plants", "food"];
const LEVELS = {
  "4x2": { pairCount: 4, cols: 4, rows: 2 },
  "4x3": { pairCount: 6, cols: 4, rows: 3 },
  "4x4": { pairCount: 8, cols: 4, rows: 4 },
  "5x4": { pairCount: 10, cols: 5, rows: 4 },
  "5x6": { pairCount: 15, cols: 5, rows: 6 },
};

let currentTheme = "dogs";
let currentPairCount = 8;
let currentCols = 4;
let currentRows = 4;
let cardImages = [];
let firstCard = null;
let secondCard = null;
let canFlip = true;
let moves = 0;
let isTimerOn = false;

const gameBoard = document.getElementById("gameBoard");
const movesCounterElement = document.getElementById("movesCounter");
const timeCounterElement = document.getElementById("timeCounter");
const winModal = document.getElementById("winModal");
const setupContainer = document.getElementById("setupContainer");
const gameArea = document.getElementById("gameArea");
const scoreboardModal = document.getElementById("scoreboardModal");
const scoreboardList = document.getElementById("scoreboardList");

const POINTS_PER_CARD = 10;

let seconds = 0;
let minutes = 0;
let hours = 0;
let totalSeconds = 0;
let timerInterval;
let totalPairs = 0;
let matchedPairs = 0;

function getStoredUserName() {
  const input = document.getElementById("userName");
  return input ? String(input.value || "").trim() : "";
}

async function fetchCards(theme, pairCount) {
  const t = theme === "random" ? THEMES[Math.floor(Math.random() * THEMES.length)] : theme;
  const res = await fetch(`${API_BASE}/api/cards?theme=${encodeURIComponent(t)}&pairCount=${pairCount}`);
  if (!res.ok) throw new Error("Failed to load cards");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.cards || []);
}

function mapCardsToUrls(cards) {
  return cards.map((c) => (typeof c === "string" ? c : c.imgURL || c.url)).filter(Boolean);
}

function setGameBoardGrid(cols, rows) {
  if (!gameBoard) return;
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
}

function startTimer() {
  isTimerOn = true;
  timerInterval = setInterval(() => {
    seconds++;
    totalSeconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }
    if (hours === 0) {
      timeCounterElement.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
    } else {
      timeCounterElement.textContent = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
  }, 1000);
}

function stopTimer() {
  isTimerOn = false;
  if (timerInterval) clearInterval(timerInterval);
}

function resetTimer() {
  stopTimer();
  seconds = 0;
  minutes = 0;
  hours = 0;
  totalSeconds = 0;
  if (timeCounterElement) timeCounterElement.textContent = "0:00";
}

function movesCounter() {
  moves++;
  if (movesCounterElement) movesCounterElement.textContent = moves;
}

function computeScore() {
  const totalCards = totalPairs * 2;
  const maxScore = totalCards * POINTS_PER_CARD;
  const deducted = totalSeconds + moves;
  return Math.max(0, maxScore - deducted);
}

async function showWinModal() {
  const finalScore = computeScore();
  document.getElementById("finalMoves").textContent = moves;
  document.getElementById("finalTime").textContent =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;
  document.getElementById("finalScore").textContent = finalScore;
  winModal.classList.add("show");

  const playerName = getStoredUserName();
  if (playerName) {
    try {
      await fetch(`${API_BASE}/api/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, score: finalScore }),
      });
    } catch (e) {
      console.error("Failed to save score:", e);
    }
  }
}

function closeModal() {
  winModal.classList.remove("show");
}

function buildGame(imageUrls) {
  gameBoard.innerHTML = "";
  const sorted = [...imageUrls, ...imageUrls].sort(() => Math.random() - 0.5);

  for (let i = 0; i < sorted.length; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      '<div class="card-front"><i class="fas fa-question"></i></div>' +
      '<div class="card-back"><img src="' +
      sorted[i] +
      '" alt=""></div>';
    card.onclick = flipCard;
    card.dataset.image = sorted[i];
    gameBoard.appendChild(card);
  }

  firstCard = null;
  secondCard = null;
  canFlip = true;
  totalPairs = imageUrls.length;
  matchedPairs = 0;
}

function startGame(imageUrls) {
  cardImages = imageUrls;
  moves = 0;
  if (movesCounterElement) movesCounterElement.textContent = "0";
  resetTimer();
  setGameBoardGrid(currentCols, currentRows);
  buildGame(imageUrls);
}

function flipCard() {
  if (!canFlip) return;
  if (this.classList.contains("flipped")) return;
  if (this.classList.contains("matched")) return;

  if (!isTimerOn) startTimer();

  this.classList.add("flipped");

  if (firstCard == null) {
    firstCard = this;
  } else {
    secondCard = this;
    checkMatch();
    canFlip = false;
  }
}

function checkMatch() {
  const match = firstCard.dataset.image === secondCard.dataset.image;

  if (match) {
    matchedPairs++;
    firstCard.classList.add("flipped");
    secondCard.classList.add("flipped");
    setTimeout(() => {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      const firstIcon = firstCard.querySelector(".card-front i");
      const secondIcon = secondCard.querySelector(".card-front i");
      if (firstIcon) {
        firstIcon.className = "fas fa-check";
        firstIcon.style.color = "green";
      }
      if (secondIcon) {
        secondIcon.className = "fas fa-check";
        secondIcon.style.color = "green";
      }
      resetCards();
      if (matchedPairs === totalPairs) {
        stopTimer();
        showWinModal();
      }
    }, 1000);
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetCards();
    }, 1500);
  }
}

function resetCards() {
  firstCard = null;
  secondCard = null;
  canFlip = true;
  movesCounter();
}

async function newGame() {
  try {
    const cards = await fetchCards(currentTheme, currentPairCount);
    const urls = mapCardsToUrls(cards);
    if (urls.length === 0) throw new Error("No cards returned");
    startGame(urls);
  } catch (e) {
    console.error(e);
    if (movesCounterElement) movesCounterElement.textContent = "Error loading cards";
  }
}

function onStartGame() {
  const name = getStoredUserName();
  if (!name) {
    alert("Please enter your name.");
    return;
  }
  const themeSelect = document.getElementById("theme");
  const levelSelect = document.getElementById("level");
  const theme = themeSelect ? themeSelect.value : "dogs";
  const levelKey = levelSelect ? levelSelect.value : "4x4";
  const level = LEVELS[levelKey] || LEVELS["4x4"];

  currentTheme = theme;
  currentPairCount = level.pairCount;
  currentCols = level.cols;
  currentRows = level.rows;

  setupContainer.hidden = true;
  gameArea.hidden = false;

  newGame();
}

async function openScoreboard() {
  scoreboardList.innerHTML = "<p>Loading…</p>";
  scoreboardModal.classList.add("show");
  try {
    const res = await fetch(`${API_BASE}/api/scores?page=1`);
    if (!res.ok) throw new Error("Failed to load scores");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      scoreboardList.innerHTML = "<p>No scores yet.</p>";
      return;
    }
    scoreboardList.innerHTML =
      `<div class="score-row score-row-header"><span>Player</span><span>Score</span><span>Date</span></div>` +
      data
        .map(
          (row) =>
            `<div class="score-row"><span>#${row.rank} ${row.playerName}</span><span>${row.score}</span><span>${formatScoreboardDate(row.dateTime)}</span></div>`
        )
        .join("");
  } catch (e) {
    console.error(e);
    scoreboardList.innerHTML = "<p>Could not load scoreboard.</p>";
  }
}

function formatScoreboardDate(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? isoString : d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (_) {
    return isoString;
  }
}

function closeScoreboard() {
  scoreboardModal.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startGameBtn");
  if (startBtn) startBtn.addEventListener("click", onStartGame);
});
