const API_BASE = typeof window !== "undefined" && window.API_BASE != null
  ? window.API_BASE
  : "http://localhost:3000";

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

let seconds = 0;
let minutes = 0;
let hours = 0;
let timerInterval;
let totalPairs = 0;
let matchedPairs = 0;

async function fetchCards() {
  const res = await fetch(`${API_BASE}/cards?theme=dogs&pairCount=8`);
  if (!res.ok) throw new Error("Failed to load cards");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.cards || []);
}

function mapCardsToUrls(cards) {
  return cards.map((c) => (typeof c === "string" ? c : c.imgURL || c.url)).filter(Boolean);
}

function startTimer() {
  isTimerOn = true;
  timerInterval = setInterval(() => {
    seconds++;
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
  timeCounterElement.textContent = "0:00";
}

function movesCounter() {
  moves++;
  movesCounterElement.textContent = moves;
}

function showWinModal() {
  document.getElementById("finalMoves").textContent = moves;
  document.getElementById("finalTime").textContent =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;
  winModal.classList.add("show");
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
  movesCounterElement.textContent = "0";
  resetTimer();
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
    const cards = await fetchCards();
    const urls = mapCardsToUrls(cards);
    if (urls.length === 0) throw new Error("No cards returned");
    startGame(urls);
  } catch (e) {
    console.error(e);
    movesCounterElement.textContent = "Error loading cards";
  }
}

async function init() {
  try {
    const cards = await fetchCards();
    const urls = mapCardsToUrls(cards);
    if (urls.length === 0) throw new Error("No cards returned");
    startGame(urls);
  } catch (e) {
    console.error(e);
    gameBoard.innerHTML = "<p>Could not load cards. Start the backend (be) and refresh.</p>";
  }
}

init();
