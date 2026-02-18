import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Quote } from 'lucide-react';

export const QuoteSection = () => {
  const containerRef = useRef(null);
  
  // Create a parallax effect where the background text moves slower than the foreground
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], ["20px", "-20px"]);

  return (
    <section 
      ref={containerRef} 
      className="relative py-32 md:py-48 bg-white dark:bg-slate-950 overflow-hidden flex items-center justify-center"
    >
      {/* 1. LARGE DECORATIVE BACKGROUND TEXT (Marathi) */}
      <motion.div 
        style={{ x: backgroundX }}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap pointer-events-none select-none"
      >
        <span className="text-[15vh] md:text-[25vh] font-serif font-black text-slate-100 dark:text-slate-900/40 leading-none">
          सवयी: यशाचा राजमार्ग
        </span>
      </motion.div>

      {/* 2. MAIN QUOTE CONTENT */}
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          style={{ y: foregroundY }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-500 shadow-sm">
              <Quote size={32} fill="currentColor" className="opacity-80" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight mb-8">
            "Your habits are the <span className="text-orange-600 dark:text-orange-500 italic">compound interest</span> of self-improvement. The way you spend your days is the way you spend your life."
          </h2>

          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-slate-300 dark:bg-slate-700" />
            <span className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400">
              — कैलासराव तुकाराम तुरकणे पाटील
            </span>
            <div className="h-px w-12 bg-slate-300 dark:bg-slate-700" />
          </div>
        </motion.div>
      </div>

      {/* 3. SUBTLE LIGHTING ACCENT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-orange-500/50 to-transparent" />
    </section>
  );
};