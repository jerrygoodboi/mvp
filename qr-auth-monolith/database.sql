CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin for the prototype
INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', 'admin123');

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    deviceId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT UNIQUE NOT NULL,
    qrToken TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NOT NULL,
    scanned BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS loginHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT NOT NULL,
    method TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    FOREIGN KEY(studentId) REFERENCES users(studentId)
);

-- Insert a test user for demonstration purposes
INSERT OR IGNORE INTO users (studentId, name, email) VALUES ('S12345', 'John Doe', 'john.doe@example.com');
