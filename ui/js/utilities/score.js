import { POINTS_PER_CARD } from "../config.js";

export function computeScore(totalPairs, totalSeconds, moves) {
  const totalCards = totalPairs * 2;
  const maxScore = totalCards * POINTS_PER_CARD;
  const deducted = totalSeconds + moves;
  return Math.max(0, maxScore - deducted);
}
