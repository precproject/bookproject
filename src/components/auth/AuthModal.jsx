import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../ui/Button'; 
import { authService } from '../../api/service/authService';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useContext(AuthContext);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Strongly prevents browser reload
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      let data;
      if (isLoginMode) {
        data = await authService.login({ email: formData.email, password: formData.password });
      } else {
        data = await authService.register(formData);
      }
      
      // Pass the entire response object and the token to context
      login(data, data.token); 
      // Note: closeAuthModal() is now handled cleanly inside context's login() function
      
    } catch (err) {
      // Safely extract the backend error message
      const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({ name: '', email: '', mobile: '', password: '' });
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop (Dark overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-6 sm:p-8">
              <button 
                onClick={closeAuthModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8 mt-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-serif">
                  {isLoginMode ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 mt-2">
                  {isLoginMode ? 'Enter your details to access your account.' : 'Join us to buy books and earn via referrals!'}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                  <>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" name="mobile" placeholder="Mobile Number" required value={formData.mobile} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>

                {/* Explicitly set type="submit" to catch the Enter key and trigger the form handler securely */}
                <Button variant="primary" type="submit" className="w-full py-4 text-lg font-bold mt-4 shadow-lg shadow-orange-500/30 rounded-2xl flex justify-center items-center gap-2" disabled={loading}>
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Create Account')}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm sm:text-base text-slate-500">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={toggleMode}
                  className="text-orange-600 font-bold hover:text-orange-700 transition-colors ml-1 focus:outline-none"
                >
                  {isLoginMode ? 'Register here' : 'Login here'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};