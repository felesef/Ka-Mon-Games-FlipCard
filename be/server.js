const express = require("express");
const cors = require("cors");
const path = require("path");
const knex = require("knex");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "..", "images")));

const dbPath = path.join(__dirname, "data", "database.sqlite3");
const knexInstance = knex({
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

async function getAllowedThemes() {
  const rows = await knexInstance("Cards").distinct("theme").select("theme").orderBy("theme");
  return rows.map((r) => r.theme);
}

// 🔴 [blocking] - No try/catch around database queries. If the DB is unavailable or the query
// fails, the unhandled promise rejection will crash the server. Wrap in try/catch or add
// an Express error-handling middleware: app.use((err, req, res, next) => { ... })
// → Fixed: wrapAsync forwards async rejections to next(); error middleware below returns 500 JSON.
function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get("/api/themes", wrapAsync(async (req, res) => {
  const themes = await getAllowedThemes();
  res.json(themes);
}));

app.get("/api/cards", wrapAsync(async (req, res) => {
  const allowedThemes = await getAllowedThemes();
  const theme = (req.query.theme || (allowedThemes[0] || "animals")).toLowerCase();
  if (!allowedThemes.includes(theme)) {
    return res.status(400).json({
      error: "theme does not exist",
      allowed: allowedThemes,
    });
  }
  const pairCount = Math.min(Math.max(1, parseInt(req.query.pairCount, 10) || 8), 100);

  const rows = await knexInstance("Cards")
    .select("id", "theme", "name", "imgURL")
    .where("theme", theme)
    .limit(pairCount)
    .orderBy("id", "asc");

  const body = rows.map((row) => ({
    id: row.id,
    theme: row.theme,
    name: row.name,
    url: row.imgURL,
  }));

  res.json(body);
}));

app.post("/api/score", wrapAsync(async (req, res) => {
  const { playerName, score } = req.body || {};
  if (typeof playerName !== "string" || typeof score !== "number") {
    return res.status(400).json({
      error: "playerName (string) and score (number) required",
    });
  }
  const name = String(playerName).trim();
  if (!name) return res.status(400).json({ error: "playerName required" });

  const dateTime = new Date().toISOString();
  await knexInstance("Scores").insert({
    score,
    playerName: name,
    dateTime,
  });

  const row = await knexInstance("Scores")
    .select("id", "playerName", "score", "dateTime")
    .orderBy("id", "desc")
    .first();

  res.status(201).json({
    id: row.id,
    playerName: row.playerName,
    score: row.score,
    dateTime: row.dateTime,
  });
}));

app.put("/api/score", wrapAsync(async (req, res) => {
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
  const updated = await knexInstance("Scores")
    .where("id", scoreId)
    .update({ score, dateTime });

  if (updated === 0) {
    return res.status(404).json({ error: "score not found" });
  }

  const row = await knexInstance("Scores")
    .select("id", "playerName", "score", "dateTime")
    .where("id", scoreId)
    .first();

  res.status(200).json({
    id: row.id,
    playerName: row.playerName,
    score: row.score,
    dateTime: row.dateTime,
  });
}));

const SCORES_PER_PAGE = 25;

// 🎉 Good work: pagination with calculated rank - clean implementation
app.get("/api/scores", wrapAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * SCORES_PER_PAGE;

  const rows = await knexInstance("Scores")
    .select("id", "playerName", "score", "dateTime")
    .orderBy("score", "desc")
    .limit(SCORES_PER_PAGE)
    .offset(offset);

  const body = rows.map((row, i) => ({
    id: row.id,
    playerName: row.playerName,
    score: row.score,
    rank: (page - 1) * SCORES_PER_PAGE + i + 1,
    dateTime: row.dateTime,
  }));

  res.json(body);
}));

const uiDir = path.join(__dirname, "..", "ui");
app.use(express.static(uiDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/images")) return next();
  res.sendFile(path.join(uiDir, "index.html"));
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`App at http://localhost:${PORT} (UI + API at /api/...)`);
});
