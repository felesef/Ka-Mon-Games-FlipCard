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

app.get("/cards", (req, res) => {
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

/**
 * GET /players?name=xxx – check if player name is unique (not in Scores)
 * Response: { "unique": true } if name is available, { "unique": false } if already in Scores
 */
app.get("/players", (req, res) => {
  const name = String(req.query.name ?? "").trim();
  if (!name) {
    return res.status(400).json({ error: "Query parameter 'name' is required" });
  }
  const row = db.prepare("SELECT 1 FROM Scores WHERE playerName = ?").get(name);
  res.json({ unique: !row });
});

app.post("/score", (req, res) => {
  const { playerName, score } = req.body || {};
  if (typeof playerName !== "string" || typeof score !== "number") {
    return res.status(400).json({
      error: "playerName (string) and score (number) required",
    });
  }
  const name = String(playerName).trim();
  if (!name) return res.status(400).json({ error: "playerName required" });

  const existing = db.prepare("SELECT 1 FROM Scores WHERE playerName = ?").get(name);
  if (existing) {
    return res.status(400).json({ error: "player name already taken" });
  }

  const dateTime = new Date().toISOString();
  db.prepare(
    "INSERT INTO Scores (score, playerName, dateTime) VALUES (?, ?, ?)"
  ).run(score, name, dateTime);
  res.status(204).send();
});

app.put("/score", (req, res) => {
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
    .prepare("UPDATE Scores SET score = ?, dateTime = ? WHERE playerName = ?")
    .run(score, dateTime, name);
  if (result.changes === 0) {
    return res.status(404).json({ error: "player not found" });
  }
  res.status(204).send();
});

const SCORES_PER_PAGE = 25;

app.get("/scores", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * SCORES_PER_PAGE;

  const rows = db
    .prepare(
      "SELECT playerName, score, dateTime FROM Scores ORDER BY score DESC LIMIT ? OFFSET ?"
    )
    .all(SCORES_PER_PAGE, offset);

  const body = rows.map((row, i) => ({
    playerName: row.playerName,
    score: row.score,
    rank: (page - 1) * SCORES_PER_PAGE + i + 1,
    dateTime: row.dateTime,
  }));

  res.json(body);
});

app.listen(PORT, () => {
  console.log(`BE running at http://localhost:${PORT}`);
});
