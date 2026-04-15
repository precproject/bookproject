import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// 1. Create the Context
const ToastContext = createContext();

// 2. Create the Provider Component
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ active: false, message: '', type: 'success' });

  // useCallback prevents unnecessary re-renders when this function is passed down
  const showToast = useCallback((message, type = 'success') => {
    setToast({ active: true, message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, active: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* 3. Render the Toast globally here! */}
      <AnimatePresence>
        {toast.active && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`fixed top-24 right-6 px-6 py-3.5 rounded-xl shadow-2xl z-[9999] flex items-center gap-3 border ${
              toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 
              toast.type === 'warning' ? 'bg-yellow-500 border-yellow-400 text-slate-900' : 
              'bg-slate-900 border-slate-700 text-white dark:bg-white dark:border-slate-200 dark:text-slate-900'
            }`}
          >
            {/* Dynamic Icons based on type */}
            {toast.type === 'error' && <XCircle size={18} />}
            {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400 dark:text-emerald-600" />}
            {toast.type === 'warning' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

// 4. Create a custom hook so other components can easily use it
export const useToast = () => useContext(ToastContext);