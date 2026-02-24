import axios from 'axios';

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : `https://api.sahakarstree.com/api`;

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE INTERCEPTOR: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is expired or invalid, force logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to home
    }
    return Promise.reject(error);
  }
);

export default apiClient;