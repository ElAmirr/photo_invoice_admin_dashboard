const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbDir = path.dirname(process.env.DB_PATH || './data/licenses.db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(process.env.DB_PATH || './data/licenses.db');

// Initialize schema
db.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        machine_id TEXT,
        email TEXT,
        activated_at DATETIME,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id TEXT UNIQUE NOT NULL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_blocked INTEGER DEFAULT 0
    );
`);

module.exports = db;
