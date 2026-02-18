import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';

export const PurchaseAlert = () => {
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Simulated list of recent purchasers
  const purchaseData = [
    { name: "Rahul P.", location: "Pune", time: "2 hours ago" },
    { name: "Sneha D.", location: "Mumbai", time: "45 mins ago" },
    { name: "Amit K.", location: "Nashik", time: "5 hours ago" },
    { name: "Priya S.", location: "Aurangabad", time: "10 mins ago" },
    { name: "Vikram T.", location: "Kolhapur", time: "3 hours ago" }
  ];

  useEffect(() => {
    // Initial delay before first popup
    const startTimeout = setTimeout(() => {
      showNextPurchase();
    }, 5000);

    const showNextPurchase = () => {
      const randomIndex = Math.floor(Math.random() * purchaseData.length);
      setCurrentPurchase(purchaseData[randomIndex]);
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
        // Wait 10 seconds before showing the next one
        setTimeout(showNextPurchase, 5000);
      }, 5000);
    };

    return () => clearTimeout(startTimeout);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ opacity: 0, x: -50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed bottom-6 left-6 z-[100] flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 max-w-sm"
        >
          {/* Circular Icon/Image placeholder */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-500">
              <ShoppingBag size={20} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900">
              <CheckCircle size={10} fill="currentColor" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col pr-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {currentPurchase.name} <span className="font-normal text-slate-500">from</span> {currentPurchase.location}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Recently purchased <span className="font-semibold text-orange-600 dark:text-orange-500">चिंतामुक्ती</span>
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
              {currentPurchase.time}
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};