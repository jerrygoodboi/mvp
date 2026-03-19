# Face Recognition Portal - Campus Lab OS

A modern, vanilla JavaScript web interface for face enrollment and recognition, designed to enable personalized OS profile loading in computer labs.

## Features
- **Face Enrollment**: Capture student details and a facial photo.
- **System Recognition**: Identify students via webcam to trigger system actions (e.g., loading Linux profiles).
- **Secure Camera Access**: Handles permissions and device management.
- **Teal Design System**: Responsive and accessible UI.

## How to Use

### 1. Enrollment
1. Open `enrollment.html` in a modern browser.
2. Fill in the Student ID, Name, and Email.
3. Click **Start Camera** and allow webcam access.
4. Align your face in the preview and click **Capture Photo**.
5. If satisfied, click **Enroll Face** to save your profile.

### 2. Recognition
1. Open `recognition.html`.
2. Click **Start Recognition**.
3. Click **Recognize Me** while looking at the camera.
4. Upon success, the system will verify your identity and simulate loading your Linux home directory.

## Technical Details
- **Vanilla JS**: No build tools or frameworks required.
- **MediaDevices API**: Uses `navigator.mediaDevices.getUserMedia` for high-quality video.
- **Canvas API**: Captures frames for backend processing.
- **CSS3 Animations**: Provides smooth transitions and success feedback.

## Lab Integration (The Hook)
This frontend is designed to be the interface for a lab-wide identity system. On successful recognition, the `handleSuccess` function in `recognition.js` can be modified to:
1. Call a local PAM module or custom script.
2. Mount a network drive (NFS/SMB) containing the student's home directory.
3. Launch a specific desktop environment session.

## Browser Compatibility
- **Chrome/Edge**: Fully Supported (Recommended).
- **Firefox**: Fully Supported.
- **Safari**: Supported (Requires user interaction to start video).

## Troubleshooting Camera Issues
- **Permission Denied**: Ensure you are using `https://` or `localhost`. Browsers block cameras on insecure origins.
- **Not Found**: Check if another application is using the webcam.
- **Fuzzy Image**: Ensure good lighting and clean the lens.
