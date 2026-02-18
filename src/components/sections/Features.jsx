import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// --- Geometric Icons ---
const IconOne = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <path d="M20 40C8.954 40 0 31.046 0 20C0 8.954 8.954 0 20 0V20H40C40 31.046 31.046 40 20 40Z" className="fill-slate-900 dark:fill-white" />
    <circle cx="28" cy="12" r="8" fill="#FF5A36" />
  </svg>
);

const IconTwo = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <polygon points="0,0 24,0 0,24" fill="#FF5A36" />
    <polygon points="40,40 16,40 40,16" className="fill-slate-900 dark:fill-white" />
  </svg>
);

const IconThree = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <path d="M0 20C0 8.954 8.954 0 20 0V20H0Z" fill="#FF5A36" />
    <path d="M40 20C40 31.046 31.046 40 20 40V20H40Z" className="fill-slate-900 dark:fill-white" />
  </svg>
);

const IconFour = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <rect x="0" y="0" width="20" height="40" className="fill-slate-900 dark:fill-white" />
    <circle cx="30" cy="20" r="10" fill="#FF5A36" />
  </svg>
);

const IconFive = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 md:w-10 md:h-10">
    <rect x="0" y="20" width="40" height="20" className="fill-slate-900 dark:fill-white" />
    <polygon points="20,0 40,20 0,20" fill="#FF5A36" />
  </svg>
);

export const Features = () => {
  const scrollRef = useRef(null);

  const features = [
    { 
      title: "Practical Insights To Create User Habits That Stick.", 
      marathi: "व्यावहारिक ज्ञान", 
      desc: "Hooked is based on Eyal's years of research, consulting, and practical experience. Tailored for the modern entrepreneur.", 
      icon: IconOne 
    },
    { 
      title: "Actionable Steps For Building Products People Love.", 
      marathi: "पाऊल-दर-पाऊल", 
      desc: "Not abstract theory, but a how-to guide for building a better product. A definitive blueprint for your next big idea.", 
      icon: IconTwo 
    },
    { 
      title: "Fascinating Examples From Daily Life.", 
      marathi: "मानसशास्त्र", 
      desc: "Understand human behavior, marketing strategies, and what drives our daily actions without requiring a psychology degree.", 
      icon: IconThree 
    },
    { 
      title: "Mastering Internal And External Triggers.", 
      marathi: "ट्रिगर्स ओळखा", 
      desc: "Learn how to identify the exact moments that prompt user action and how to design environments that encourage positive habits.", 
      icon: IconFour 
    },
    { 
      title: "The Power Of Variable Rewards.", 
      marathi: "अपेक्षित बक्षीस", 
      desc: "Discover why unpredictable rewards are the secret engine behind the world's most engaging and habit-forming products.", 
      icon: IconFive 
    },
  ];

  // Scroll function for the custom arrows
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 400 : 300; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="features" className="relative pt-24 pb-20 md:pt-32 md:pb-32 bg-[#F8F9FA] dark:bg-slate-950 z-0 overflow-hidden">
      
      {/* FIX 1: THE ASYMMETRICAL BACKGROUND 
        Instead of taking 100% width, it is strictly capped at 55% on desktop (lg:w-[55%]). 
        This perfectly matches the half-and-half design of your reference image.
      */}
      <div className="absolute top-0 left-0 w-full lg:w-[55%] h-[320px] md:h-[420px] bg-[#151515] dark:bg-[#080808] z-0" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 w-full gap-6">
          
          {/* FIX 2: VISIBLE ANIMATED HEADING
            Removed the 'overflow-hidden' wrapper that was eating the text. 
            Simplified the animation to a smooth fade/slide up.
          */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-sans font-bold text-white tracking-tight leading-tight md:mt-10">
              In This Book
            </h2>
          </motion.div>
          
          {/* FIX 3: ARROWS ALIGNMENT & COLOR
            Since the arrows sit on the light background on desktop, their colors are updated to look great against white/gray.
          */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex gap-4 md:pb-4"
          >
            <button 
              onClick={() => handleScroll('left')}
              className="p-3 md:p-4 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-900 dark:hover:border-white transition-all active:scale-95 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
            >
              <ArrowLeft size={24} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="p-3 md:p-4 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-900 dark:hover:border-white transition-all active:scale-95 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
            >
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
        
        {/* FIX 4: SCROLLABLE CARDS CONTAINER
          Strict card widths prevent squashing. Native snap scrolling makes it feel like a mobile app.
        */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 md:gap-8 pb-12 pt-10 px-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              // Strict widths: 85% of screen on mobile, 380px fixed on desktop
              className="group relative bg-white dark:bg-slate-900 px-6 pt-16 pb-10 md:px-10 md:pt-20 md:pb-14 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:-translate-y-2 shrink-0 w-[85vw] sm:w-[320px] md:w-[380px] snap-center md:snap-start"
            >
              {/* Circular Overlapping Icon Container */}
              <div className="absolute -top-10 left-6 md:left-10 w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.06)] dark:shadow-none border border-slate-50 dark:border-slate-800 transition-transform duration-500 group-hover:scale-110">
                <f.icon />
              </div>

              {/* Marathi Subtitle */}
              <p className="text-[#FF5A36] text-xs md:text-sm font-bold tracking-widest uppercase mb-3 md:mb-4">
                {f.marathi}
              </p>

              {/* Main Card Title */}
              <h3 className="text-xl md:text-2xl font-sans font-bold text-slate-900 dark:text-white mb-4 md:mb-5 leading-tight group-hover:text-[#FF5A36] transition-colors duration-300">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                {f.desc}
              </p>
            </motion.div>
          ))}
          
          {/* Invisible spacer div to ensure the last card can scroll fully into view */}
          <div className="shrink-0 w-4 md:w-8"></div>
        </div>

      </div>
    </section>
  );
};