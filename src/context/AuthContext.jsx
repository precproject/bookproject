import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify if the token is still alive and belongs to a valid user
          const { data } = await apiClient.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.warn("Session expired or token invalid. Clearing memory.");
          // Destroy the dead token from memory
          localStorage.removeItem('token');
          // Reset user state to trigger the logged-out UI
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthModalOpen(false); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/'; // Kick them back to the homepage
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