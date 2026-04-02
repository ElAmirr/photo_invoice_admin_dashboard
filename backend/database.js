const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL for Render PostgreSQL connectivity
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize schema (PostgreSQL syntax)
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS licenses (
                id SERIAL PRIMARY KEY,
                key VARCHAR(255) UNIQUE NOT NULL,
                machine_id VARCHAR(255),
                email VARCHAR(255),
                activated_at TIMESTAMP,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS trials (
                id SERIAL PRIMARY KEY,
                machine_id VARCHAR(255) UNIQUE NOT NULL,
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_blocked INTEGER DEFAULT 0
            );
        `);
        console.log("PostgreSQL schemas initialized.");
    } catch (err) {
        console.error("PostgreSQL Init Error:", err);
    }
};

initDB();

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
