import { API_BASE } from "../config.js";

let cachedThemes = null;

export async function fetchThemes() {
  if (cachedThemes) return cachedThemes;
  const res = await fetch(`${API_BASE}/api/themes`);
  if (!res.ok) throw new Error("Failed to load themes");
  const data = await res.json();
  cachedThemes = Array.isArray(data) ? data : [];
  return cachedThemes;
}

export async function fetchCards(theme, pairCount) {
  let pick = theme;
  if (theme === "random") {
    const themes = await fetchThemes();
    pick = themes[Math.floor(Math.random() * themes.length)];
  }
  const res = await fetch(
    `${API_BASE}/api/cards?theme=${encodeURIComponent(pick)}&pairCount=${pairCount}`
  );
  if (!res.ok) throw new Error("Failed to load cards");
  const data = await res.json();
  return Array.isArray(data) ? data : data.cards || [];
}

export async function submitScore(playerName, score) {
  const res = await fetch(`${API_BASE}/api/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, score }),
  });
  if (!res.ok) throw new Error("Failed to save score");
}

export async function fetchScores(page = 1) {
  const res = await fetch(`${API_BASE}/api/scores?page=${page}`);
  if (!res.ok) throw new Error("Failed to load scores");
  return res.json();
}
