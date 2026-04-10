import React, { useContext, useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, ChevronRight, ArrowDown, Loader2, ShoppingBag, BellRing } from 'lucide-react';

import bookCoverImg from '../../assets/cover.png';

import { CartContext } from '../../context/CartContext';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { captureAndVerifyReferral } from '../../utils/referralManager';
import { useTranslation } from 'react-i18next';
import { ConfigContext } from '../../context/ConfigContext';
import { PrebookModal } from '../shared/PrebookModal';

export const Hero = ({ onOrderPopup, productRoute }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { config } = useContext(ConfigContext); // <-- Consume Config

  const [referrerName, setReferrerName] = useState(null);  
  const [isAdding, setIsAdding] = useState(false);
  const [hasReferral, setHasReferral] = useState(false);
  const [isPrebookOpen, setIsPrebookOpen] = useState(false);

  const ref = useRef(null);

  const isPrebookActive = config?.shoppingRules?.isPrebookActive ?? true;
  const isReferralOnly = config?.shoppingRules?.referralBasedShoppingOnly ?? true;

  // Cinematic scroll effects
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const bookScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const checkReferral = async () => {
      const name = await captureAndVerifyReferral();
      if (name) {
        setReferrerName(name);
        setHasReferral(true); 
      }
    };
    checkReferral();
  }, []);

  const onOrderClick = async () => {
    setIsAdding(true);
    try {
      const response = await apiClient.get('/public/books');
      const physicalBook = response.data.find(book => book.type === 'Physical');

      if (physicalBook) {
        addToCart(physicalBook);
        navigate('/checkout');
      } else {
        alert(t('mainHero.outOfStock', "Sorry! The physical book is currently out of stock."));
      }
    } catch (error) {
      console.error("Failed to load book:", error);
      alert(t('mainHero.errorStore', "Something went wrong connecting to the store."));
    } finally {
      setIsAdding(false);
    }
  };

  const scrollToNext = () => {
    const nextSection = document.getElementById('features') || document.getElementById('about-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <section 
      ref={ref} 
      // Tightened top/bottom padding on mobile to keep the book in view
      className="relative min-h-[100svh] flex items-center pt-[90px] md:pt-32 pb-8 md:pb-16 overflow-hidden"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-amber-500/10 blur-3xl pointer-events-none" />

      <motion.div style={{ opacity }} className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Layout: Text first (top on mobile), Book second (bottom on mobile) */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
          
          {/* LEFT: TEXT CONTENT */}
          <motion.div 
            style={{ y: textY }} 
            className="w-full lg:w-1/2 space-y-5 md:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start z-20 order-1"
          >
            
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="px-4 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-[10px] md:text-xs font-mukta font-black uppercase tracking-widest border border-orange-200 dark:border-orange-800 shadow-sm">
                {t('mainHero.badge', 'सर्वाधिक विकले जाणारे पुस्तक')}
              </span>
              <div className="flex text-yellow-500 drop-shadow-sm">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" />)}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-rozha font-bold leading-[1.15]">
              <span className="text-4xl sm:text-5xl text-slate-900 dark:text-white lg:hidden">
                {t('mainHero.titlePart1', 'वारसा पराक्रमाचा,')}
              </span>
              <br className="lg:hidden" />
              <span className="gold-gradient-text drop-shadow-sm dark:drop-shadow-none text-[2.75rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[5.5rem] block mt-1 lg:mt-0">
               {t('mainHero.titlePart2', 'चिंतनातून चिंतामुक्तीकडे')}
              </span>
            </motion.h1>

            {/* Inspirational Quote Box */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="relative max-w-[90%] lg:max-w-xl mx-auto lg:mx-0 px-4 md:px-6 py-2 md:py-3 border-l-4 border-orange-500 bg-slate-200/50 dark:bg-slate-800/40 rounded-r-xl shadow-sm"
            >
              <p className="text-[13px] sm:text-lg text-slate-700 dark:text-slate-300 leading-snug md:leading-relaxed font-mukta font-medium italic text-left">
                {t('mainHero.quote', 'मराठा समाजाच्या खंबीर वृत्तीवर आधारित आर्थिक स्वातंत्र्य आणि व्यावसायिक यशाची आधुनिक ब्लूप्रिंट.')}
              </p>
            </motion.div>

            {/* BUTTON ROW - Forced single row on mobile with smaller sizes to fit */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }} 
              // Changed from flex-col to flex-row and w-full so they sit side-by-side
              className="flex flex-row items-stretch justify-center lg:justify-start gap-2 sm:gap-4 pt-2 md:pt-4 w-full"
            >
              
              {isPrebookActive ? (
                  /* --- PREBOOK MODE BUTTONS --- */
                  <button
                  onClick={() => setIsPrebookOpen(true)}
                  className="relative overflow-hidden group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-[#FF5A36] text-white rounded-full font-bold text-lg shadow-[0_10px_30px_rgba(255,90,54,0.3)] hover:shadow-[0_15px_40px_rgba(255,90,54,0.5)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 border border-orange-400/50 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <BellRing size={20} className="group-hover:rotate-12 transition-transform" /> 
                    {t('mainHero.prebookBtn', 'प्री-बुक करा')}
                  </span>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </button>
              ) : (
                (!isReferralOnly || (isReferralOnly && hasReferral && referrerName)) && (
                  <>
                  {/* PRIMARY ACTION */}
                  <button 
                    onClick={productRoute}
                    disabled={isAdding}
                    // Used flex-1 on mobile so it takes up exactly half the space
                    className="relative overflow-hidden group flex-1 sm:flex-none sm:w-auto px-2 sm:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-[#FF5A36] text-white rounded-full font-bold text-[13px] sm:text-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-1.5 border border-orange-400/50 active:scale-95"
                  >
                    {isAdding ? (
                      <span className="flex items-center justify-center gap-1.5"><Loader2 size={16} className="animate-spin" /> {t('mainHero.addingToCart', 'प्रक्रिया...')}</span>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5"/> {t('mainHero.orderBook', 'आजच मागवा')}
                      </span>
                    )}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  </button>
                  </>
                )
              )}

              {/* SECONDARY ACTION */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={scrollToNext}
                className="flex-1 sm:flex-none sm:w-auto flex items-center justify-center gap-1.5 px-2 sm:px-8 py-3 md:py-4 border border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-full transition-all font-bold tracking-wide text-[13px] sm:text-base group whitespace-nowrap"
              >
                {t('mainHero.learnMore', 'अधिक जाणून घ्या')} 
                <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-y-1 transition-transform" />
              </motion.button>

            </motion.div>

            {/* STATS - Hidden entirely on mobile (< sm) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="hidden sm:flex justify-center lg:justify-start gap-10 pt-6"
            >
              {[
                { num: t('mainHero.stat1Num', '५०००+'), label: t('mainHero.stat1Label', 'वाचक') },
                { num: t('mainHero.stat2Num', '४.८'), label: t('mainHero.stat2Label', 'रेटिंग') },
                { num: t('mainHero.stat3Num', '१५+'), label: t('mainHero.stat3Label', 'प्रकरणे') },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="font-rozha text-2xl md:text-3xl gold-gradient-text drop-shadow-sm dark:drop-shadow-none">
                    {stat.num}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mukta mt-1 font-semibold tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

          </motion.div>

          {/* RIGHT: 3D BOOK IMAGE */}
          <motion.div 
            style={{ scale: bookScale }} 
            className="w-full lg:w-1/2 flex justify-center [perspective:1000px] mt-4 lg:mt-0 relative z-10 order-2"
          >
            {/* EXACT Responsive classes from Previous Version */}
            <div className="relative group w-[290px] h-[400px] sm:w-[340px] sm:h-[520px] md:w-[450px] md:h-[640px]">
              
              <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-r-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-2xl transition-all duration-500 lg:group-hover:-translate-y-4 group-hover:rotate-2 group-hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-l-[1px] border-slate-300 dark:border-slate-700 overflow-hidden">
                 
                 <img 
                   src={bookCoverImg} 
                   alt="Book Cover" 
                   loading="eager"
                   className="w-full h-full object-cover"
                 />

                 <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 mix-blend-overlay pointer-events-none" />
                 <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>

    {/* Render the Prebook Modal */}
      <PrebookModal isOpen={isPrebookOpen} onClose={() => setIsPrebookOpen(false)} />
    </>
  );
};