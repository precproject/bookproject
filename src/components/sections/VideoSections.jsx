import { SectionHeading } from "../ui/SectionHeading";
import { motion } from 'framer-motion';
import { Play, Feather, BookOpen } from 'lucide-react';

export const VideoSections = () => (
      <section className="py-24 bg-orange-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 text-center">
          <SectionHeading title="Watch the Trailer" subtitle="Sneak Peek" />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl group cursor-pointer aspect-video bg-slate-800"
          >
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200" 
              alt="Video Thumbnail" 
              className="w-full h-full object-cover filter brightness-50 group-hover:brightness-40 transition-all duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Play className="ml-1 text-orange-600" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-left">
              <p className="text-white text-xs font-bold bg-orange-600 px-3 py-1 rounded-full inline-block mb-3">AUTHOR INTERVIEW</p>
              <h3 className="text-white text-2xl md:text-3xl font-serif">Why I wrote this book in Marathi?</h3>
            </div>
          </motion.div>
        </div>
      </section>
);
