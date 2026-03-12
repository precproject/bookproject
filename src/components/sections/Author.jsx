import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Instagram, Facebook, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import authorImage from '../../assets/author.png';


/* ---------------- PEN WRITING TEXT EFFECT (MARATHI SAFE) ---------------- */

const letterContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04
    }
  }
};

const letter = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ease: "easeOut", duration: 0.25 }
  }
};

const AnimatedText = ({ text }) => {

  let characters = [];

  try {
    const segmenter = new Intl.Segmenter('mr', { granularity: 'grapheme' });
    characters = Array.from(segmenter.segment(text)).map(s => s.segment);
  } catch {
    characters = text.split("");
  }

  return (
    <motion.span
      variants={letterContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="inline-flex flex-wrap items-baseline"
    >
      {characters.map((char, i) => (
        <motion.span
          key={i}
          variants={letter}
          className="inline-block align-baseline will-change-transform"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};


/* ---------------- AUTHOR COMPONENT ---------------- */

export const Author = () => {
  const { t } = useTranslation();

  return (
    <section
      id="author"
      className="py-16 md:py-24 lg:py-32 relative overflow-hidden z-0 transition-colors duration-300"
    >

      {/* BACKGROUND ELEMENTS */}

      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-orange-100/40 dark:bg-orange-900/10 rounded-full blur-3xl -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-lighten" />

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-100 dark:bg-slate-800/30 rounded-full blur-3xl -z-10 pointer-events-none" />


      {/* MAIN CONTAINER */}

      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24 lg:gap-32 max-w-7xl relative z-10">


        {/* ---------------- MOBILE HEADER ---------------- */}

        <div className="md:hidden text-center w-full flex flex-col items-center mb-4">

          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-mukta font-bold uppercase tracking-widest shadow-sm">
            <AnimatedText text={t('author.sectionLabel', 'लेखक')} />
          </span>

          <h3 className="text-3xl sm:text-4xl gold-gradient-text drop-shadow-sm dark:drop-shadow-none font-rozha font-bold py-1 w-full leading-[1.25]">
            <AnimatedText text={t('author.name', 'कैलासराव तुकाराम तुरकणे पाटील')} />
          </h3>

        </div>


        {/* ---------------- IMAGE ---------------- */}

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-[80%] max-w-[280px] mx-auto md:max-w-none md:w-2/5 lg:w-1/3 relative group shrink-0"
        >

          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent dark:from-orange-500/10 blur-2xl rounded-[30px] transform rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-700" />

          <div className="relative rounded-[30px] overflow-hidden shadow-[0_20px_50px_-20px_rgba(249,115,22,0.3)] dark:shadow-[0_20px_50px_-20px_rgba(249,115,22,0.15)] ring-1 ring-slate-100 dark:ring-slate-800/50">

            <img
              src={authorImage}
              alt={t('author.name')}
              loading="lazy"
              className="w-full object-cover object-top aspect-[4/5] scale-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none mix-blend-overlay"></div>

          </div>

        </motion.div>


        {/* ---------------- TEXT CONTENT ---------------- */}

        <div className="w-full md:w-3/5 lg:w-3/5 text-center md:text-left mt-8 md:mt-0">


          {/* DESKTOP HEADER */}

          <div className="hidden md:block mb-8">

            <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-mukta font-bold uppercase tracking-widest shadow-sm">
              <AnimatedText text={t('author.sectionLabel', 'लेखक')} />
            </span>

            <h3 className="gold-gradient-text drop-shadow-sm dark:drop-shadow-none py-2 text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[3rem] font-rozha font-bold leading-[1.15] whitespace-nowrap tracking-tight">
              <AnimatedText text={t('author.name', 'कैलासराव तुकाराम तुरकणे पाटील')} />
            </h3>

          </div>


          {/* QUOTE */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative mb-6 md:mb-8 p-2 md:p-0"
          >

            <Quote className="absolute -top-4 -left-2 text-orange-200 dark:text-orange-900/30 w-12 h-12 md:-left-8 md:-top-4 md:w-16 md:h-16 z-0 opacity-50" />

            <p className="relative z-10 text-[1.1rem] md:text-xl lg:text-2xl text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed font-medium">
              "{t('author.quote')}"
            </p>

          </motion.div>


          {/* PARAGRAPHS */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4 md:space-y-5 text-slate-600 dark:text-slate-400 mb-8 leading-loose text-sm md:text-[1.05rem] font-mukta tracking-wide max-w-2xl mx-auto md:mx-0 text-left px-4 md:px-0"
          >
            <p>{t('author.para1')}</p>
            <p>{t('author.para2')}</p>
          </motion.div>


          {/* SOCIAL ICONS */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center md:justify-start gap-4"
          >

            {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (

              <a
                key={i}
                href="#"
                aria-label="Social Link"
                className="group p-3 md:p-3.5 rounded-full border-2 border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-white transition-all duration-300 active:scale-95 bg-transparent hover:bg-orange-500 dark:hover:bg-orange-500 shadow-sm"
              >

                <Icon
                  size={18}
                  className="md:w-5 md:h-5 transition-transform group-hover:-translate-y-1"
                />

              </a>

            ))}

          </motion.div>

        </div>

      </div>

    </section>
  );
};