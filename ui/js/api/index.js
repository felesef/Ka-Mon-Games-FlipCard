import { API_BASE, THEMES } from "../config.js";

export async function fetchCards(theme, pairCount) {
  const t =
    theme === "random"
      ? THEMES[Math.floor(Math.random() * THEMES.length)]
      : theme;
  const res = await fetch(
    `${API_BASE}/api/cards?theme=${encodeURIComponent(t)}&pairCount=${pairCount}`
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
