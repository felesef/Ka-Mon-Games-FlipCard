const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "data", "database.sqlite3");
const cardsPath = path.join(__dirname, "..", "data", "cards.json");

// Ensure data dir exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Remove existing DB so we get a clean "ready" file
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);

// Schema matching db-setup.sql (SQLite compatible)
db.exec(`
  CREATE TABLE Cards (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    imgURL VARCHAR(2048) NOT NULL,
    theme VARCHAR(100) NOT NULL
  );

  CREATE TABLE Scores (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    score INTEGER NOT NULL,
    playerName VARCHAR(100) NOT NULL UNIQUE,
    dateTime TEXT NOT NULL
  );
`);

const cards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));

const insertCard = db.prepare(
  "INSERT INTO Cards (id, name, imgURL, theme) VALUES (@id, @name, @imgURL, @theme)"
);

for (const c of cards) {
  insertCard.run({
    id: c.id,
    name: c.name,
    imgURL: c.imgURL,
    theme: c.theme,
  });
}

db.close();
console.log("Created", dbPath);
