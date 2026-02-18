import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const SectionDivider = ({ nextSectionId }) => {
  const handleScroll = () => {
    const nextSection = document.getElementById(nextSectionId);
    if (nextSection) {
      // Offset by 80px to account for the fixed sticky navbar
      const yOffset = -80; 
      const y = nextSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    // The negative margin (-my-7) pulls the sections together and makes the button overlap them
    <div className="w-full flex justify-center -my-7 relative z-20 pointer-events-none">
      <motion.button
        onClick={handleScroll}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="pointer-events-auto w-14 h-14 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-[0_0_30px_rgba(255,90,54,0.15)] dark:shadow-[0_0_30px_rgba(255,90,54,0.08)] text-slate-400 hover:text-[#FF5A36] dark:hover:text-[#FF5A36] hover:border-orange-200 dark:hover:border-orange-900 transition-colors duration-300 group"
        aria-label="Scroll to next section"
      >
        <ChevronDown 
          size={24} 
          strokeWidth={1.5} 
          className="group-hover:translate-y-1 transition-transform duration-300" 
        />
      </motion.button>
    </div>
  );
};