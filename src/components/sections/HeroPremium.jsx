import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import bookCoverImg from '../../assets/cover.png'; // Ensure this path is correct

export const HeroPremium = ({ onOrderClick }) => {
  return (
    <section className="relative w-full overflow-hidden font-serif">
      {/* --- Top Light Section --- */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-50 dark:to-slate-100 pt-24 pb-20 lg:pt-32 lg:pb-24 px-4 md:px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
            
            {/* Text Content */}
            <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-orange-600 dark:text-orange-500 font-semibold uppercase tracking-wider mb-2"
              >
                — The Definitive Guide
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight text-slate-900 dark:text-slate-800"
              >
                Success Is A
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-[#FF5A36]">
                  Habit.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                Discover the art of building habits that stick, written specifically for the modern Marathi entrepreneur.
              </motion.p>
            </div>

            {/* 3D Book Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 flex justify-center [perspective:1200px] order-1 lg:order-2"
            >
              <div className="relative group w-[280px] h-[420px] sm:w-[360px] sm:h-[540px] md:w-[440px] md:h-[660px]">
                <div className="absolute inset-0 bg-white dark:bg-slate-200 rounded-r-2xl shadow-2xl transition-all duration-500 group-hover:-translate-y-2 lg:group-hover:-translate-y-4 group-hover:rotate-2 group-hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-l-[8px] border-slate-300 dark:border-slate-400 overflow-hidden">
                  <img
                    src={bookCoverImg}
                    alt="Book Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </div>

      {/* --- Bottom Dark Section --- */}
      <div className="bg-[#151515] dark:bg-[#080808] py-16 lg:py-20 px-4 md:px-6 relative z-0">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
            
            {/* Secondary Headline */}
            <div className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight"
              >
                eBook Version is Available.
              </motion.h2>
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-1/2 flex justify-center lg:justify-end order-1 lg:order-2"
            >
              <Button
                variant="primary"
                icon={ChevronRight}
                onClick={onOrderClick}
                className="w-full sm:w-auto px-8 py-4 text-lg"
              >
                Order Hardcopy
              </Button>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};