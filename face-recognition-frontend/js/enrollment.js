/**
 * enrollment.js - Face Enrollment Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('enrollment-form');
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('photo-canvas');
    const imgPreview = document.getElementById('captured-preview');
    const placeholder = document.getElementById('camera-placeholder');
    const statusMsg = document.getElementById('status-message');

    // Buttons
    const startBtn = document.getElementById('start-camera-btn');
    const captureBtn = document.getElementById('capture-photo-btn');
    const retakeBtn = document.getElementById('retake-photo-btn');
    const enrollBtn = document.getElementById('enroll-btn');

    let capturedBlob = null;

    /**
     * Step 1: Start Camera
     */
    startBtn.addEventListener('click', async () => {
        try {
            showStatus("Requesting camera access...", "info");
            await CameraModule.startCamera(video);
            
            // UI Toggle
            video.classList.remove('hidden');
            placeholder.classList.add('hidden');
            startBtn.classList.add('hidden');
            captureBtn.classList.remove('hidden');
            hideStatus();
        } catch (err) {
            showStatus(err.message, "error");
        }
    });

    /**
     * Step 2: Capture Frame
     */
    captureBtn.addEventListener('click', async () => {
        capturedBlob = await CameraModule.captureFrame(video, canvas);
        
        // Show preview image
        const url = URL.createObjectURL(capturedBlob);
        imgPreview.src = url;
        
        // UI Toggle
        video.classList.add('hidden');
        imgPreview.classList.remove('hidden');
        captureBtn.classList.add('hidden');
        retakeBtn.classList.remove('hidden');
        enrollBtn.classList.remove('hidden');
        
        CameraModule.stopCamera();
    });

    /**
     * Step 3: Retake Photo
     */
    retakeBtn.addEventListener('click', async () => {
        imgPreview.classList.add('hidden');
        retakeBtn.classList.add('hidden');
        enrollBtn.classList.add('hidden');
        
        // Restart camera
        await CameraModule.startCamera(video);
        video.classList.remove('hidden');
        captureBtn.classList.remove('hidden');
    });

    /**
     * Step 4: Submit Enrollment
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!capturedBlob) {
            showStatus("Please capture a photo first.", "error");
            return;
        }

        const studentId = document.getElementById('student-id').value;
        const name = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;

        try {
            showStatus("Enrolling face. Please wait...", "info");
            enrollBtn.disabled = true;

            const response = await enrollFace(studentId, name, email, capturedBlob);
            
            showStatus("Enrollment Successful! You can now log into any lab computer.", "success");
            form.reset();
            resetUI();
        } catch (err) {
            showStatus(err.message || "Enrollment failed. Try again.", "error");
            enrollBtn.disabled = false;
        }
    });

    /**
     * API Call: Enroll Face
     */
    async function enrollFace(studentId, name, email, blob) {
        const formData = new FormData();
        formData.append('studentId', studentId);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('faceImage', blob, `${studentId}.jpg`);

        const response = await fetch('http://10.184.58.4:4000/api/face/enroll', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || "Enrollment failed.");
        }

        return result;
    }

    /**
     * UI Helper Functions
     */
    function showStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = `status-msg ${type}`;
        statusMsg.classList.remove('hidden');
    }

    function hideStatus() {
        statusMsg.classList.add('hidden');
    }

    function resetUI() {
        imgPreview.classList.add('hidden');
        retakeBtn.classList.add('hidden');
        enrollBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        placeholder.classList.remove('hidden');
        enrollBtn.disabled = false;
        capturedBlob = null;
    }
});
