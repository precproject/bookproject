import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, BellRing, CheckCircle2, Loader2, Info, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { AuthContext } from '../../context/AuthContext'; 
import bookCoverImg from '../../assets/cover.png'; // Import the book cover

export const PrebookModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { login, user } = useContext(AuthContext); // <-- Grab login function

  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'already_prebooked'  | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Instantly check if user is already logged in AND prebooked
  useEffect(() => {
    if (isOpen) {
      if (user && user.isPrebooked) {
        setStatus('already_prebooked');
      } else {
        setStatus('idle');
        setFormData({
          name: user?.name || '', 
          phone: user?.mobile || '', 
          email: user?.email || ''
        });
      }
      setErrorMessage('');
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {

      // Hit our new smart endpoint
      const { data } = await apiClient.post('/auth/prebook', {
        name: formData.name,
        email: formData.email,
        mobile: formData.phone
      });

      // SILENT LOGIN: If backend handed us a token, log them in immediately!
      if (data.token && data.user) {
        login(data.user, data.token);
      }

      // Check if they were already on the list
      if (data.alreadyPrebooked) {
        setStatus('already_prebooked');
      } else {
        setStatus('success');
      }
      
    } catch (error) {
      console.error("Prebook failed", error);
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          
          {/* BACKDROP - Blurs the landing page behind it */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* MODAL CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-md glass-card bg-white/90 dark:bg-slate-900/90 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
          >
            {/* Modal Glow Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />

            {/* CLOSE BUTTON */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="p-6 md:p-8">
              
              {/* --- ALREADY PREBOOKED STATE --- */}
              {status === 'already_prebooked' ? (
                <>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                  <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                    <Info className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-rozha text-2xl md:text-3xl text-slate-900 dark:text-white mb-3">
                    You're Already on the List!
                  </h3>
                  <p className="font-mukta text-slate-600 dark:text-slate-400 text-lg">
                    Don't worry, your spot is secured. We will notify you the moment the book is available !
                  </p>
                  <button onClick={handleClose} className="mt-8 px-8 py-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Got it, thanks!
                  </button>
                </motion.div>

                {/* --- SUCCESS STATE --- */}
                </>
              ) : status === 'success' ? (
                /* SUCCESS STATE */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-rozha text-3xl text-slate-900 dark:text-white mb-3">
                    {t('prebook.successTitle', 'Thank You!')}
                  </h3>
                  <p className="font-mukta text-slate-600 dark:text-slate-400 text-lg">
                    {t('prebook.successDesc', 'You are on the list. We will notify you the moment the book is available.')}
                  </p>
                  <button 
                    onClick={handleClose}
                    className="mt-8 px-8 py-3 w-full rounded-full border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {t('prebook.closeBtn', 'Close')}
                  </button>
                </motion.div>
              ) : (
                /* FORM STATE */
                <>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-200 dark:border-orange-500/20 rotate-3">
                      <BellRing className="text-orange-600 dark:text-amber-500 w-6 h-6 -rotate-3" />
                    </div>
                    <h3 className="font-rozha text-2xl md:text-3xl  text-slate-900 dark:text-white mb-2 leading-tight">
                      {t('prebook.title', 'Secure Your Copy')}
                    </h3>
                    <p className="font-mukta text-slate-600 dark:text-slate-400 text-[14px] leading-snug">
                      {t('prebook.subtitle', 'Register now to get alerted via SMS and Email as soon as we launch.')}
                    </p>
                  </div>

                  {status === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-medium border border-red-100 dark:border-red-800/50">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* NAME FIELD */}
                    <div>
                      <label className="block text-xs font-black font-mukta text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        {t('prebook.nameLabel', 'Full Name')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User size={18} />
                        </div>
                        <input 
                          type="text" 
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:text-white transition-all"
                          placeholder={t('prebook.namePlaceholder', 'Enter your Full Name')}
                        />
                      </div>
                    </div>

                    {/* PHONE FIELD */}
                    <div>
                      <label className="block text-xs font-black font-mukta text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        {t('prebook.phoneLabel', 'WhatsApp / Phone Number')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Phone size={18} />
                        </div>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:text-white transition-all"
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>

                    {/* EMAIL FIELD */}
                    <div>
                      <label className="block text-xs font-black font-mukta text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        {t('prebook.emailLabel', 'Email Address')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Mail size={18} />
                        </div>
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:text-white transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button 
                      type="submit"
                      disabled={status === 'loading'}
                      className="relative overflow-hidden w-full py-4 mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg shadow-[0_8px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-1 active:scale-[0.98] flex justify-center items-center group disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="animate-spin w-6 h-6" />
                      ) : (
                        <span className="relative z-10 flex items-center gap-2">
                          <BellRing size={20} className="group-hover:rotate-12 transition-transform" />
                          {t('prebook.submitBtn', 'Notify Me')}
                        </span>
                      )}
                      {/* Glossy Hover Sweep */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    </button>

                  </form>
                </>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};