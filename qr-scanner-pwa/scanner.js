/**
 * scanner.js - Handles QR Code scanning logic using html5-qrcode
 */

let html5QrCode;
const scannerElementId = "reader";

/**
 * Initializes and starts the QR scanner
 * @param {Function} onScanSuccess - Callback function when a QR code is scanned
 */
async function startScanner(onScanSuccess) {
    // Show step 2 (Scanner)
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.add('active');

    html5QrCode = new Html5Qrcode(scannerElementId);
    
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    try {
        await html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText) => {
                console.log(`Code matched = ${decodedText}`);
                stopScanner();
                onScanSuccess(decodedText);
            },
            (errorMessage) => {
                // parse error, ignore it.
            }
        );
    } catch (err) {
        console.error("Unable to start scanning.", err);
        showStatus("Camera access denied or error occurred.", "error");
        goToStep(1);
    }
}

/**
 * Stops the QR scanner and releases the camera
 */
async function stopScanner() {
    if (html5QrCode) {
        try {
            await html5QrCode.stop();
            console.log("Scanner stopped.");
        } catch (err) {
            console.error("Error stopping scanner.", err);
        }
    }
}

// Global UI helper
function goToStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepNumber}`).classList.add('active');
}

function showStatus(message, type = "success") {
    const statusEl = document.getElementById('status-msg');
    statusEl.textContent = message;
    statusEl.className = `status-msg ${type}`;
    statusEl.classList.remove('hidden');
    
    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 4000);
}

function toggleLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) overlay.classList.remove('hidden');
    else overlay.classList.add('hidden');
}
