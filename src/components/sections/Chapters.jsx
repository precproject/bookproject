import React from 'react';
import { motion } from 'framer-motion';
import { Play, Feather, BookOpen } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';

export const Chapters = () => (
  <section id="chapters" className="py-20 md:py-24 bg-white dark:bg-slate-950">
    <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-12 lg:gap-16">
      <div className="w-full lg:w-1/3 text-center lg:text-left">
        <SectionHeading title="What's Inside?" subtitle="-" align="left" />
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm md:text-base">
          A comprehensive journey through 10 chapters, breaking down complex concepts into simple, actionable Marathi.
        </p>
        <Button variant="outline" className="w-full sm:w-auto lg:w-full justify-center">Download Full Index</Button>
      </div>
      <div className="w-full lg:w-2/3 grid gap-4">
        {[
          { num: "01", title: "The Psychology of Habits", sub: "सवयींचे मानसशास्त्र" },
          { num: "02", title: "Internal & External Triggers", sub: "ट्रिगर आणि कृती" },
          { num: "03", title: "Variable Rewards", sub: "अपेक्षित बक्षीस" },
          { num: "04", title: "The Investment Phase", sub: "गुंतवणूक" },
          { num: "05", title: "Building Local Products", sub: "स्थानिक उत्पादने तयार करणे" },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-orange-500 transition-all cursor-pointer gap-4 sm:gap-0">
            <div className="flex items-center gap-4 md:gap-6">
              <span className="text-3xl md:text-4xl font-bold text-slate-200 dark:text-slate-800 font-serif group-hover:text-orange-100 transition-colors">{c.num}</span>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{c.title}</h4>
                <p className="text-slate-500 text-xs md:text-sm mt-1">{c.sub}</p>
              </div>
            </div>
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-white dark:bg-slate-800 items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <Feather size={18} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
