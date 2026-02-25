import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag, X } from 'lucide-react';
import apiClient from '../../api/client'; // Adjust path if necessary

// Utility to convert ISO date to "2 hours ago", "10 mins ago", etc.
const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " min" + (interval === 1 ? "" : "s") + " ago";
  
  return "Just now";
};

export const PurchaseAlert = () => {
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  
  // Use a ref to keep track of the current index without triggering re-renders
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

  // 2. Handle the display cycle once data is loaded
  useEffect(() => {
    if (purchaseData.length === 0) return;

    const showNextPurchase = () => {
      // Get current item and update time format dynamically
      const item = purchaseData[indexRef.current];
      setCurrentPurchase({
        name: item.name,
        location: item.location,
        time: getTimeAgo(item.timestamp)
      });
      
      setIsVisible(true);

      // Hide after 5 seconds
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        
        // Move to the next index, loop back to 0 if at the end
        indexRef.current = (indexRef.current + 1) % purchaseData.length;
        
        // Wait 10 seconds before showing the next one
        timerRef.current = setTimeout(showNextPurchase, 10000);
      }, 5000);
    };

    // Initial delay before first popup
    timerRef.current = setTimeout(showNextPurchase, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [purchaseData]);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ opacity: 0, x: -50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed bottom-6 left-6 z-[100] flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 max-w-sm"
        >
          {/* Circular Icon Placeholder */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-500">
              <ShoppingBag size={20} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900 shadow-sm">
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
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-medium">
              {currentPurchase.time}
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors p-1"
            aria-label="Close notification"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};