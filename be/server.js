const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "..", "images")));

const dbPath = path.join(__dirname, "data", "database.sqlite3");
const db = new Database(dbPath);

const ALLOWED_THEMES = ["dogs", "animals", "flags", "food", "plants"];

app.get("/api/cards", (req, res) => {
  const theme = (req.query.theme || "dogs").toLowerCase();
  if (!ALLOWED_THEMES.includes(theme)) {
    return res.status(400).json({
      error: "theme must be one of: dogs, animals, flags, food, plants",
      allowed: ALLOWED_THEMES,
    });
  }
  const pairCount = Math.min(Math.max(1, parseInt(req.query.pairCount, 10) || 8), 100);

  const rows = db
    .prepare(
      "SELECT id, theme, name, imgURL FROM Cards WHERE theme = ? LIMIT ?"
    )
    .all(theme, pairCount);

  const body = rows.map((row) => ({
    id: row.id,
    theme: row.theme,
    name: row.name,
    url: row.imgURL,
  }));

  res.json(body);
});

app.post("/api/score", (req, res) => {
  const { playerName, score } = req.body || {};
  if (typeof playerName !== "string" || typeof score !== "number") {
    return res.status(400).json({
      error: "playerName (string) and score (number) required",
    });
  }
  const name = String(playerName).trim();
  if (!name) return res.status(400).json({ error: "playerName required" });

  const dateTime = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO Scores (score, playerName, dateTime) VALUES (?, ?, ?)"
    )
    .run(score, name, dateTime);
  const id = result.lastInsertRowid;
  res.status(201).json({ id, playerName: name, score, dateTime });
});

app.put("/api/score", (req, res) => {
  const { id, score } = req.body || {};
  if (id == null || typeof score !== "number") {
    return res.status(400).json({
      error: "id and score (number) required",
    });
  }
  const scoreId = Number(id);
  if (!Number.isInteger(scoreId) || scoreId < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const dateTime = new Date().toISOString();
  const result = db
    .prepare("UPDATE Scores SET score = ?, dateTime = ? WHERE id = ?")
    .run(score, dateTime, scoreId);
  if (result.changes === 0) {
    return res.status(404).json({ error: "score not found" });
  }
  const row = db
    .prepare("SELECT id, playerName, score, dateTime FROM Scores WHERE id = ?")
    .get(scoreId);
  res.status(200).json({
    id: row.id,
    playerName: row.playerName,
    score: row.score,
    dateTime: row.dateTime,
  });
});

const SCORES_PER_PAGE = 25;

app.get("/api/scores", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * SCORES_PER_PAGE;

  const rows = db
    .prepare(
      "SELECT id, playerName, score, dateTime FROM Scores ORDER BY score DESC LIMIT ? OFFSET ?"
    )
    .all(SCORES_PER_PAGE, offset);

  const body = rows.map((row, i) => ({
    id: row.id,
    playerName: row.playerName,
    score: row.score,
    rank: (page - 1) * SCORES_PER_PAGE + i + 1,
    dateTime: row.dateTime,
  }));

  res.json(body);
});

const uiDir = path.join(__dirname, "..", "ui");
app.use(express.static(uiDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/images")) return next();
  res.sendFile(path.join(uiDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`App at http://localhost:${PORT} (UI + API at /api/...)`);
});
