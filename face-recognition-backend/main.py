import uvicorn
import os
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from database import (
    save_student, get_all_students, log_access, get_history, 
    admin_login, get_all_students_full, update_student, delete_student
)
from face_engine import get_face_encoding, compare_faces

app = FastAPI(title="Face Recognition API - Campus Lab OS")

JWT_SECRET = "face-admin-secret-key-123"
ALGORITHM = "HS256"

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
UPLOAD_DIR = "uploads/faces"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Admin Auth Dependency
async def verify_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "Face Recognition Backend is active"}

# --- Public API ---

@app.post("/api/face/enroll")
async def enroll(
    studentId: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    faceImage: UploadFile = File(...)
):
    try:
        # Read image
        image_bytes = await faceImage.read()
        
        # Save image file for record
        file_path = os.path.join(UPLOAD_DIR, f"{studentId}.jpg")
        with open(file_path, "wb") as f:
            f.write(image_bytes)
            
        # Get face encoding
        encoding = get_face_encoding(image_bytes)
        
        # Save to database
        success = save_student(studentId, name, email, encoding)
        
        if not success:
            raise HTTPException(status_code=400, detail="Student ID already enrolled.")
            
        return {"success": True, "message": f"Student {name} enrolled successfully."}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Enrollment error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during enrollment.")

@app.post("/api/face/recognize")
async def recognize(faceImage: UploadFile = File(...)):
    try:
        # Read image
        image_bytes = await faceImage.read()
        
        # Get encoding of the person currently at the computer
        captured_encoding = get_face_encoding(image_bytes)
        
        # Get all known students from DB
        known_students = get_all_students()
        
        # Match face
        match = compare_faces(captured_encoding, known_students)
        
        if match:
            # Success: Log access
            log_access(match['student_id'], "SUCCESS", match['confidence'])
            return {"match": True, "user": match}
        else:
            # Failure: Log attempt
            log_access(None, "FAILED")
            return {"match": False, "message": "Face not recognized."}
            
    except ValueError as e:
        # No face or multiple faces
        log_access(None, "ERROR")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Recognition error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during recognition.")

@app.get("/api/face/history")
async def fetch_history():
    try:
        history = get_history(limit=10)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch history.")

# --- Admin API ---

@app.post("/api/admin/login")
async def login(data: dict):
    username = data.get("username")
    password = data.get("password")
    
    admin = admin_login(username, password)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
    # Generate token
    token = jwt.encode({
        "id": admin["id"],
        "username": admin["username"],
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(hours=12)
    }, JWT_SECRET, algorithm=ALGORITHM)
    
    return {"token": token}

@app.get("/api/admin/students")
async def list_students(_ = Depends(verify_admin)):
    return get_all_students_full()

@app.put("/api/admin/students/{student_db_id}")
async def update_student_info(student_db_id: int, data: dict, _ = Depends(verify_admin)):
    success = update_student(student_db_id, data.get("studentId"), data.get("name"), data.get("email"))
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update student.")
    return {"message": "Student updated successfully"}

@app.delete("/api/admin/students/{studentId}")
async def remove_student(studentId: str, _ = Depends(verify_admin)):
    # Delete database record
    success = delete_student(studentId)
    
    # Delete image if exists
    file_path = os.path.join(UPLOAD_DIR, f"{studentId}.jpg")
    if os.path.exists(file_path):
        os.remove(file_path)
        
    if not success:
        raise HTTPException(status_code=404, detail="Student not found.")
    return {"message": "Student deleted successfully"}

@app.get("/api/admin/history")
async def admin_history(_ = Depends(verify_admin)):
    return get_history(limit=100)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)
