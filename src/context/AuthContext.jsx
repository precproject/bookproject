import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Define logout here so we can use it in the event listener
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/'; 
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await apiClient.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.warn("Session expired or token invalid. Clearing memory.");
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    fetchUser();

    // ---> CRITICAL FIX: Listen for Axios telling us the token died <---
    const handleUnauthorized = () => {
      console.warn("Axios detected expired token. Logging out via Context.");
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);

    // Cleanup listener when app unmounts
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthModalOpen(false); 
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, loading, 
      isAuthModalOpen, openAuthModal, closeAuthModal 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};