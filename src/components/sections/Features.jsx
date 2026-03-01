import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react';

// --- Geometric Icons ---
const IconOne = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <path d="M20 40C8.954 40 0 31.046 0 20C0 8.954 8.954 0 20 0V20H40C40 31.046 31.046 40 20 40Z" className="fill-slate-800 dark:fill-white" />
    <circle cx="28" cy="12" r="8" fill="#f97316" />
  </svg>
);

const IconTwo = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <polygon points="0,0 24,0 0,24" fill="#f97316" />
    <polygon points="40,40 16,40 40,16" className="fill-slate-800 dark:fill-white" />
  </svg>
);

const IconThree = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <path d="M0 20C0 8.954 8.954 0 20 0V20H0Z" fill="#f97316" />
    <path d="M40 20C40 31.046 31.046 40 20 40V20H40Z" className="fill-slate-800 dark:fill-white" />
  </svg>
);

const IconFour = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <rect x="0" y="0" width="20" height="40" className="fill-slate-800 dark:fill-white" />
    <circle cx="30" cy="20" r="10" fill="#f97316" />
  </svg>
);

const IconFive = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <rect x="0" y="20" width="40" height="20" className="fill-slate-800 dark:fill-white" />
    <polygon points="20,0 40,20 0,20" fill="#f97316" />
  </svg>
);

export const Features = () => {
  const scrollRef = useRef(null);
  
  // States to track if we can scroll left or right
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Added beautiful images to perfectly match each card's theme
  const features = [
    { 
      title: "Practical Insights To Create User Habits That Stick.", 
      marathi: "व्यावहारिक ज्ञान", 
      desc: "Hooked is based on Eyal's years of research, consulting, and practical experience. Tailored for the modern entrepreneur.", 
      icon: IconOne,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      title: "Actionable Steps For Building Products People Love.", 
      marathi: "पाऊल-दर-पाऊल", 
      desc: "Not abstract theory, but a how-to guide for building a better product. A definitive blueprint for your next big idea.", 
      icon: IconTwo,
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      title: "Fascinating Examples From Daily Life.", 
      marathi: "मानसशास्त्र", 
      desc: "Understand human behavior, marketing strategies, and what drives our daily actions without requiring a psychology degree.", 
      icon: IconThree,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      title: "Mastering Internal And External Triggers.", 
      marathi: "ट्रिगर्स ओळखा", 
      desc: "Learn how to identify the exact moments that prompt user action and how to design environments that encourage positive habits.", 
      icon: IconFour,
      image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      title: "The Power Of Variable Rewards.", 
      marathi: "अपेक्षित बक्षीस", 
      desc: "Discover why unpredictable rewards are the secret engine behind the world's most engaging and habit-forming products.", 
      icon: IconFive,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
  ];

  // Robust function to check scroll position 
  const checkForScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      // If scroll is more than 15px from left edge, show Left Arrow
      setCanScrollLeft(scrollLeft > 15);
      
      // If we are within 5px of the maximum scroll distance, hide Right Arrow
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 20);
    }
  };

  useEffect(() => {
    checkForScrollPosition();
    // Safety check after fonts/images load
    const timer = setTimeout(checkForScrollPosition, 500); 

    window.addEventListener('resize', checkForScrollPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkForScrollPosition);
    };
  }, []);

  // Smooth snapping scroll logic
  const handleScroll = (direction) => {
    if (scrollRef.current && scrollRef.current.firstElementChild) {
      // Find the exact width of a single card + the gap (24px or 32px)
      const gap = window.innerWidth > 768 ? 32 : 24; 
      const scrollAmount = scrollRef.current.firstElementChild.offsetWidth + gap;
      
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="features" className="relative pt-24 pb-20 md:pt-32 md:pb-32 bg-slate-50 dark:bg-slate-950 z-0 overflow-hidden transition-colors duration-300">
      
      {/* ASYMMETRICAL BACKGROUND */}
      <div className="absolute top-0 left-0 w-full lg:w-[60%] h-[340px] md:h-[440px] bg-slate-900 dark:bg-[#0a0a0a] rounded-br-[3rem] lg:rounded-br-[5rem] z-0 transition-colors duration-300 shadow-2xl shadow-slate-900/20" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Row */}
        <div className="mb-12 md:mb-16 w-full px-2 md:px-0">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight md:mt-8">
              In This Book<span className="text-orange-500">.</span>
            </h2>
          </motion.div>
        </div>
        
        {/* CAROUSEL WRAPPER (Removed 'group' from here to fix hover bug) */}
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
                className="absolute -left-2 md:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-700/50 text-orange-600 dark:text-orange-500 hover:scale-110 hover:bg-white dark:hover:bg-slate-800 transition-colors"
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
                className="absolute -right-2 md:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-700/50 text-orange-600 dark:text-orange-500 hover:scale-110 hover:bg-white dark:hover:bg-slate-800 transition-colors animate-[pulse_3s_ease-in-out_infinite] md:animate-none"
                aria-label="Scroll Right"
              >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* SCROLLABLE CARDS CONTAINER */}
          {/* Note: Added onScroll here to track scrolling/swiping instantly */}
          <div 
            ref={scrollRef}
            onScroll={checkForScrollPosition}
            className="flex overflow-x-auto gap-6 md:gap-8 pb-8 md:pb-16 pt-12 px-3 snap-x snap-mandatory scroll-smooth hide-scrollbar relative z-10"
          >
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                // 'group' class is strictly on the individual card now
                className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/30 hover:shadow-orange-500/5 shrink-0 w-[82vw] sm:w-[320px] md:w-[380px] snap-center md:snap-start flex flex-col overflow-hidden will-change-transform"
              >
                
                {/* --- RESPONSIVE CARD IMAGE --- */}
                <div className="w-full h-48 md:h-56 shrink-0 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={f.image} 
                    alt={f.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle gradient overlay to make the floating icon pop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* --- FLOATING GEOMETRIC ICON --- */}
                {/* Perfectly positioned to float halfway between the image and the content */}
                <div className="absolute top-40 md:top-48 left-6 md:left-8 w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-slate-950 border border-slate-50 dark:border-slate-800 transition-transform duration-500 group-hover:scale-110 z-10">
                  <f.icon />
                </div>

                {/* --- CARD CONTENT --- */}
                <div className="px-6 pt-12 pb-8 md:px-8 md:pt-16 md:pb-10 flex flex-col flex-grow bg-white dark:bg-slate-900">
                  
                  {/* Marathi Subtitle Tag */}
                  <div className="mb-4">
                    <span className="inline-block bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-orange-100 dark:border-orange-500/20">
                      {f.marathi}
                    </span>
                  </div>

                  {/* Main Card Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                    {f.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base flex-grow">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {/* Spacer div ensures the last card doesn't get stuck behind padding.
              'snap-end' forces the browser to treat this as the absolute scroll limit.
            */}
            <div className="shrink-0 w-2 md:w-8 snap-end"></div>
          </div>
          
          {/* MOBILE SWIPE INDICATOR */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-2 text-slate-400 dark:text-slate-500 opacity-80">
            <MoveHorizontal size={16} />
            <span className="text-[10px] font-bold tracking-widest uppercase">Swipe to explore</span>
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