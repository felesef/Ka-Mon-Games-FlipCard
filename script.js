const cardImages = [
  "https://images.dog.ceo/breeds/terrier-sealyham/n02095889_975.jpg",
  "https://images.dog.ceo/breeds/wolfhound-irish/n02090721_1131.jpg",
  "https://images.dog.ceo/breeds/terrier-westhighland/n02098286_5353.jpg",
  "https://images.dog.ceo/breeds/schnauzer-giant/n02097130_700.jpg",
  "https://images.dog.ceo/breeds/pyrenees/n02111500_7983.jpg",
  "https://images.dog.ceo/breeds/lhasa/n02098413_13083.jpg",
  "https://images.dog.ceo/breeds/collie-border/n02106166_855.jpg",
  "https://images.dog.ceo/breeds/akita/512px-Ainu-Dog.jpg",
];

let firstCard = null;
let secondCard = null;
let canFlip = true;
let moves = 0;
let isTimerOn = false;

function startGame() {
  const gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";

  const sortedCardImages = cardImages.concat(cardImages);
  sortedCardImages.sort(() => Math.random() - 0.5);

  for (let i = 0; i < sortedCardImages.length; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      '<div class="card-front"><i class="fas fa-question"></i></div>' +
      '<div class="card-back"><img src="' +
      sortedCardImages[i] +
      '"></div>';
    card.onclick = flipCard;
    card.dataset.image = sortedCardImages[i];
    gameBoard.appendChild(card);
  }

  firstCard = null;
  secondCard = null;
  canFlip = true;
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
    checkMatch(); // Check for match immediately after second card is flipped
    canFlip = false;
  }
}

function checkMatch() {
  const match = firstCard.dataset.image === secondCard.dataset.image;

  if (match) {
    checkWin(); // Check if the player has won after a successful match
    firstCard.classList.add("flipped");
    secondCard.classList.add("flipped");

    // Wait a bit so the flip animation can be seen
    setTimeout(() => {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");

      // Change question mark to green checkmark
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

// Function to count moves
const movesCounterElement = document.getElementById("movesCounter");

function movesCounter() {
  moves++;
  movesCounterElement.textContent = moves;
}

// Function to count time
const timeCounterElement = document.getElementById("timeCounter");

let seconds = 0;
let minutes = 0;
let hours = 0;
let timerInterval;

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

    if (hours == 0) {
      timeCounterElement.textContent = `${minutes}:${seconds}`;
    } else {
      timeCounterElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }, 1000);
}

// Function to stop the timer
function stopTimer() {
  isTimerOn = false;
  clearInterval(timerInterval);
}

let totalPairs = cardImages.length;
let matchedPairs = 0;

function checkWin() {
  matchedPairs++;
  if (matchedPairs === totalPairs) {
    isTimerOn = false; // Stop the timer
    stopTimer();
    // showWinModal();
  }
}

startGame();
