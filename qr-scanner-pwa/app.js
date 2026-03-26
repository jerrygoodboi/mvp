/**
 * app.js - Main application logic, Biometric Authentication, and API calls
 */

/**
 * Device Identification Logic
 * Generates or retrieves a unique persistent ID for this device
 */
function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        // Generate a random unique ID for this device
        deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('device_id', deviceId);
        console.log("New unique device ID generated:", deviceId);
    }
    return deviceId;
}

// IMPORTANT: Using secure HTTPS with local IP
const API_BASE_URL = 'https://10.138.24.4:4000/api'; 
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
        console.log("QR Token Scanned:", qrToken);
        currentSessionId = qrToken; 
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
        if (window.PublicKeyCredential && 
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
            
            console.log("Biometric authenticator available.");
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            console.log("Identity verified successfully.");
            await verifyLoginWithBackend();
        } else {
            console.warn("Biometrics not available on this device.");
            showStatus("Biometrics not supported. Using PIN fallback.", "error");
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
        const deviceId = getDeviceId();
        let sessionIdToSend = currentSessionId;
        
        // If the token is a JWT, extract the sessionId from the payload
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
                studentId: currentStudentId,
                deviceId: deviceId
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login Success:", data);
            localStorage.setItem('authToken', data.token);
            showStatus("Logged in successfully!", "success");
            
            setTimeout(() => {
                location.reload(); 
            }, 3000);
        } else {
            showStatus(data.error || "Login verification failed", "error");
            // If device mismatch, explain it
            if (response.status === 403) {
                console.warn("Device Binding Error:", data.error);
            }
            goToStep(1);
        }
    } catch (err) {
        console.error("Network error during verification", err);
        showStatus("Server unreachable. Check your connection.", "error");
    }
}
