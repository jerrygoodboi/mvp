# QR Auth Monolith

A merged project containing both the Node.js Express API and the React Web Portal.

## Structure
- Root: Express server (`server.js`), API routes, models, and middleware.
- `client/`: React source code.
- `client/build/`: Compiled React app (served by Express).

## How to run
1.  **Install all dependencies**:
    ```bash
    npm run install-all
    ```
2.  **Build the React client**:
    ```bash
    npm run build-client
    ```
3.  **Start the monolith**:
    ```bash
    npm start
    ```
The entire system will be accessible on `http://localhost:4000`.

## Testing with PWA
- Start the backend monolith.
- Use LocalTunnel or Ngrok on port 4000.
- Update your PWA's `API_BASE_URL` in `app.js` to point to the secure tunnel address.
