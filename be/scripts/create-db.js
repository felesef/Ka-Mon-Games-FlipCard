const knex = require("knex");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "data", "database.sqlite3");
const cardsPath = path.join(__dirname, "..", "data", "cards.json");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
// 🟡 [important] - This deletes the entire database (including all scores) every time
// the script runs. The Render build command runs "npm run create-db", which means every
// deploy wipes all player scores. Consider checking if tables exist first and only seeding
// if the Cards table is empty
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const knexInstance = knex({
  client: "sqlite3",
  connection: { filename: dbPath },
  useNullAsDefault: true,
});

async function run() {
  await knexInstance.raw(`
    CREATE TABLE Cards (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      imgURL VARCHAR(2048) NOT NULL,
      theme VARCHAR(100) NOT NULL
    )
  `);
  await knexInstance.raw(`
    CREATE TABLE Scores (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      playerName VARCHAR(100) NOT NULL,
      dateTime TEXT NOT NULL
    )
  `);

  const cards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));
  for (const c of cards) {
    await knexInstance("Cards").insert({
      id: c.id,
      name: c.name,
      imgURL: c.imgURL,
      theme: c.theme,
    });
  }

  await knexInstance.destroy();
  console.log("Created", dbPath);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
