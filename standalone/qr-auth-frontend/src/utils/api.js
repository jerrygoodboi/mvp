import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptor to add Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Generates a new QR code session
 * @returns {Promise<Object>} The session ID and QR code image (base64)
 */
export const generateQR = async () => {
  try {
    const response = await api.post('/auth/generate-qr');
    return response.data;
  } catch (error) {
    console.error('API Error: generateQR', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

/**
 * Validates the current stored JWT token
 * @returns {Promise<Object>} User details if valid
 */
export const validateToken = async () => {
  try {
    const response = await api.get('/auth/validate');
    return response.data;
  } catch (error) {
    console.error('API Error: validateToken', error);
    throw error.response ? error.response.data : new Error('Token validation failed');
  }
};

export default api;
