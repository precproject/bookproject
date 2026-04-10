import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, BellRing, CheckCircle2, Loader2, Info, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { AuthContext } from '../../context/AuthContext'; 
import bookCoverImg from '../../assets/cover.png'; 

export const PrebookModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { login, user } = useContext(AuthContext); 

  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState('idle'); 
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
      // Hit our smart endpoint
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
      // TRANSLATION APPLIED TO ERROR FALLBACK
      setErrorMessage(error.response?.data?.message || t('prebook.errorFallback', 'Something went wrong. Please try again.'));
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
          
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* MODAL CARD: max-w-4xl to accommodate the split layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-4xl max-h-[95vh] flex flex-col md:flex-row glass-card bg-white/95 dark:bg-slate-900/95 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
          >
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors z-20 backdrop-blur-md"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* --- LEFT SIDE / TOP BANNER (VISUALS) --- */}
            <div className="w-full md:w-5/12 bg-gradient-to-br from-orange-500 to-amber-500 p-6 md:p-8 flex flex-row md:flex-col items-center justify-center relative overflow-hidden gap-4 md:gap-8 shrink-0">
              {/* Texture overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10 w-24 sm:w-32 md:w-48 lg:w-56 drop-shadow-2xl group shrink-0">
                <img 
                  src={bookCoverImg} 
                  alt="Book Cover" 
                  className="w-full h-auto rounded-r-lg md:rounded-r-xl border-l-2 md:border-l-4 border-slate-200/50 transform transition-transform duration-700 group-hover:scale-105 group-hover:rotate-2"
                />
              </div>

              <div className="relative z-10 text-left md:text-center text-white flex-1 md:flex-none">
                <div className="flex justify-start md:justify-center gap-1 text-yellow-300 mb-1 md:mb-2 drop-shadow-md">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="md:w-4 md:h-4" fill="currentColor" />)}
                </div>
                <h4 className="font-rozha text-xl md:text-2xl lg:text-3xl drop-shadow-md leading-tight">
                  {t('mainHero.titlePart2', 'चिंतनातून चिंतामुक्तीकडे')}
                </h4>
              </div>
            </div>

            {/* --- RIGHT SIDE / BOTTOM (FORM) --- */}
            <div className="w-full md:w-7/12 p-6 md:p-8 lg:p-10 overflow-y-auto hide-scrollbar flex items-center justify-center">
              <div className="w-full max-w-sm mx-auto">
              
                {/* --- ALREADY PREBOOKED STATE --- */}
                {status === 'already_prebooked' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 md:py-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
                      <Info className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-rozha text-2xl md:text-3xl text-slate-900 dark:text-white mb-3">
                      {t('prebook.alreadyTitle', "You're Already on the List!")}
                    </h3>
                    <p className="font-mukta text-slate-600 dark:text-slate-400 text-sm md:text-lg">
                      {t('prebook.alreadyDesc', "Don't worry, your spot is secured. We will notify you the moment the book is available!")}
                    </p>
                    <button onClick={handleClose} className="mt-6 md:mt-8 px-8 py-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      {t('prebook.gotItBtn', 'Got it, thanks!')}
                    </button>
                  </motion.div>

                ) : status === 'success' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 md:py-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-rozha text-2xl md:text-3xl text-slate-900 dark:text-white mb-3">
                      {t('prebook.successTitle', 'Thank You!')}
                    </h3>
                    <p className="font-mukta text-slate-600 dark:text-slate-400 text-sm md:text-lg">
                      {t('prebook.successDesc', 'You are on the list. We will notify you the moment the book is available.')}
                    </p>
                    <button onClick={handleClose} className="mt-6 md:mt-8 px-8 py-3 w-full rounded-full border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {t('prebook.closeBtn', 'Close')}
                    </button>
                  </motion.div>

                /* --- FORM STATE --- */
                ) : (
                  <>
                    <div className="text-center mb-6 md:mb-8">
                      <h3 className="font-rozha text-2xl md:text-3xl text-slate-900 dark:text-white mb-2 leading-tight">
                        {t('prebook.title', 'Secure Your Copy')}
                      </h3>
                      <p className="font-mukta text-slate-600 dark:text-slate-400 text-sm md:text-[15px] leading-snug">
                        {t('prebook.subtitle', 'Register now to get alerted via SMS and Email as soon as we launch.')}
                      </p>
                    </div>

                    {status === 'error' && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-medium border border-red-100 dark:border-red-800/50">
                        {errorMessage}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      
                      {/* NAME FIELD */}
                      <div>
                        <label className="block text-[11px] font-black font-mukta text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">
                          {t('prebook.nameLabel', 'Full Name')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <User size={18} />
                          </div>
                          <input 
                            type="text" name="name" required value={formData.name} onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:text-white transition-all text-[15px]"
                            placeholder={t('prebook.namePlaceholder', 'Enter your Full Name')}
                          />
                        </div>
                      </div>

                      {/* PHONE FIELD */}
                      <div>
                        <label className="block text-[11px] font-black font-mukta text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">
                          {t('prebook.phoneLabel', 'WhatsApp / Phone Number')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Phone size={18} />
                          </div>
                          <input 
                            type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:text-white transition-all text-[15px]"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                      </div>

                      {/* EMAIL FIELD */}
                      <div>
                        <label className="block text-[11px] font-black font-mukta text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">
                          {t('prebook.emailLabel', 'Email Address')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Mail size={18} />
                          </div>
                          <input 
                            type="email" name="email" required value={formData.email} onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:text-white transition-all text-[15px]"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      {/* SUBMIT BUTTON */}
                      <button 
                        type="submit" disabled={status === 'loading'}
                        className="relative overflow-hidden w-full py-3.5 md:py-4 mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-base md:text-lg shadow-[0_8px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-1 active:scale-[0.98] flex justify-center items-center group disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {status === 'loading' ? (
                          <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" />
                        ) : (
                          <span className="relative z-10 flex items-center gap-2">
                            <BellRing size={18} className="group-hover:rotate-12 transition-transform md:w-5 md:h-5" />
                            {t('prebook.submitBtn', 'Notify Me')}
                          </span>
                        )}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                      </button>

                    </form>
                  </>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};