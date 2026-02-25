import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('chintamukti_token');
      if (token) {
        try {
          // Verify token and fetch latest user profile
          const { data } = await apiClient.get('/auth/profile');
          setUser(data);
        } catch (error) {
          // If token is invalid/expired, clear it securely
          localStorage.removeItem('chintamukti_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('chintamukti_token', token);
    
    // Depending on your backend, user data might be nested (data.user) or flat (data)
    setUser(userData.user || userData); 
    setIsAuthModalOpen(false); // Close modal automatically on success
  };

  const logout = () => {
    localStorage.removeItem('chintamukti_token');
    setUser(null);
    window.location.href = '/'; // Hard reset to clear all states and redirect home
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, loading, 
      isAuthModalOpen, openAuthModal, closeAuthModal 
    }}>
      {/* Wait to render the app until we know if the user is logged in or not */}
      {!loading && children}
    </AuthContext.Provider>
  );
};