const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Initialize database
const dbPath = path.resolve(__dirname, '../app.db');
const db = new Database(dbPath, { verbose: console.log });

// Execute schema script
const initDb = () => {
    try {
        const schemaPath = path.resolve(__dirname, '../database.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
        console.log('Database initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

module.exports = db;
