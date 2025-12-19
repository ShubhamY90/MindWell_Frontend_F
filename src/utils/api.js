// API configuration utility
const getApiBaseUrl = () => {
    // Check if we're in development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }
    // For production/deployed frontend, use the deployed backend
    return 'https://mindwell-backend-f.onrender.com';
  };
  
  export const API_BASE_URL = getApiBaseUrl();
  
  // Helper function to make API calls
  export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    
    return fetch(url, { ...defaultOptions, ...options });
  };
  
  export default API_BASE_URL;
  