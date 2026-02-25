// 🎉 Good work: centralized game state in a single exported object.
// This makes it easy to track and debug state changes across modules
export const gameState = {
  currentTheme: "dogs",
  currentPairCount: 8,
  currentCols: 4,
  currentRows: 4,
  cardImages: [],
  firstCard: null,
  secondCard: null,
  canFlip: true,
  moves: 0,
  isTimerOn: false,
  seconds: 0,
  minutes: 0,
  hours: 0,
  totalSeconds: 0,
  timerInterval: null,
  totalPairs: 0,
  matchedPairs: 0,
};
