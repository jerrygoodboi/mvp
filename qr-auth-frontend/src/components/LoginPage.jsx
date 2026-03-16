import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRDisplay from './QRDisplay';
import useWebSocket from '../hooks/useWebSocket';
import { generateQR } from '../utils/api';

/**
 * LoginPage component for QR-based authentication
 */
const LoginPage = () => {
  const [qrCode, setQrCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();

  const fetchQR = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await generateQR();
      setQrCode(data.qrCode);
      setSessionId(data.sessionId);
      setTimeLeft(60);
      console.log('New QR generated:', data.sessionId);
    } catch (err) {
      setError('Failed to load QR code. Please refresh.');
      console.error('Fetch QR Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = useCallback((data) => {
    console.log('Successfully authenticated via WebSocket!', data);
    // Note: The verify-qr endpoint returns a token, which should be stored.
    // However, the WebSocket event might not contain the token for security reasons,
    // Or it might be sent as a separate API call from the app side.
    // For this demonstration, we'll assume the client app (phone) handles verification,
    // and the backend notifies us. Usually, the web client would either get the token via WS
    // (if using a secure channel) or poll. Here, we'll wait for the next step.
    
    // Check if the event matches the current session
    if (data.sessionId === sessionId) {
       // Since the backend 'authenticated' event doesn't currently include a token,
       // a real implementation would either include the token in the event OR the web client
       // would poll for status once notified. For simplicity in this demo, we'll assume
       // the token is somehow provided or the user navigates.
       // Let's modify the backend later if needed. For now, we'll use user info.
       localStorage.setItem('user', JSON.stringify(data.studentInfo));
       // In a real scenario, you'd also save the JWT token here if provided.
       navigate('/dashboard');
    }
  }, [sessionId, navigate]);

  useWebSocket(handleAuthenticated);

  // Auto-refresh QR code every 60 seconds
  useEffect(() => {
    fetchQR();
    const interval = setInterval(() => {
      fetchQR();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchQR]);

  // Countdown timer for user feedback
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-navy-dark">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Welcome Back
          </h1>
          <p className="mt-4 text-slate-400 text-lg">
            Scan with your mobile device to access the portal.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-center">
            {error}
            <button 
              onClick={fetchQR}
              className="ml-2 underline hover:text-white"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="flex flex-col items-center">
          <QRDisplay qrCode={qrCode} isLoading={loading} />
          
          <div className="mt-8 flex items-center space-x-3 text-slate-400">
            <div className="h-2 w-2 bg-teal-light rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">
              QR refreshes in <span className="text-teal-light">{timeLeft}s</span>
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center space-x-6 grayscale opacity-50">
          {/* Mockup icons for App Store/Play Store */}
          <div className="h-10 w-32 bg-slate-800 rounded-lg border border-slate-700"></div>
          <div className="h-10 w-32 bg-slate-800 rounded-lg border border-slate-700"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
