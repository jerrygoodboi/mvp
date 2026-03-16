# QR Passwordless Authentication Backend

A complete Node.js Express backend for QR-based passwordless authentication.

## Features

- Generates unique QR codes containing temporary JWT session tokens
- Handles QR verification with a 60-second expiration window
- Issues 24-hour authentication tokens upon successful verification
- Uses WebSockets to broadcast real-time "authenticated" events to the client
- Uses an SQLite database to store users, sessions, and login history

## Prerequisites

- Node.js (v14 or newer recommended)
- npm or yarn

## Installation

1. Navigate to the project directory:
   ```bash
   cd qr-auth-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and update it if needed:
   ```bash
   cp .env.example .env
   ```

## How to run the server

1. **Development mode** (with auto-reloading):
   ```bash
   npm run dev
   ```

2. **Production mode**:
   ```bash
   npm start
   ```

The server will start on port 4000 by default (configurable via `.env`). The SQLite database `app.db` will be automatically created and initialized with a test user `S12345` during the first run.

## API Endpoints

### 1. Generate QR Code
- **URL:** `/api/auth/generate-qr`
- **Method:** `POST`
- **Description:** Generates a new session and returns a base64 encoded QR code.
- **Request Body:** None
- **Response:**
  ```json
  {
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "expiresIn": 60
  }
  ```

### 2. Verify QR Code
- **URL:** `/api/auth/verify-qr`
- **Method:** `POST`
- **Description:** Validates a session and a student ID. If successful, creates a 24-hour auth token and emits a WebSocket event.
- **Request Body:**
  ```json
  {
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "studentId": "S12345"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Authentication successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "studentId": "S12345",
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }
  ```

### 3. Validate Token
- **URL:** `/api/auth/validate`
- **Method:** `GET`
- **Description:** Validates a JWT token and returns the user payload.
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Response:**
  ```json
  {
    "valid": true,
    "user": {
      "id": 1,
      "studentId": "S12345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "iat": 1690000000,
      "exp": 1690086400
    }
  }
  ```

### 4. WebSocket Updates
- **URL:** `ws://localhost:4000/socket`
- **Description:** Connect to this endpoint to receive real-time authentication updates.
- **Event format received when a QR code is verified:**
  ```json
  {
    "event": "authenticated",
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "studentInfo": {
      "studentId": "S12345",
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }
  ```
