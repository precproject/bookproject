import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Map, Sparkles } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { useTranslation } from 'react-i18next';

export const Chapters = () => {
  const { t } = useTranslation();
  
  // Reference to the section top for smooth scroll restoration
  const sectionRef = useRef(null);
  
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const chaptersList = t('chapters.list', { returnObjects: true }) || [];
  const displayedChapters = showAll ? chaptersList : chaptersList.slice(0, 6);

  const toggleChapter = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // The Magic Fix: Intelligently manage scroll position when collapsing
  const handleToggleShowAll = () => {
    if (showAll) {
      // If we are about to "Show Less", scroll smoothly back to the top of this section first
      if (sectionRef.current) {
        const yOffset = -100; // Offset to account for your fixed Navbar
        const y = sectionRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    // Toggle the state
    setShowAll(!showAll);
  };

  return (
    <section ref={sectionRef} id="chapters" className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        {/* Header with Roadmap Metaphor */}
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest mb-4">
            <Map size={14} /> {t('chapters.subtitle', 'The Journey')}
          </div>
          <SectionHeading 
            title={t('chapters.title', "What's Inside?")} 
            subtitle="" 
            align="center" 
          />
        </div>

        {/* --- THE ROADMAP TIMELINE --- */}
        <div className="relative pl-4 md:pl-8">
          
          {/* The Continuous Vertical Line */}
          <div className="absolute top-4 bottom-4 left-[27px] md:left-[43px] w-[2px] bg-gradient-to-b from-orange-500/50 via-slate-200 dark:via-slate-800 to-transparent rounded-full" />

          {/* layout prop here ensures smooth height transitions for the whole list */}
          <motion.div layout className="flex flex-col gap-6 md:gap-8">
            <AnimatePresence initial={false}>
              {displayedChapters.map((chapter, i) => {
                const isExpanded = expandedIndex === i;
                const hasTopics = chapter.topics && chapter.topics.length > 0;

                return (
                  <motion.div 
                    layout="position"
                    key={i} 
                    initial={{ opacity: 0, x: -20, scale: 0.95 }} 
                    animate={{ opacity: 1, x: 0, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: showAll ? 0 : i * 0.05 }} // Faster exit, staggered entry
                    className="relative pl-10 md:pl-16 group"
                  >
                    {/* Timeline Node (Chapter Number) */}
                    <div className={`absolute left-0 md:left-3 top-3 w-10 h-10 md:w-12 md:h-12 rounded-full border-4 flex items-center justify-center font-bold font-serif text-sm md:text-base transition-all duration-300 z-10 ${
                      isExpanded 
                        ? 'bg-orange-600 border-orange-100 dark:border-orange-900/30 text-white shadow-lg shadow-orange-500/30 scale-110' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 group-hover:border-orange-200 dark:group-hover:border-orange-500/30 group-hover:text-orange-500'
                    }`}>
                      {chapter.num}
                    </div>

                    {/* Interactive Chapter Card */}
                    <div 
                      onClick={() => hasTopics && toggleChapter(i)}
                      className={`relative p-5 md:p-6 rounded-2xl md:rounded-3xl border transition-all duration-300 ${hasTopics ? 'cursor-pointer' : ''} ${
                        isExpanded
                          ? 'bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-500/30 shadow-xl shadow-slate-200/40 dark:shadow-none'
                          : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-500/30 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs md:text-sm font-bold text-orange-500 dark:text-orange-400 mb-1 tracking-wider uppercase">
                            {chapter.sub}
                          </p>
                          <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            {chapter.title}
                          </h4>
                        </div>
                        
                        {/* Expand Icon */}
                        {hasTopics && (
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 bg-slate-50 dark:bg-slate-800 text-slate-400 ${isExpanded ? 'rotate-180 bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-500'}`}>
                            <ChevronDown size={18} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      {/* --- COMPACT TAG CLOUD FOR SUBTOPICS --- */}
                      <AnimatePresence>
                        {isExpanded && hasTopics && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                              {chapter.topics.map((topic, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[13px] md:text-sm rounded-lg font-medium"
                                >
                                  <Sparkles size={12} className="text-orange-400" />
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Action Button: Show More / Show Less */}
        {chaptersList.length > 6 && (
          <motion.div layout className="mt-12 flex justify-center pl-4 md:pl-8">
            <button
              onClick={handleToggleShowAll}
              className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest border-2 transition-all flex items-center gap-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-orange-600 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-slate-900 shadow-sm active:scale-95"
            >
              {showAll ? t('chapters.showLess', 'Collapse Journey') : t('chapters.showMore', 'Explore Full Journey')}
              <ChevronDown size={18} strokeWidth={2.5} className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
};