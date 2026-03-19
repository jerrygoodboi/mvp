import sqlite3
import json
import numpy as np
from datetime import datetime

DB_PATH = "app.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            face_encoding BLOB NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Access history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS access_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            status TEXT NOT NULL,
            confidence REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def save_student(student_id, name, email, encoding):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Convert numpy array to binary
    encoding_bytes = encoding.tobytes()
    try:
        cursor.execute(
            "INSERT INTO students (student_id, name, email, face_encoding) VALUES (?, ?, ?, ?)",
            (student_id, name, email, encoding_bytes)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_all_students():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT student_id, name, email, face_encoding FROM students")
    rows = cursor.fetchall()
    conn.close()
    
    students = []
    for row in rows:
        students.append({
            "student_id": row[0],
            "name": row[1],
            "email": row[2],
            "encoding": np.frombuffer(row[3], dtype=np.float64)
        })
    return students

def log_access(student_id, status, confidence=0.0):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO access_history (student_id, status, confidence) VALUES (?, ?, ?)",
        (student_id, status, confidence)
    )
    conn.commit()
    conn.close()

def get_history(limit=10):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT h.*, s.name 
        FROM access_history h 
        LEFT JOIN students s ON h.student_id = s.student_id 
        ORDER BY h.timestamp DESC LIMIT ?
    ''', (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

init_db()
