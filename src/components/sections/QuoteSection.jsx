import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const QuoteSection = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], ["20px", "-20px"]);

  return (
    <section
      ref={containerRef}
      // UI FIX 1: Removed hardcoded backgrounds to allow seamless theme blending
      className="relative py-32 md:py-48 overflow-hidden flex items-center justify-center"
    >
      {/* BACKGROUND TEXT */}
      <motion.div
        style={{ x: backgroundX }}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap pointer-events-none select-none"
      >
        {/* UI FIX 2: Adaptive fade for the massive background text based on the new theme colors */}
        <span className="text-[12vh] md:text-[20vh] font-rozha leading-none bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 bg-clip-text text-transparent opacity-50 dark:opacity-70">
          {t('quote.backgroundText', 'सवयी: यशाचा राजमार्ग')}
        </span>
      </motion.div>

      {/* MAIN QUOTE */}
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          style={{ y: foregroundY }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* QUOTE ICON */}
          <div className="flex justify-center mb-10">
            {/* UI FIX 3: Replaced raw colors with your premium glass-card */}
            <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center text-amber-500 shadow-lg">
              <Quote size={28} fill="currentColor" className="opacity-90" />
            </div>
          </div>

          {/* QUOTE TEXT */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            // UI FIX 4: Adaptive text colors
            className="text-3xl md:text-5xl font-rozha text-slate-800 dark:text-white leading-tight mb-8 drop-shadow-sm dark:drop-shadow-none"
          >
            "{t('quote.bodyPart1', 'Your habits are the')} 
            
            {/* UI FIX 5: Applied your global dynamic gold-gradient-text */}
            <span className="gold-gradient-text italic px-2">
              {t('quote.highlight', 'compound interest')}
            </span> 
            
            {t('quote.bodyPart2', 'of self-improvement. The way you spend your days is the way you spend your life.')}"
          </motion.h2>

          {/* AUTHOR */}
          <div className="flex items-center justify-center gap-4 mt-10">
            {/* UI FIX 6: Replaced hardcoded gradients with your adaptive section-divider */}
            <div className="section-divider w-12 md:w-20" />
            
            <div className="text-center px-4">
              <div className="font-rozha text-lg md:text-2xl gold-gradient-text drop-shadow-sm dark:drop-shadow-none">
                {t('quote.author', 'कैलासराव तुकाराम तुरकणे पाटील')}
              </div>
              <div className="font-mukta text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 uppercase tracking-widest font-bold">
                {t('quote.role', 'लेखक, चिंतनातून चिंतामुक्तीकडे')}
              </div>
            </div>
            
            <div className="section-divider w-12 md:w-20" />
          </div>

        </motion.div>
      </div>

      {/* LIGHT ACCENT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-amber-500/40 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-amber-500/40 to-transparent" />
    </section>
  );
};