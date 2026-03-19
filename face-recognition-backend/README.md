# Face Recognition Backend - Campus Lab OS

A Python FastAPI backend for high-accuracy face recognition and student enrollment.

## Tech Stack
- **FastAPI**: Modern, high-performance web framework.
- **face_recognition**: Industry-standard library built on `dlib` for face detection and encoding.
- **SQLite**: Lightweight database for storing student profiles and encodings.
- **OpenCV & Pillow**: Image processing.

## Installation

### Prerequisites
- Python 3.8 or newer.
- `cmake` (Required for `dlib` compilation).
  - Linux: `sudo apt install cmake`
  - Mac: `brew install cmake`

### Setup
1. Navigate to the backend directory:
   ```bash
   cd face-recognition-backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server
```bash
python main.py
```
The server will start on `http://0.0.0.0:4000`.

## API Endpoints

### 1. Enrollment
- **URL**: `/api/face/enroll`
- **Method**: `POST`
- **Payload**: `multipart/form-data`
  - `studentId`: string
  - `name`: string
  - `email`: string
  - `faceImage`: file (JPEG/PNG)

### 2. Recognition
- **URL**: `/api/face/recognize`
- **Method**: `POST`
- **Payload**: `multipart/form-data`
  - `faceImage`: file (JPEG/PNG)
- **Returns**: Match status and student profile.

### 3. History
- **URL**: `/api/face/history`
- **Method**: `GET`
- **Returns**: Last 10 access attempts.

## Lab OS Integration
When a match is found in `/api/face/recognize`, the backend logs the success. In a production lab environment, this response can be used by a local client script to execute:
`su - [studentId]` or mount the student's network home directory.
