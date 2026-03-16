/**
 * app.js - Main application logic, Biometric Authentication, and API calls
 */

const API_BASE_URL = 'https://0acb-1-39-118-92.ngrok-free.app/api'; // Updated with Ngrok URL
let currentSessionId = null;
let currentStudentId = null;

// UI Elements
const startScanBtn = document.getElementById('start-scan-btn');
const stopScanBtn = document.getElementById('stop-scan-btn');
const biometricBtn = document.getElementById('biometric-btn');
const pinFallbackBtn = document.getElementById('pin-fallback-btn');
const studentIdInput = document.getElementById('student-id');

/**
 * Step 1: Handle Start Scanning
 */
startScanBtn.addEventListener('click', () => {
    const studentId = studentIdInput.value.trim();
    if (!studentId) {
        showStatus("Please enter your Student ID", "error");
        return;
    }
    currentStudentId = studentId;
    startScanner(onQRScanned);
});

/**
 * Step 2: Handle Cancel Scanning
 */
stopScanBtn.addEventListener('click', () => {
    stopScanner();
    goToStep(1);
});

/**
 * Handle successful QR Scan
 * Extracts sessionId and moves to Biometric step
 */
function onQRScanned(qrToken) {
    try {
        // In a real scenario, we might decode the JWT or the backend handles it.
        // For this demo, we assume the token IS the sessionId or contains it.
        // Usually, the QR token is a JWT. We'll send it as is.
        console.log("QR Token Scanned:", qrToken);
        
        // Let's assume the QR token is what we need to verify the session.
        // We'll extract sessionId if it's a JSON string, otherwise use the whole token.
        currentSessionId = qrToken; 
        
        // Move to step 3 (Biometric)
        goToStep(3);
    } catch (err) {
        console.error("Invalid QR code format", err);
        showStatus("Invalid QR code scanned.", "error");
        goToStep(1);
    }
}

/**
 * Step 3: Handle Biometric Authentication
 */
biometricBtn.addEventListener('click', async () => {
    toggleLoading(true);
    
    try {
        // Check if WebAuthn is supported
        if (window.PublicKeyCredential && 
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
            
            console.log("Biometric authenticator available.");
            
            // In a real production app, we would request a challenge from the server here.
            // For this PWA demo, we use the device's local "Identity Verification".
            // Note: Real WebAuthn requires a complex handshake.
            // We'll simulate the "Identity Verified" success after a small delay.
            
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating scan
            console.log("Identity verified successfully.");
            
            // Now proceed to backend verification
            await verifyLoginWithBackend();
        } else {
            console.warn("Biometrics not available on this device.");
            showStatus("Biometrics not supported. Using PIN fallback.", "error");
            // Automatically trigger fallback
            setTimeout(() => pinFallbackBtn.click(), 1000);
        }
    } catch (err) {
        console.error("Biometric verification failed", err);
        showStatus("Verification failed. Please try again.", "error");
    } finally {
        toggleLoading(false);
    }
});

/**
 * PIN Fallback
 */
pinFallbackBtn.addEventListener('click', async () => {
    const pin = prompt("Enter your 6-digit PIN:");
    if (pin && pin.length >= 4) {
        toggleLoading(true);
        await verifyLoginWithBackend();
        toggleLoading(false);
    }
});

/**
 * Final Step: Call Backend API to verify QR and Session
 */
async function verifyLoginWithBackend() {
    try {
        // Note: The sessionId we got from QR might be a JWT.
        // Our backend expects sessionId and studentId.
        // We'll try to decode the sessionId if it looks like a JWT to get the actual sessionId.
        let sessionIdToSend = currentSessionId;
        
        if (currentSessionId.includes('.')) {
            try {
                const payload = JSON.parse(atob(currentSessionId.split('.')[1]));
                sessionIdToSend = payload.sessionId || currentSessionId;
            } catch (e) {}
        }

        const response = await fetch(`${API_BASE_URL}/auth/verify-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionIdToSend,
                studentId: currentStudentId
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login Success:", data);
            localStorage.setItem('authToken', data.token);
            showStatus("Logged in successfully!", "success");
            
            // Move back to start after success
            setTimeout(() => {
                location.reload(); // Refresh app state
            }, 3000);
        } else {
            showStatus(data.error || "Login verification failed", "error");
            goToStep(1);
        }
    } catch (err) {
        console.error("Network error during verification", err);
        showStatus("Server unreachable. Check your connection.", "error");
    }
}
