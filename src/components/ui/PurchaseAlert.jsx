import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import apiClient from '../../api/client'; 

// Utility to convert ISO date to "2h ago", "10m ago", etc. (Shortened for modern UI)
const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h ago";
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "m ago";
  
  return "Just now";
};

export const PurchaseAlert = () => {
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // 1. Fetch data on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchPurchases = async () => {
      try {
        const { data } = await apiClient.get('/public/recent-purchases');
        if (isMounted && data && data.length > 0) {
          setPurchaseData(data);
        }
      } catch (error) {
        console.error("Failed to load recent purchases for alert", error);
      }
    };

    fetchPurchases();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Handle the 3-second display cycle
  useEffect(() => {
    if (purchaseData.length === 0) return;

    const showNextPurchase = () => {
      const item = purchaseData[indexRef.current];
      setCurrentPurchase({
        name: item.name,
        location: item.location,
        time: getTimeAgo(item.timestamp)
      });
      
      setIsVisible(true);

      // Hide strictly after 3 seconds
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        
        indexRef.current = (indexRef.current + 1) % purchaseData.length;
        
        // Wait 12 seconds before showing the next one to avoid spamming the user
        timerRef.current = setTimeout(showNextPurchase, 12000);
      }, 3000); 
    };

    // Initial delay before the very first popup (e.g., 5 seconds after page load)
    timerRef.current = setTimeout(showNextPurchase, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [purchaseData]);

  // Allow users to instantly dismiss it by tapping it
  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
          onClick={handleDismiss}
          className="fixed top-24 right-4 md:right-8 z-[100] flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 max-w-[90vw] md:max-w-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {/* Compact Modern Icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShoppingBag size={14} strokeWidth={2.5} />
          </div>

          {/* One/Two Liner Text Content */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug pr-2">
            <span className="font-bold text-slate-900 dark:text-white">{currentPurchase.name}</span> from {currentPurchase.location} bought <span className="font-bold text-orange-600 dark:text-orange-500">चिंतामुक्ती</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs ml-1.5 whitespace-nowrap hidden sm:inline-block">
              • {currentPurchase.time}
            </span>
          </p>

          {/* Time on a new line for very small mobile screens only */}
          <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:hidden absolute bottom-1.5 right-4">
            {currentPurchase.time}
          </span>
          
        </motion.div>
      )}
    </AnimatePresence>
  );
};