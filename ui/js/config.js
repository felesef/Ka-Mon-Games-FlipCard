export const API_BASE =
  typeof window !== "undefined" && window.API_BASE != null
    ? window.API_BASE
    : "";

// 🟡 [important] These themes should be fetched
// from the server in a real app, to avoid hardcoding and allow dynamic updates.
// → Fixed: themes for random are fetched from GET /api/themes (includes "dogs" only for random).
// THEMES below is the UI selector list (no "dogs"); "dogs" is used only when user picks "random".
export const THEMES = ["flags", "animals", "plants", "food"];

export const LEVELS = {
  1: { pairCount: 4, cols: 4, rows: 2 },
  2: { pairCount: 6, cols: 4, rows: 3 },
  3: { pairCount: 8, cols: 4, rows: 4 },
  4: { pairCount: 10, cols: 5, rows: 4 },
  5: { pairCount: 15, cols: 5, rows: 6 },
};

export const POINTS_PER_CARD = 10;
