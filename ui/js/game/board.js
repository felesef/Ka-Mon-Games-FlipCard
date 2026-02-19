import { gameState } from "../state.js";
import { dom } from "../dom.js";
import { fetchCards } from "../api/index.js";
import { mapCardsToUrls } from "../utilities/cards.js";
import { startTimer, stopTimer, resetTimer, movesCounter } from "./timer.js";
import { showWinModal } from "../ui/modals.js";

function setGameBoardGrid(cols, rows) {
  if (!dom.gameBoard) return;
  dom.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  dom.gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
}

function flipCard() {
  if (!gameState.canFlip) return;
  if (this.classList.contains("flipped")) return;
  if (this.classList.contains("matched")) return;

  if (!gameState.isTimerOn) startTimer();

  this.classList.add("flipped");

  if (gameState.firstCard == null) {
    gameState.firstCard = this;
  } else {
    gameState.secondCard = this;
    checkMatch();
    gameState.canFlip = false;
  }
}

function checkMatch() {
  const match =
    gameState.firstCard.dataset.image === gameState.secondCard.dataset.image;

  if (match) {
    gameState.matchedPairs++;
    gameState.firstCard.classList.add("flipped");
    gameState.secondCard.classList.add("flipped");
    setTimeout(() => {
      gameState.firstCard.classList.add("matched");
      gameState.secondCard.classList.add("matched");
      const firstIcon = gameState.firstCard.querySelector(".card-front i");
      const secondIcon = gameState.secondCard.querySelector(".card-front i");
      if (firstIcon) {
        firstIcon.className = "fas fa-check";
        firstIcon.style.color = "green";
      }
      if (secondIcon) {
        secondIcon.className = "fas fa-check";
        secondIcon.style.color = "green";
      }
      resetCards();
      if (gameState.matchedPairs === gameState.totalPairs) {
        stopTimer();
        showWinModal();
      }
    }, 1000);
  } else {
    setTimeout(() => {
      gameState.firstCard.classList.remove("flipped");
      gameState.secondCard.classList.remove("flipped");
      resetCards();
    }, 1500);
  }
}

function resetCards() {
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.canFlip = true;
  movesCounter();
}

export function buildGame(imageUrls) {
  if (!dom.gameBoard) return;
  dom.gameBoard.innerHTML = "";
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
    dom.gameBoard.appendChild(card);
  }

  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.canFlip = true;
  gameState.totalPairs = imageUrls.length;
  gameState.matchedPairs = 0;
}

export function startGame(imageUrls) {
  gameState.cardImages = imageUrls;
  gameState.moves = 0;
  if (dom.movesCounterElement) dom.movesCounterElement.textContent = "0";
  resetTimer();
  setGameBoardGrid(gameState.currentCols, gameState.currentRows);
  buildGame(imageUrls);
}

export async function newGame() {
  try {
    const cards = await fetchCards(
      gameState.currentTheme,
      gameState.currentPairCount
    );
    const urls = mapCardsToUrls(cards);
    if (urls.length === 0) throw new Error("No cards returned");
    startGame(urls);
  } catch (e) {
    console.error(e);
    if (dom.movesCounterElement)
      dom.movesCounterElement.textContent = "Error loading cards";
  }
}
