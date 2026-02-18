import React from 'react';
import { motion } from 'framer-motion';
import { Star, Coffee, Users } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export const Features = () => {
  const features = [
    { title: "Practical Insights", marathi: "व्यावहारिक ज्ञान", desc: "Real-world examples tailored for the Indian market context.", icon: Star },
    { title: "Step-by-Step", marathi: "पाऊल-दर-पाऊल", desc: "Actionable blueprints to build your next big product or habit.", icon: Coffee },
    { title: "Psychology", marathi: "मानसशास्त्र", desc: "Understand human behavior and what drives our daily actions.", icon: Users },
  ];

  return (
    <section id="features" className="py-20 md:py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading title="In This Book" subtitle="What you will learn" align="center" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800 p-6 md:p-8 pt-10 md:pt-12 rounded-2xl relative group hover:bg-slate-700 transition-colors duration-300"
            >
              <div className="absolute -top-6 left-6 md:left-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-900 group-hover:bg-orange-500 transition-colors duration-300">
                <f.icon className="text-slate-900 group-hover:text-white transition-colors" size={20} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-1">{f.title}</h3>
              <p className="text-orange-400 text-xs md:text-sm mb-3 md:mb-4 font-serif">{f.marathi}</p>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};