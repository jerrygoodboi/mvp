# Campus Lab OS - Advanced Authentication Suite

A complete, high-security ecosystem for passwordless authentication using QR codes, device binding, and facial biometrics. This system is designed to allow students to securely access their personalized Linux OS profiles at any computer in a lab environment.

## 🚀 System Components

1.  **QR Auth Monolith (`qr-auth-monolith/`)**:
    *   **Backend**: Node.js Express server handling JWT sessions, SQLite database, and WebSockets.
    *   **Frontend**: React-based portal displaying dynamic QR codes and a student dashboard.
    *   **Admin Panel**: Manage students, unbind devices, and view live access logs at `/admin`.

2.  **Mobile PWA Scanner (`qr-scanner-pwa/`)**:
    *   Mobile-first Progressive Web App for scanning QR codes.
    *   Integrated **Biometric Authentication** (FaceID/Fingerprint).
    *   **Device Binding**: Links a specific physical phone to a student ID for "Bank Grade" security.

3.  **Face Recognition System (`face-recognition-backend/ & frontend/`)**:
    *   **Engine**: Python FastAPI with `face_recognition` (dlib) for high-accuracy matching.
    *   **Enrollment**: Securely register student faces and map them to their IDs.
    *   **Recognition**: Live camera analysis to identify students and trigger OS profile loading.

---

## 🛠️ Prerequisites

*   **Node.js**: v18 or newer.
*   **Python**: v3.8 or newer (with `pip`).
*   **C++ Compiler**: Required for Python `face_recognition` library (e.g., `build-essential` on Linux, `cmake`).
*   **SSL/HTTPS**: The system is pre-configured with local certificates (`cert.pem`, `key.pem`) for secure camera and biometric access.

---

## 🏗️ Installation & Setup

### 1. Main Monolith (API & Portal)
```bash
cd qr-auth-monolith
npm run install-all
npm run build-client
```

### 2. Face Recognition Backend
```bash
cd face-recognition-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🏃 How to Run the System

To run the complete suite, open **three separate terminals**:

### Terminal 1: Main Server (Port 4000)
```bash
cd qr-auth-monolith
npm start
```
*   **Portal**: `https://10.138.24.4:4000`
*   **Admin**: `https://10.138.24.4:4000/admin` (User: `admin` / Pass: `admin123`)

### Terminal 2: Face Recognition Engine (Port 4000 - different process)
*Note: If testing on the same machine, ensure you change the port in `main.py` if needed.*
```bash
cd face-recognition-backend
python main.py
```

### Terminal 3: Mobile Scanner PWA (Port 5000)
```bash
cd qr-scanner-pwa
npx serve .
```
*   **Access**: `http://10.138.24.4:5000` (or via LocalTunnel/Ngrok for phone access).

---

## 🔒 Security Features

### 1. Device Binding
Each student is limited to **one registered phone**. The first phone to scan for a specific ID is "paired" in the database. Any attempt to use a second device will be blocked unless an admin "Unbinds" the device.

### 2. Biometric Verification
Even if a QR code is scanned, the login request is only sent to the server if the user successfully passes their phone's local Biometric check (Fingerprint/FaceID).

### 3. HTTPS for Biometrics
Browsers block camera and biometric APIs on insecure connections. This system uses local SSL certificates. 
**Crucial**: You must visit the backend URL (`https://10.138.24.4:4000`) once on your phone and click "Proceed anyway" to accept the certificate.

---

## 📁 Project Structure
*   `qr-auth-monolith/`: Core logic and web dashboard.
*   `qr-scanner-pwa/`: Mobile scanning app source.
*   `face-recognition-backend/`: Python face matching engine.
*   `face-recognition-frontend/`: Enrollment and recognition UI.
*   `standalone/`: Original separate builds (for reference only).

---

## 📋 Troubleshooting
*   **Camera Denied**: Ensure you are using `https://` or `localhost`.
*   **Server Unreachable**: Ensure the `API_BASE_URL` in `qr-scanner-pwa/app.js` matches your laptop's current IP address.
*   **Build Issues**: If the UI doesn't update, run `npm run build-client` inside the monolith folder.
