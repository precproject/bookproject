import React from 'react';
import { motion } from 'framer-motion';

export const QuoteMarquee = () => {
  const row1 = [
    "सवयी: यशाचा राजमार्ग",
    "HABITS ARE COMPOUND INTEREST",
    "व्यावसायिक विचारसरणी",
    "CLARITY IN CHAOS",
    "सकारात्मक विचारधारा"
  ];

  const row2 = [
    "SUCCESS IS A HABIT",
    "चिंतामुक्तीचा मार्ग",
    "THE LABYRINTH OF MIND",
    "उद्योजक बना",
    "BREAK THE CYCLE"
  ];

  const MarqueeRow = ({ items, direction = "left", speed = 30 }) => (
    <div className="flex overflow-hidden whitespace-nowrap py-4 select-none">
      <motion.div
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
        className="flex gap-12 items-center"
      >
        {/* We double the items for a seamless loop */}
        {[...items, ...items].map((text, i) => (
          <span 
            key={i} 
            className={`text-5xl md:text-8xl font-serif font-black tracking-tighter uppercase px-4 ${
              i % 2 === 0 
              ? "text-transparent stroke-slate-200 dark:stroke-slate-800" 
              : "text-slate-900 dark:text-white"
            }`}
            style={{ WebkitTextStrokeWidth: '1.5px' }}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );

  return (
    <section className="py-20 bg-white dark:bg-slate-950 overflow-hidden relative">
      {/* Subtle Lighting Accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      
      <div className="flex flex-col gap-2 md:gap-4">
        {/* Moving Left to Right */}
        <MarqueeRow items={row1} direction="right" speed={40} />
        
        {/* Highlight Center Row: Moving Right to Left */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-orange-600/5 dark:bg-orange-500/5 -skew-y-1 pointer-events-none" />
          <MarqueeRow items={row2} direction="left" speed={35} />
        </div>

        {/* Moving Left to Right */}
        <MarqueeRow items={row1} direction="right" speed={50} />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
    </section>
  );
};