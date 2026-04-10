import React from 'react';
import { motion } from 'framer-motion';
import { BellRing, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PrebookBanner = ({ onOpenModal }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 pt-4 md:pt-8 relative z-20"
    >
      <div 
        onClick={onOpenModal}
        className="max-w-5xl mx-auto bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 rounded-2xl p-3 md:p-4 text-white shadow-[0_8px_30px_rgba(245,158,11,0.2)] cursor-pointer transform hover:-translate-y-1 transition-transform border border-orange-400/50 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-6 group relative overflow-hidden"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
            <BellRing size={20} className="animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
          <div className="text-left">
            <h4 className="font-rozha text-lg md:text-xl drop-shadow-sm leading-tight">
              {t('mainHero.bannerTitle', 'प्रतीक्षा संपली!')}
            </h4>
            <p className="font-mukta text-[13px] md:text-sm text-white/90 font-medium">
              {t('mainHero.bannerDesc', 'पुस्तकाचे प्री-बुकिंग आता सुरू झाले आहे. प्रथम येणाऱ्यास प्राधान्य.')}
            </p>
          </div>
        </div>
        
        <button className="w-full sm:w-auto whitespace-nowrap px-6 py-2.5 bg-white text-orange-600 rounded-full font-bold text-xs md:text-sm font-mukta tracking-widest uppercase hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md z-10">
          {t('mainHero.bannerBtn', 'आताच नोंदणी करा')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};