// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Helper function for auth endpoints
export const getAuthUrl = (endpoint: string): string => {
  return getApiUrl(`/auth${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
};