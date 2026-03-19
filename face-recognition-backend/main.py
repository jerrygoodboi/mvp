from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from database import save_student, get_all_students, log_access, get_history
from face_engine import get_face_encoding, compare_faces

app = FastAPI(title="Face Recognition API - Campus Lab OS")

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

@app.get("/")
async def root():
    return {"message": "Face Recognition Backend is active"}

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
        history = get_history()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch history.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)
