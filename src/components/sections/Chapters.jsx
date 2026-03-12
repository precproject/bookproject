import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Map, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Chapters = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const chaptersList = t('chapters.list', { returnObjects: true }) || [];

  // Prevent unnecessary recalculations
  const displayedChapters = useMemo(
    () => (showAll ? chaptersList : chaptersList.slice(0, 6)),
    [showAll, chaptersList]
  );

  const toggleChapter = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleToggleShowAll = () => {
    if (showAll && sectionRef.current) {
      const yOffset = -100;
      const y =
        sectionRef.current.getBoundingClientRect().top +
        window.scrollY +
        yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    setShowAll((prev) => !prev);
  };

  return (
    <section
      ref={sectionRef}
      id="chapters"
      className="relative py-20 md:py-32 overflow-hidden z-0"
    >
      {/* Background Glows */}
      <div className="absolute right-0 top-1/3 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute left-0 bottom-1/4 w-[300px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs md:text-sm font-mukta font-black uppercase tracking-widest mb-6 shadow-sm">
            <Map className="w-4 h-4" />
            {t('chapters.subtitle', 'अनुक्रमणिका')}
          </span>

          <h2 className="font-rozha text-4xl sm:text-5xl lg:text-6xl gold-gradient-text drop-shadow-sm dark:drop-shadow-none mb-4">
            {t('chapters.title', 'पुस्तकात काय आहे?')}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 font-mukta text-lg tracking-wide">
            {t(
              'chapters.description',
              '१५ प्रकरणे — प्रत्येक तुमच्या व्यावसायिक प्रवासासाठी महत्त्वाचे'
            )}
          </p>
        </motion.div>

        {/* TIMELINE */}
        <div className="relative pl-6 md:pl-10">
          
          {/* Vertical Line */}
          <div className="absolute top-4 bottom-4 left-[32px] md:left-[46px] w-[2px] bg-gradient-to-b from-amber-500 via-amber-500/20 to-transparent rounded-full" />

          <div className="flex flex-col gap-6 md:gap-8">
            <AnimatePresence initial={false}>
              {displayedChapters.map((chapter, i) => {
                const isExpanded = expandedIndex === i;
                const hasTopics =
                  chapter.topics && chapter.topics.length > 0;

                return (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="relative pl-12 md:pl-16 group"
                  >
                    {/* Timeline Node */}
                    <div
                      className={`absolute left-0 md:left-2 top-3 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-rozha font-bold text-base md:text-lg transition-all duration-300 z-10 ${
                        isExpanded
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40 scale-110 border border-orange-300/50'
                          : 'glass-card text-slate-500 dark:text-slate-400 group-hover:border-amber-400/50 group-hover:text-amber-500 dark:group-hover:text-amber-400'
                      }`}
                    >
                      {chapter.num}
                    </div>

                    {/* Chapter Card */}
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => hasTopics && toggleChapter(i)}
                      className={`relative p-6 md:p-8 rounded-2xl md:rounded-[2rem] transition-all duration-300 cursor-pointer glass-card ${
                        isExpanded
                          ? 'border-amber-400/50 shadow-[0_8px_30px_rgba(245,158,11,0.15)] bg-white/60 dark:bg-slate-800/60'
                          : 'hover:border-amber-400/30 hover:shadow-lg hover:-translate-y-1'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mukta text-[11px] md:text-xs font-black text-orange-600 dark:text-amber-500 mb-1.5 tracking-widest uppercase">
                            {chapter.sub}
                          </p>

                          <h4 className="font-rozha text-xl md:text-2xl text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                            {chapter.title}
                          </h4>
                        </div>

                        {hasTopics && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                            className="shrink-0 w-8 h-8 rounded-full glass-card flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors mt-1"
                          >
                            <ChevronDown size={18} strokeWidth={2.5} />
                          </motion.div>
                        )}
                      </div>

                      {/* Expanded Topics */}
                      <AnimatePresence>
                        {isExpanded && hasTopics && (
                          <motion.div
                            initial={{ opacity: 0, scaleY: 0.95 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{ transformOrigin: 'top' }}
                            className="pt-5 mt-5 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-2.5"
                          >
                            {chapter.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-sm md:text-[15px] font-mukta font-medium rounded-lg shadow-sm"
                              >
                                <Sparkles
                                  size={14}
                                  className="text-amber-500"
                                />
                                {topic}
                              </span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* SHOW MORE BUTTON */}
        {chaptersList.length > 6 && (
          <div className="mt-12 flex justify-center pl-4 md:pl-8">
            <button
              onClick={handleToggleShowAll}
              className="px-8 py-3.5 rounded-full glass-card font-mukta font-black text-xs md:text-sm uppercase tracking-widest transition-all flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:border-amber-400/50 hover:text-orange-600 dark:hover:text-amber-400 hover:shadow-md"
            >
              {showAll
                ? t('chapters.showLess', 'Collapse Journey')
                : t('chapters.showMore', 'Explore Full Journey')}

              <ChevronDown
                size={18}
                strokeWidth={2.5}
                className={`transition-transform duration-300 ${
                  showAll ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};