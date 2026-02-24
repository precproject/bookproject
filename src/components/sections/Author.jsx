import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Instagram, Facebook, Quote } from 'lucide-react';

import authorImage from '../../assets/author.png';

export const Author = () => {
  return (
    // Added overflow-hidden and relative for background elements
    <section id="author" className="py-24 md:py-32 bg-white dark:bg-slate-950 relative overflow-hidden z-0">
      
      {/* PREMIUM BACKGROUND ELEMENTS: Subtle gradient blobs for depth and lighting */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-orange-100/40 dark:bg-orange-900/10 rounded-full blur-3xl -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-lighten" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-100 dark:bg-slate-800/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-16 md:gap-24 lg:gap-32 max-w-7xl relative z-10">
        
        {/* === PREMIUM IMAGE CONTAINER === */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full sm:w-3/4 md:w-2/5 lg:w-1/3 relative group"
        >
          {/* Soft Glow behind the image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent dark:from-orange-500/10 blur-2xl rounded-[30px] transform rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-700" />
          
          {/* The Image Frame - Sleek border and colored shadow */}
          <div className="relative rounded-[30px] overflow-hidden shadow-[0_20px_50px_-20px_rgba(249,115,22,0.3)] dark:shadow-[0_20px_50px_-20px_rgba(249,115,22,0.15)] ring-1 ring-slate-100 dark:ring-slate-800/50">
            <img 
              src={authorImage}
              alt="Author" 
              // Added grayscale transition and slight scale on hover
              className="w-full object-cover aspect-[4/5] scale-100 group-hover:scale-105 transition-all duration-700 ease-in-out" 
            />
            {/* Subtle glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none mix-blend-overlay"></div>
          </div>
        </motion.div>
        
        {/* === PREMIUM TEXT CONTENT === */}
        <div className="w-full md:w-3/5 lg:w-3/5 text-center md:text-left">
          
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Refined Section Label */}
            <span className="block text-orange-600 dark:text-orange-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">
              The Mind Behind The Words
            </span>

            {/* Bold, Gradient Author Name */}
            <h3 className="p-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-orange-800 dark:from-white dark:via-slate-200 dark:to-orange-300">
             कैलासराव तुकाराम तुरकणे पाटील
            </h3>

            {/* Stylized Quote with decorative icon */}
            <div className="relative mb-10 p-2">
              <Quote className="absolute -top-2 -left-4 text-orange-200 dark:text-orange-900/30 w-12 h-12 md:-left-6 md:-top-4 md:w-16 md:h-16 z-0 opacity-50" />
              <p className="relative z-10 text-xl md:text-2xl text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed font-medium">
                "Writing in Marathi to empower the next generation of local entrepreneurs."
              </p>
            </div>

            {/* Refined Marathi Text with better spacing */}
            <div className="space-y-5 text-slate-600 dark:text-slate-400 mb-10 leading-loose text-base md:text-lg font-light tracking-wide">
              <p>
                मराठा समाजाला योग्य दिशा, स्पष्ट विचार आणि सकारात्मक दृष्टी देण्याच्या उद्देशाने हे साहित्य साकारले आहे. व्यावसायिक दृष्टिकोनातून समाजातील शेतकरी, उद्योजक, नोकरदार तसेच नव्या पिढीला योग्य विचारधारा मिळावी, हा या साहित्याचा मुख्य हेतू आहे.
              </p>
              <p>
                समाजात अनेकदा चुकत जाणारा दृष्टिकोन कसा सुधारता येईल, व्यावसायिक विचारसरणी कशी विकसित करावी आणि प्रत्येकाने आपल्या क्षेत्रात सक्षमपणे उभे राहावे, याचे मार्गदर्शन या साहित्यात अत्यंत सोप्या व समजण्यासारख्या भाषेत केले आहे.
              </p>
            </div>
            
            {/* Minimalist, Sleek Social Icons */}
            <div className="flex justify-center md:justify-start gap-4">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="group p-3 rounded-full border-2 border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 active:scale-95 bg-transparent hover:bg-orange-50 dark:hover:bg-slate-900">
                  <Icon size={20} className="transition-transform group-hover:-translate-y-1" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};