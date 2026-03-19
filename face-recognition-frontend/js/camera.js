/**
 * camera.js - Reusable Camera Module
 * Handles webcam access, frame capture, and stream management.
 */

const CameraModule = (() => {
    let videoStream = null;

    /**
     * Starts the camera and pipes the stream to a video element
     * @param {HTMLVideoElement} videoElement 
     * @returns {Promise<boolean>}
     */
    const startCamera = async (videoElement) => {
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user" // Use front camera on mobile
            },
            audio: false
        };

        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Your browser does not support camera access.");
            }

            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = videoStream;
            
            // Wait for video to be ready
            return new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve(true);
                };
            });
        } catch (err) {
            console.error("Camera access error:", err);
            if (err.name === "NotAllowedError") {
                throw new Error("Camera permission denied. Please enable it in browser settings.");
            } else if (err.name === "NotFoundError") {
                throw new Error("No camera found on this device.");
            } else {
                throw err;
            }
        }
    };

    /**
     * Captures a frame from the video element and returns it as a Blob
     * @param {HTMLVideoElement} videoElement 
     * @param {HTMLCanvasElement} canvasElement 
     * @returns {Promise<Blob>}
     */
    const captureFrame = (videoElement, canvasElement) => {
        return new Promise((resolve) => {
            const context = canvasElement.getContext('2d');
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            
            // Draw current video frame to canvas
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            
            // Convert canvas content to Blob
            canvasElement.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    };

    /**
     * Stops the active camera stream
     */
    const stopCamera = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
            console.log("Camera stopped.");
        }
    };

    return {
        startCamera,
        captureFrame,
        stopCamera
    };
})();
