import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
// Make sure to import your actual book cover!
import bookCoverImg from '../../assets/cover.png'; // Ensure this path is correct

export const HeroCreative = ({ onOrderClick }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  // Parallax effects for different layers
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const visualY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  return (
    <section ref={targetRef} className="relative min-h-[95vh] flex items-center overflow-hidden bg-slate-900">
      
      {/* === LAYER 1: PREMIUM ANIMATED BACKGROUND === */}
      <div className="absolute inset-0 z-0">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#134e4a] to-[#0f172a]" />
        
        {/* Animated Abstract Geometric Pattern */}
        <motion.div 
          style={{ rotate: bgRotate }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] opacity-10"
        >
            <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                <filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.5" />
                <path d="M400 0L800 400L400 800L0 400L400 0Z" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.5" />
                <path d="M400 100L700 400L400 700L100 400L400 100Z" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.3" />
                <path d="M400 200L600 400L400 600L200 400L400 200Z" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.2" />
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor: '#d4af37', stopOpacity:1}} />
                    </linearGradient>
                </defs>
            </svg>
        </motion.div>

        {/* Ambient light orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] mix-blend-overlay" />
      </div>

      {/* === CONTENT CONTAINER === */}
      <div className="container mx-auto px-6 relative z-20 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* === LAYER 2: TEXT CONTENT (Left Side) === */}
          <motion.div style={{ y: textY }} className="lg:col-span-7 relative z-20 space-y-8 text-center lg:text-left">
            
            {/* Premium Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-300 tracking-wider uppercase">National Bestseller</span>
            </motion.div>

            {/* Main Title with massive scale contrast */}
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
                className="p-3 text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] leading-[1.1] font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-teal-200"
              >
                चिंतनातून चिंतामुक्तीकडे
 
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.2em] text-teal-100/80 mt-2 font-sans uppercase">
                  (मराठा समाज)
                </span>
              </motion.h1>
            </div>

            {/* Subtitle / Pitch */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light"
            >
              Break free from the mental traps holding you back. The definitive Marathi guide to decoding modern success and finding clarity in chaos.
            </motion.p>

            {/* Premium Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6"
            >
              {/* Primary Gold Button with Shine Effect */}
              <button 
                onClick={onOrderClick}
                className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-bold text-white shadow-[0_15px_40px_-10px_rgba(217,119,6,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(217,119,6,0.6)] transition-all active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Order Hardcopy <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                </span>
                {/* Shine animation */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              </button>

              {/* Secondary Glass Button */}
              <button className="group px-10 py-5 rounded-full font-semibold text-white bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-3">
                <PlayCircle className="text-teal-300 group-hover:scale-110 transition-transform"/> Watch Trailer
              </button>
            </motion.div>

          </motion.div>

{/* === LAYER 3: THE GLASS PRISM VISUAL (Right Side) === */}
          <motion.div style={{ y: visualY }} className="lg:col-span-5 relative z-10 flex justify-center lg:justify-end [perspective:2000px]">
            
            {/* 1. OUTER WRAPPER: Handles the infinite floating bounce */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-[320px] md:w-[450px] aspect-[4/5]"
            >
              {/* 2. INNER WRAPPER: Handles the initial 3D entry pop */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -30, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: -15, rotateX: 5 }}
                transition={{ duration: 1.5, type: "spring", bounce: 0.3 }}
                className="w-full h-full relative"
              >
                  {/* Glowing orb behind the book */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-teal-400/30 rounded-full blur-[80px] -z-10 animate-pulse" />

                  {/* The Frosted Glass Block */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-[3rem] border-t border-l border-white/20 shadow-2xl overflow-hidden transform-gpu">
                      
                      {/* Reflection Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 pointer-events-none" />

                      {/* THE BOOK INSIDE THE GLASS */}
                      {/* Adjusted inset so the image displays perfectly inside the glass */}
                      <div className="absolute inset-4 sm:inset-8 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                        <img 
                          src={bookCoverImg} 
                          alt="Book Cover" 
                          className="w-full h-full object-cover" 
                        />
                        {/* Book texture overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 mix-blend-overlay pointer-events-none" />
                      </div>
                  </div>

                  {/* Decorative orbiting elements around the prism */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-10 border border-teal-500/20 rounded-full -z-20 border-dashed" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -inset-20 border border-amber-500/20 rounded-full -z-20 opacity-50" />
              </motion.div>
            </motion.div>

          </motion.div>

        </div>
      </div>
      
      {/* Bottom Fade to blend with next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent z-10" />
    </section>
  );
};