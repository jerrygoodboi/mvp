import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

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
    const adminToken = localStorage.getItem('adminToken');
    
    // Prioritize adminToken for admin routes, otherwise use standard token
    if (config.url.includes('/admin') && adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
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

/**
 * Admin API functions
 */
export const adminLogin = async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
};

export const fetchStudents = async () => {
    const response = await api.get('/admin/students');
    return response.data;
};

export const addStudent = async (studentData) => {
    const response = await api.post('/admin/students', studentData);
    return response.data;
};

export const updateStudent = async (id, studentData) => {
    const response = await api.put(`/admin/students/${id}`, studentData);
    return response.data;
};

export const unbindDevice = async (studentId) => {
    const response = await api.post('/admin/students/unbind', { studentId });
    return response.data;
};

export const deleteStudent = async (studentId) => {
    const response = await api.delete(`/admin/students/${studentId}`);
    return response.data;
};

export const fetchHistory = async () => {
    const response = await api.get('/admin/history');
    return response.data;
};

export const fetchSessions = async () => {
    const response = await api.get('/admin/sessions');
    return response.data;
};

export default api;
