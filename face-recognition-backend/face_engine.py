import face_recognition
import numpy as np
import cv2
from PIL import Image
import io

def get_face_encoding(image_bytes):
    """
    Detects faces in an image and returns the encoding of the first face found.
    """
    # Load image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    image_np = np.array(image.convert('RGB'))
    
    # Detect face locations
    face_locations = face_recognition.face_locations(image_np)
    
    if len(face_locations) == 0:
        raise ValueError("No face detected in the image.")
    if len(face_locations) > 1:
        raise ValueError("Multiple faces detected. Please ensure only one person is in frame.")
        
    # Get encoding
    encodings = face_recognition.face_encodings(image_np, face_locations)
    return encodings[0]

def compare_faces(captured_encoding, known_students):
    """
    Compares a captured encoding against a list of known student encodings.
    Returns the matching student or None.
    """
    if not known_students:
        return None
        
    known_encodings = [s['encoding'] for s in known_students]
    
    # Calculate distances (lower is better)
    face_distances = face_recognition.face_distance(known_encodings, captured_encoding)
    
    # Find the best match
    best_match_index = np.argmin(face_distances)
    
    # Threshold for matching (default is 0.6, lower is stricter)
    if face_distances[best_match_index] < 0.5:
        match = known_students[best_match_index]
        return {
            "student_id": match['student_id'],
            "name": match['name'],
            "confidence": 1 - face_distances[best_match_index]
        }
    
    return None
