import { useState, useEffect, useCallback } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/socket`;

/**
 * Custom hook to manage WebSocket connection for authentication
 * @param {Function} onAuthenticated - Callback when 'authenticated' event is received
 * @returns {Object} Connection status and socket instance
 */
const useWebSocket = (onAuthenticated) => {
  const [status, setStatus] = useState('connecting');
  const [socket, setSocket] = useState(null);

  const connect = useCallback(() => {
    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket Message:', data);
        
        if (data.event === 'authenticated') {
          console.log('Authentication event received!');
          // Handle the successful scan/authentication
          if (onAuthenticated) {
            onAuthenticated(data);
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected. Reconnecting in 3s...');
      setStatus('disconnected');
      // Attempt to reconnect after a short delay
      setTimeout(() => connect(), 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setStatus('error');
    };

    setSocket(ws);
  }, [onAuthenticated]);

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return { status, socket };
};

export default useWebSocket;
