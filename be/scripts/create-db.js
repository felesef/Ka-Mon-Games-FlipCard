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
// → Fixed: we only create tables and seed when the DB is missing or Cards table is empty.

const knexInstance = knex({
  client: "sqlite3",
  connection: { filename: dbPath },
  useNullAsDefault: true,
});

async function tableExists(tableName) {
  return knexInstance.schema.hasTable(tableName);
}

async function cardsTableEmpty() {
  const result = await knexInstance("Cards").count("* as count").first();
  return result && Number(result.count) === 0;
}

async function createTables() {
  await knexInstance.raw(`
    CREATE TABLE IF NOT EXISTS Cards (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      imgURL VARCHAR(2048) NOT NULL,
      theme VARCHAR(100) NOT NULL
    )
  `);
  await knexInstance.raw(`
    CREATE TABLE IF NOT EXISTS Scores (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      playerName VARCHAR(100) NOT NULL,
      dateTime TEXT NOT NULL
    )
  `);
}

async function seedCards() {
  const cards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));
  for (const c of cards) {
    await knexInstance("Cards").insert({
      id: c.id,
      name: c.name,
      imgURL: c.imgURL,
      theme: c.theme,
    });
  }
}

async function run() {
  const cardsExists = await tableExists("Cards");
  const needTables = !cardsExists;
  const needSeed = needTables || (cardsExists && (await cardsTableEmpty()));

  if (needTables) {
    await createTables();
  }
  if (needSeed) {
    await seedCards();
    console.log("Created/updated", dbPath, needTables ? "(tables + seed)" : "(seed only)");
  } else {
    console.log("Database already has cards and scores; skipping to preserve data.");
  }

  await knexInstance.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
