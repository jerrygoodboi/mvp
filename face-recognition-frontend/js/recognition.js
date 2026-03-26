/**
 * recognition.js - Face Recognition Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('photo-canvas');
    const placeholder = document.getElementById('camera-placeholder');
    const statusMsg = document.getElementById('status-message');
    const successOverlay = document.getElementById('success-overlay');
    const resultArea = document.getElementById('result-area');
    const historyList = document.getElementById('history-list');

    // Display fields
    const userNameEl = document.getElementById('user-name');
    const userIdEl = document.getElementById('user-id');
    const confidenceEl = document.getElementById('confidence-score');

    // Buttons
    const startBtn = document.getElementById('start-recognition-btn');
    const recognizeBtn = document.getElementById('recognize-btn');
    const retryBtn = document.getElementById('retry-btn');

    /**
     * Initialize History
     */
    updateHistory();

    /**
     * Step 1: Start Camera for Recognition
     */
    startBtn.addEventListener('click', async () => {
        try {
            await CameraModule.startCamera(video);
            
            // UI Toggle
            video.classList.remove('hidden');
            placeholder.classList.add('hidden');
            startBtn.classList.add('hidden');
            recognizeBtn.classList.remove('hidden');
            hideStatus();
        } catch (err) {
            showStatus(err.message, "error");
        }
    });

    /**
     * Step 2: Perform Recognition
     */
    recognizeBtn.addEventListener('click', async () => {
        try {
            showStatus("Analyzing facial features...", "info");
            recognizeBtn.disabled = true;

            const blob = await CameraModule.captureFrame(video, canvas);
            const result = await recognizeFace(blob);

            if (result.match) {
                handleSuccess(result.user);
            } else {
                handleFailure("No matching profile found. Please enroll first.");
            }
        } catch (err) {
            handleFailure(err.message || "Recognition service unavailable.");
        } finally {
            recognizeBtn.disabled = false;
        }
    });

    /**
     * Handle Successful Recognition
     */
    function handleSuccess(user) {
        CameraModule.stopCamera();
        
        // Update UI
        userNameEl.textContent = user.name;
        userIdEl.textContent = `ID: ${user.studentId}`;
        confidenceEl.textContent = `${(user.confidence * 100).toFixed(1)}%`;
        
        video.classList.add('hidden');
        recognizeBtn.classList.add('hidden');
        successOverlay.classList.remove('hidden');
        resultArea.classList.remove('hidden');
        
        showStatus("Identity Confirmed! Launching OS environment...", "success");
        
        // In a real lab environment, this would call a shell command to switch users
        console.log(`System Command: sudo login -u ${user.studentId}`);
        
        updateHistory();
    }

    /**
     * Handle Recognition Failure
     */
    function handleFailure(msg) {
        showStatus(msg, "error");
        recognizeBtn.classList.add('hidden');
        retryBtn.classList.remove('hidden');
    }

    /**
     * Retry Logic
     */
    retryBtn.addEventListener('click', async () => {
        retryBtn.classList.add('hidden');
        recognizeBtn.classList.remove('hidden');
        hideStatus();
        // Camera stays on unless stopped
    });

    /**
     * API Call: Recognize Face
     */
    async function recognizeFace(blob) {
        const formData = new FormData();
        formData.append('faceImage', blob, 'recognition.jpg');

        const response = await fetch('http://10.138.24.4:4000/api/face/recognize', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || "Recognition failed.");
        }

        return result;
    }

    /**
     * Update Access History
     */
    async function updateHistory() {
        try {
            const response = await fetch('http://10.138.24.4:4000/api/face/history');
            const data = await response.json();

            if (data.length === 0) {
                historyList.innerHTML = '<li class="loading-item">No access logs found.</li>';
                return;
            }

            historyList.innerHTML = data.map(item => `
                <li>
                    <span><strong>${item.name || 'Unknown'}</strong> (${item.student_id || 'N/A'})</span>
                    <span class="${item.status === 'SUCCESS' ? 'text-success' : 'text-error'}">
                        ${new Date(item.timestamp).toLocaleTimeString()} - ${item.status}
                    </span>
                </li>
            `).join('');
        } catch (err) {
            console.error("Failed to load history", err);
            historyList.innerHTML = '<li class="loading-item text-error">Failed to load logs.</li>';
        }
    }

    /**
     * UI Helpers
     */
    function showStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = `status-msg ${type}`;
        statusMsg.classList.remove('hidden');
    }

    function hideStatus() {
        statusMsg.classList.add('hidden');
    }
});
