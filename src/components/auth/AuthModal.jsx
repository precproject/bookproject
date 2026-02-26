import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Phone, Loader2, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../ui/Button'; 
import apiClient from '../../api/client';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useContext(AuthContext);
  
  // Flow State: 'identify' (enter email/phone) -> 'register' (if not found)
  const [authStep, setAuthStep] = useState('identify'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Single input for the first step
  const [identifier, setIdentifier] = useState('');

  // Form State for new users
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: ''
  });

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // STEP 1: Attempt to Login Instantly
  const handleIdentify = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      // Ask backend to log this person in based purely on their email or phone
      const { data } = await apiClient.post('/auth/instant-login', { identifier });
      
      // If successful, they exist! Log them in immediately.
      login(data.user || data, data.token); 
      
    } catch (err) {
      // If the backend returns a 404 (Not Found), it means they are a new user.
      if (err.response?.status === 404) {
        // Pre-fill the form based on what they typed
        const isEmail = identifier.includes('@');
        setFormData({
          name: '',
          email: isEmail ? identifier : '',
          mobile: !isEmail ? identifier : ''
        });
        setAuthStep('register'); // Move to registration step
      } else {
        setError(err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Register New User & Login Instantly
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the new user. (Backend should auto-generate a dummy password for them)
      const { data } = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: Math.random().toString(36).slice(-10) + 'A1!' // Dummy password
      });
      
      // Log them in instantly upon successful registration
      login(data.user || data, data.token); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // Reset modal state on close
  const handleClose = () => {
    setAuthStep('identify');
    setIdentifier('');
    setFormData({ name: '', email: '', mobile: '' });
    setError('');
    closeAuthModal();
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-6 sm:p-8">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="text-center mb-8 mt-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-serif">
                  {authStep === 'identify' ? 'Quick Checkout' : 'Almost There!'}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
                  {authStep === 'identify' 
                    ? 'Enter your email or mobile number to continue.' 
                    : 'We just need a couple more details to complete your profile.'}
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800/50 text-center font-medium">
                  {error}
                </motion.div>
              )}

              {/* STEP 1: IDENTIFY (Login Attempt) */}
              {authStep === 'identify' && (
                <motion.form key="identify-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleIdentify} className="space-y-4">
                  <div className="relative">
                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" name="identifier" placeholder="Email or Mobile Number" required 
                      value={identifier} onChange={handleIdentifierChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <Button variant="primary" type="submit" className="w-full py-4 text-lg font-bold mt-4 rounded-2xl flex justify-center items-center gap-2" disabled={loading || !identifier}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
                  </Button>
                </motion.form>
              )}

              {/* STEP 2: REGISTER (If Not Found) */}
              {authStep === 'register' && (
                <motion.form key="register-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleRegister} className="space-y-4">
                  <div className="relative">
                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" name="name" placeholder="Full Name" required 
                      value={formData.name} onChange={handleFormChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" name="email" placeholder="Email Address" required 
                      value={formData.email} onChange={handleFormChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" name="mobile" placeholder="Mobile Number" required 
                      value={formData.mobile} onChange={handleFormChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <Button variant="primary" type="submit" className="w-full py-4 text-lg font-bold mt-4 rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30" disabled={loading}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Complete & Checkout'}
                  </Button>
                  <button type="button" onClick={() => setAuthStep('identify')} className="w-full text-center text-sm text-slate-500 hover:text-orange-600 mt-4 font-medium">
                    Go Back
                  </button>
                </motion.form>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};