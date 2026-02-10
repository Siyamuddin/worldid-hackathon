import axios from 'axios';

// Use environment variable if set, otherwise detect from current location
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // If accessed via domain, use the domain (Cloudflare tunnel will route /api/* to backend)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}`;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Use participant token for all authenticated requests
  const participantToken = localStorage.getItem('participant_token');
  if (participantToken) {
    config.headers.Authorization = `Bearer ${participantToken}`;
  }
  return config;
});

export default api;
