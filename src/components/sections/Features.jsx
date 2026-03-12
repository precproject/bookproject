import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// --- Import Real Images from Assets ---
import feature1Img from '../../assets/chapter3.png';
import feature2Img from '../../assets/chapter4.png';
import feature3Img from '../../assets/chapter9.png';
import feature4Img from '../../assets/chapter10.png';
import feature5Img from '../../assets/chapter14.png';

const featureImages = [feature1Img, feature2Img, feature3Img, feature4Img, feature5Img];

export const Features = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  
  // States to track if we can scroll left or right
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Load the feature list dynamically from translations
  const features = t('features.list', { returnObjects: true }) || [];

  // --- Cinematic Scroll Effects ---
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Moves the asymmetrical background slightly slower than the scroll
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  // Parallax for the title
  const titleY = useTransform(scrollYProgress, [0, 1], ["30px", "-30px"]);

  // Robust function to check scroll position 
  const checkForScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 20);
    }
  };

  useEffect(() => {
    checkForScrollPosition();
    const timer = setTimeout(checkForScrollPosition, 500); 

    window.addEventListener('resize', checkForScrollPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkForScrollPosition);
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current && scrollRef.current.firstElementChild) {
      const gap = window.innerWidth > 768 ? 32 : 24; 
      const scrollAmount = scrollRef.current.firstElementChild.offsetWidth + gap;
      
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="relative pt-20 pb-16 md:pt-32 md:pb-24 z-0 overflow-hidden"
    >
      
      {/* ASYMMETRICAL BACKGROUND WITH PARALLAX */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute top-0 left-0 w-full lg:w-[60%] h-[280px] md:h-[400px] bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-br-[3rem] lg:rounded-br-[5rem] z-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-2xl" 
      />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Row */}
        <div className="mb-6 md:mb-10 w-full px-2 md:px-0">
          <motion.div 
            style={{ y: titleY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* RESTORED: Golden text + The Orange Dot at the end */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-rozha font-black tracking-tight leading-tight md:mt-4 drop-shadow-sm dark:drop-shadow-none">
              <span className="gold-gradient-text">{t('features.heading', 'In This Book')}</span>
              <span className="text-orange-500">.</span>
            </h2>
          </motion.div>
        </div>
        
        {/* CAROUSEL WRAPPER */}
        <div className="relative">
          
          {/* --- FLOATING LEFT ARROW --- */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleScroll('left')}
                className="absolute -left-2 md:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full glass-card text-orange-600 dark:text-amber-500 hover:scale-110 hover:text-white hover:bg-orange-500 dark:hover:bg-amber-500 transition-all shadow-lg"
                aria-label="Scroll Left"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* --- FLOATING RIGHT ARROW --- */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleScroll('right')}
                className="absolute -right-2 md:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full glass-card text-orange-600 dark:text-amber-500 hover:scale-110 hover:text-white hover:bg-orange-500 dark:hover:bg-amber-500 transition-all shadow-lg animate-[pulse_3s_ease-in-out_infinite] md:animate-none"
                aria-label="Scroll Right"
              >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* SCROLLABLE CARDS CONTAINER */}
          <div 
            ref={scrollRef}
            onScroll={checkForScrollPosition}
            className="flex overflow-x-auto gap-6 md:gap-8 pb-8 md:pb-16 pt-4 md:pt-8 px-3 snap-x snap-mandatory scroll-smooth hide-scrollbar relative z-10"
          >
            {features.map((f, i) => {
              const displayImage = featureImages[i % featureImages.length];

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                  className="group relative glass-card rounded-[2rem] transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/30 hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)] shrink-0 w-[82vw] sm:w-[320px] md:w-[380px] snap-center md:snap-start flex flex-col overflow-hidden will-change-transform"
                >
                  
                  {/* --- RESPONSIVE CARD IMAGE --- */}
                  {/* FIX: Replaced fixed heights with an aspect ratio. This ensures it fits perfectly inside the card frame on any mobile device without odd cropping */}
                  <div className="w-full aspect-[4/3] md:aspect-[3/2] shrink-0 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={displayImage} 
                      alt={f.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>

                  {/* --- CARD CONTENT --- */}
                  <div className="px-6 pt-6 pb-8 md:px-8 md:pt-8 md:pb-10 flex flex-col flex-grow">
                    
                    {/* Tag */}
                    <div className="mb-4">
                      <span className="inline-block bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-orange-200 dark:border-orange-500/20">
                        {f.marathi}
                      </span>
                    </div>

                    {/* Main Card Title */}
                    <h3 className="text-xl md:text-2xl font-rozha font-bold text-slate-900 dark:text-white mb-3 md:mb-4 leading-snug group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                      {f.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400 font-mukta leading-relaxed text-sm md:text-base flex-grow">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            
            <div className="shrink-0 w-2 md:w-8 snap-end"></div>
          </div>
          
          {/* MOBILE SWIPE INDICATOR */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-0 text-slate-500 dark:text-slate-400 opacity-80">
            <MoveHorizontal size={16} className="animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase">{t('features.swipeHint', 'Swipe to explore')}</span>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
};