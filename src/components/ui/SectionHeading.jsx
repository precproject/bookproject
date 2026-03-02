import React from 'react';
import { motion } from 'framer-motion';

export const SectionHeading = ({ title, subtitle, align = 'center' }) => (
  <div className={`mb-12 md:mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest text-xs md:text-sm block mb-2"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-black dark:text-white leading-tight"
    >
      {title}
    </motion.h2>
  </div>
);