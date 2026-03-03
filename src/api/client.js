import axios from 'axios';

// Auto-detect if you are testing on your computer or running the live website
const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : `https://api.sahakarstree.com/api`;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach the membership card (Token) to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error happens while they are actively trying to log in or register, ignore it here
    const isAuthRoute = error.config && error.config.url.includes('/auth');

    // If the token is expired or invalid
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      // 1. Shred the expired card
      localStorage.removeItem('token');
      
      // 2. Only redirect them to the home page if they aren't already there!
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      } else {
        // If they are already on the home page, just refresh the page once so the screen updates
        window.location.reload();
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;