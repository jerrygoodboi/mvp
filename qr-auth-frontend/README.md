# QR Passwordless Authentication Frontend

A modern React web portal for QR-based passwordless authentication.

## Features

- **QR Display**: Fetches and displays a dynamic QR code from the backend.
- **Auto-Refresh**: QR codes refresh every 60 seconds with a visual countdown.
- **Real-time Updates**: Uses WebSockets to detect when the QR code has been scanned.
- **Modern UI**: Styled with Tailwind CSS using a teal/navy color scheme.
- **Protected Dashboard**: Secure area accessible only after successful authentication.

## Prerequisites

- Node.js (v16 or newer recommended)
- npm or yarn
- Running [QR Auth Backend](../qr-auth-backend)

## Installation

1. Navigate to the project directory:
   ```bash
   cd qr-auth-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

## How to run the app

1. **Start the development server**:
   ```bash
   npm start
   ```

The app will start on [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/components/`: UI components (LoginPage, Dashboard, QRDisplay)
- `src/hooks/`: Custom React hooks (useWebSocket)
- `src/utils/`: Utility functions and API clients (api.js)
- `src/App.js`: Main routing logic
- `src/index.css`: Global styles and Tailwind configuration
