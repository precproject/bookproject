import React from 'react';
import { motion } from 'framer-motion';
import { Play, Feather, BookOpen } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';

export const VideoSection = () => (
  <section className="py-20 md:py-24 bg-orange-50 dark:bg-slate-900/50">
    <div className="container mx-auto px-4 md:px-6 text-center">
      <SectionHeading title="Watch the Trailer" subtitle="Sneak Peek" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        className="relative w-full max-w-4xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group cursor-pointer aspect-video bg-slate-800"
      >
        <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200" alt="Video" className="w-full h-full object-cover filter brightness-50 group-hover:brightness-40 transition-all duration-500"/>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Play className="ml-1 text-orange-600 w-5 md:w-6" fill="currentColor" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);




