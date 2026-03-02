import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Hand } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Make sure to import your actual book cover!
import bookCoverImg from '../../assets/cover.png'; 

// Premium Image for the inside right page
const rightPageImg = "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=800&q=80";

export const HeroCreative = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const targetRef = useRef(null);
  
  // State to control the 3D Book opening
  const [isOpen, setIsOpen] = useState(false);
  
  // Track scroll for subtle parallax
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const visualY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

  // Handle routing directly to the specific Product Page with Referral Code retention
  const handleOrderClick = () => {
    const refCode = searchParams.get('ref');
    const productRoute = '/store'; 

    if (refCode) {
      navigate(`${productRoute}?ref=${refCode}`);
    } else {
      navigate(productRoute);
    }
  };

  return (
    <section ref={targetRef} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-slate-900 pt-24 pb-24 lg:pt-16 lg:pb-16">
      
      {/* === LAYER 1: PREMIUM ANIMATED BACKGROUND === */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#134e4a] to-[#0f172a]" />
        
        {/* Animated Abstract Geometric Pattern */}
        <motion.div 
          style={{ rotate: bgRotate }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] md:w-[150vw] md:h-[150vw] opacity-[0.07]"
        >
            <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.5" />
                <path d="M400 0L800 400L400 800L0 400L400 0Z" fill="none" stroke="url(#grad1)" strokeWidth="2" />
                <path d="M400 100L700 400L400 700L100 400L400 100Z" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" />
                <path d="M400 200L600 400L400 600L200 400L400 200Z" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.3" />
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor: '#d4af37', stopOpacity:1}} />
                    </linearGradient>
                </defs>
            </svg>
        </motion.div>

        {/* Ambient light orbs */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-500/20 rounded-full blur-[80px] md:blur-[120px] mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-amber-500/10 rounded-full blur-[80px] md:blur-[100px] mix-blend-overlay" />
      </div>

      {/* === CONTENT CONTAINER === */}
      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
          
          {/* === LAYER 2: TEXT CONTENT (Left Side) === */}
          <motion.div style={{ y: textY }} className="lg:col-span-7 relative z-20 space-y-6 md:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs md:text-sm font-semibold text-amber-300 tracking-wider uppercase">
                {t('hero.badge')}
              </span>
            </motion.div>

            <div className="space-y-1 w-full">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
                className="p-2 text-4xl sm:text-5xl md:text-7xl lg:text-[5rem] leading-[1.15] md:leading-[1.1] font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-teal-200 drop-shadow-sm"
              >
                {t('hero.title')}
                <span className="block text-xl sm:text-2xl md:text-3xl font-light text-teal-100/80 mt-2 md:mt-4 font-sans uppercase">
                  {t('hero.subtitle')}
                </span>
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base md:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-[90%] sm:max-w-2xl font-light"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="pt-4 md:pt-6 w-full sm:w-auto"
            >
              <button 
                onClick={handleOrderClick}
                className="group relative overflow-hidden px-8 py-4 md:px-12 md:py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-bold text-white shadow-[0_15px_40px_-10px_rgba(217,119,6,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(217,119,6,0.6)] transition-all active:scale-95 w-full sm:w-auto text-lg"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {t('hero.orderBtn')} <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5"/>
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              </button>
            </motion.div>

          </motion.div>

          {/* === LAYER 3: 3D INTERACTIVE BOOK (Right Side) === */}
          <motion.div style={{ y: visualY }} className="lg:col-span-5 relative z-10 flex justify-center lg:justify-end [perspective:2000px] mt-12 lg:mt-0 pb-10">
            
            {/* OUTER WRAPPER: Handles the infinite floating bounce */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-[260px] sm:w-[320px] md:w-[400px] lg:w-[450px] aspect-[4/5]"
            >
              
              {/* INNER WRAPPER: Handles centering, maintaining 1:1 scale, and 3D effect */}
              <motion.div
                className="w-full h-full relative cursor-pointer group"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ opacity: 0, scale: 0.9, rotateY: -20, rotateX: 10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, // Kept at scale 1 to prevent shrinking
                  x: isOpen ? '50%' : '0%', // Shifts exactly 50% right so the 2-page spread stays perfectly centered
                  rotateY: isOpen ? 0 : -10, // Flattens out perfectly when opened
                  rotateX: isOpen ? 0 : 5 
                }}
                transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                onClick={() => setIsOpen(!isOpen)}
              >
                  {/* Glowing orb behind the book */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-teal-400/30 rounded-full blur-[60px] md:blur-[80px] -z-10 animate-pulse pointer-events-none" />

                  {/* "Click to Open / Close" Hint Badge */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={isOpen ? "close" : "open"}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 whitespace-nowrap animate-bounce z-50 pointer-events-none"
                    >
                      <Hand size={16} /> {isOpen ? "Click to Close" : "Click to Open"}
                    </motion.div>
                  </AnimatePresence>

                  {/* --- BASE LAYER (Inside Right Page) --- */}
                  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-200 rounded-3xl md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-300 z-10">
                     <img src={rightPageImg} alt="Inside Book Image" className="w-full h-full object-cover opacity-95 mix-blend-multiply" />
                     {/* Deep inner spine shadow */}
                     <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* --- SWINGING COVER (Glass Block + Book Cover) --- */}
                  <motion.div
                    className="absolute inset-0 z-20"
                    style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isOpen ? -165 : 0 }} // Swings open like a real book
                    transition={{ type: "spring", stiffness: 50, damping: 16 }}
                  >
                    
                    {/* FRONT FACE: The Frosted Glass Block Design */}
                    <div 
                      className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl md:rounded-[3rem] border-t border-l border-white/20 shadow-2xl overflow-hidden"
                      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 pointer-events-none" />
                        <div className="absolute inset-4 sm:inset-6 md:inset-8 rounded-xl md:rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                          <img src={bookCoverImg} alt={t('hero.title')} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 mix-blend-overlay pointer-events-none" />
                        </div>
                    </div>

                    {/* BACK FACE: Inside Left Page (Author Name Centered) */}
                    <div 
                      className="absolute inset-0 bg-[#fdfbf7] rounded-3xl md:rounded-[3rem] overflow-hidden shadow-inner border border-slate-200 flex flex-col items-center justify-center p-6 text-center"
                      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                       {/* Subtle Paper Texture */}
                       <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none mix-blend-multiply" />
                       
                       {/* Classic Book Title Page Text */}
                       <div className="relative z-10 flex flex-col items-center opacity-80 mix-blend-multiply px-4">
                          <div className="w-12 h-px bg-slate-400 mb-6" />
                          <h4 className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-slate-500 mb-3">
                            Written By
                          </h4>
                          <h3 className="font-serif font-bold text-slate-800 text-xl sm:text-2xl md:text-3xl leading-snug">
                            कैलासराव पाटील
                          </h3>
                          <div className="w-12 h-px bg-slate-400 mt-6" />
                       </div>
                       
                       {/* Deep inner spine shadow on the right edge */}
                       <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/25 to-transparent pointer-events-none" />
                    </div>

                  </motion.div>

                  {/* Decorative orbiting elements around the prism */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 md:-inset-10 border border-teal-500/20 rounded-full -z-20 border-dashed pointer-events-none" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute -inset-12 md:-inset-20 border border-amber-500/20 rounded-full -z-20 opacity-50 pointer-events-none" />
              </motion.div>
            </motion.div>

          </motion.div>

        </div>
      </div>
      
      {/* === ULTRA PREMIUM SWEEPING CURVE DIVIDER === */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 pointer-events-none translate-y-[2px] scale-105 origin-bottom">
        <svg 
          className="relative block w-full h-[60px] md:h-[120px]" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M 0 120 L 1200 120 L 1200 0 C 800 140 400 0 0 80 Z" 
            className="fill-slate-50 dark:fill-slate-950 transition-colors duration-300"
          ></path>
        </svg>
      </div>

    </section>
  );
};