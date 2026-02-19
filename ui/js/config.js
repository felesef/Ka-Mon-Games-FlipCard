export const API_BASE =
  typeof window !== "undefined" && window.API_BASE != null
    ? window.API_BASE
    : "";

export const THEMES = ["dogs", "flags", "animals", "plants", "food"];

export const LEVELS = {
  "4x2": { pairCount: 4, cols: 4, rows: 2 },
  "4x3": { pairCount: 6, cols: 4, rows: 3 },
  "4x4": { pairCount: 8, cols: 4, rows: 4 },
  "5x4": { pairCount: 10, cols: 5, rows: 4 },
  "5x6": { pairCount: 15, cols: 5, rows: 6 },
};

export const POINTS_PER_CARD = 10;
