import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, Download, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';

import bookCoverImg from '../../assets/cover.png';

export const Hero = ({ onOrderClick }) => {

  // This state acts as our "VIP Checker"
  const [hasReferral, setHasReferral] = useState(false);

  useEffect(() => {
    // When the page loads, we check the web address for our special stamp
    // If the address looks like "yourwebsite.com/?ref=friend", it turns on the premium button.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('ref')) {
      setHasReferral(true);
    }
  }, []);

  // This acts as the host pointing the guest down the hallway
  const scrollToNext = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-[100svh] flex items-center pt-28 pb-16 bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-orange-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-56 h-56 md:w-72 md:h-72 bg-blue-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Changed to flex-col on mobile, row on desktop */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left mt-8 lg:mt-0 order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wide border border-orange-200 dark:border-orange-800">
                #1 Bestseller
              </span>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.15]">
              मराठा समाज <br className="sm:block"/>
              <span className="p-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">
              चिंतनातून चिंतामुक्तीकडे
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              <span className="font-serif font-bold text-orange-600 dark:text-orange-400 text-lg md:text-xl block mb-1">"सवयी: यशाचा राजमार्ग"</span>
              The definitive guide to building habits that stick. Written specifically for the modern Marathi entrepreneur and thinker.
            </motion.p>

            {/* --- THE BUTTON LOGIC HAPPENS HERE --- */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
              
              {hasReferral ? (
                /* The Premium VIP Button */
                <button 
                  onClick={onOrderClick}
                  className="relative overflow-hidden group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-[#FF5A36] text-white rounded-full font-bold text-lg shadow-[0_10px_30px_rgba(255,90,54,0.3)] hover:shadow-[0_15px_40px_rgba(255,90,54,0.5)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 border border-orange-400/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Order Hardcopy <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* The glossy sweep effect that slides across the button on hover */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </button>
              ) : (
                /* The Welcoming Arrow for general guests */
                <motion.button 
                  onClick={scrollToNext}
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-lg text-[#FF5A36] hover:text-white hover:bg-[#FF5A36] hover:border-[#FF5A36] transition-colors duration-300"
                  aria-label="Scroll to next section"
                >
                  <ArrowDown size={28} />
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Responsive Book Image */}
          {/* Responsive Book Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }} 
            animate={{ opacity: 1, scale: 1, rotateY: 0 }} 
            transition={{ duration: 0.8 }} 
            className="w-full lg:w-1/2 flex justify-center [perspective:1000px] order-1 lg:order-2"
          >
            {/* CHANGE 1: Increased responsive sizes significantly.
               Old: w-[220px] h-[330px] sm:w-[280px] sm:h-[420px] md:w-[350px] md:h-[500px]
            */}
            <div className="relative group w-[260px] h-[400px] sm:w-[340px] sm:h-[520px] md:w-[420px] md:h-[640px]">
              
              {/* The 3D Book Container */}
              {/* CHANGE 2: Reduced border-l-[12px] to border-l-[6px] for a thinner spine.
              */}
              <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-r-2xl shadow-2xl transition-all duration-500 group-hover:-translate-y-2 lg:group-hover:-translate-y-4 group-hover:rotate-2 group-hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-l-[1px] border-slate-300 dark:border-slate-700 overflow-hidden">
                 
                 <img 
                   src={bookCoverImg} 
                   alt="Book Cover" 
                   className="w-full h-full object-cover"
                 />

                 {/* Glossy Overlay Effect */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 mix-blend-overlay pointer-events-none" />
                 
                 {/* Inner spine shadow - adjusted width slightly for the thinner border */}
                 <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                 
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};