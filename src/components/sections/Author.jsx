import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

import authorImage from '../../assets/author.png';

export const Author = () => {
  return (
    <section id="author" className="py-20 md:py-24 bg-white dark:bg-slate-950">
      {/* Changes made here: 
        1. Added 'justify-between' to push items apart.
        2. Increased gap to 'gap-16 md:gap-20 lg:gap-32' for a much wider space.
      */}
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-16 md:gap-20 lg:gap-32 max-w-6xl">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-3/4 sm:w-1/2 md:w-2/5 lg:w-1/3 relative px-4 md:px-0"
        >
          <div className="absolute inset-0 bg-orange-200 dark:bg-orange-900/30 transform translate-x-4 translate-y-4 rounded-2xl" />
          <img 
            src={authorImage}
            alt="Author" 
            className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/5] hover:grayscale-0 transition-all duration-500" 
          />
        </motion.div>
        
        {/* Adjusted the width here to ensure it doesn't stretch too far left */}
        <div className="w-full md:w-3/5 lg:w-3/5 text-center md:text-left mt-8 md:mt-0">
          <SectionHeading title="About the Author" subtitle="" align="left" />
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
            - कैलासराव तुकाराम तुरकणे पाटील
          </h3>
          <p className="text-base md:text-lg text-orange-600 dark:text-orange-400 mb-6 italic font-serif">
            "Writing in Marathi to empower the next generation of local entrepreneurs."
          </p>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
            <p>
              मराठा समाजाला योग्य दिशा, स्पष्ट विचार आणि सकारात्मक दृष्टी देण्याच्या उद्देशाने हे साहित्य साकारले आहे. व्यावसायिक दृष्टिकोनातून समाजातील शेतकरी, उद्योजक, नोकरदार तसेच नव्या पिढीला योग्य विचारधारा मिळावी, हा या साहित्याचा मुख्य हेतू आहे.
              समाजात अनेकदा चुकत जाणारा दृष्टिकोन कसा सुधारता येईल, व्यावसायिक विचारसरणी कशी विकसित करावी आणि प्रत्येकाने आपल्या क्षेत्रात सक्षमपणे उभे राहावे, याचे मार्गदर्शन या साहित्यात अत्यंत सोप्या व समजण्यासारख्या भाषेत केले आहे. यासाठी कोणत्याही अतिरिक्त मार्गदर्शकाची आवश्यकता भासत नाही.
              या साहित्यातील सर्व उदाहरणे व अनुभव पूर्णतः वास्तवावर आधारित आहेत. अनावश्यक, काल्पनिक किंवा अप्रासंगिक बाबी वगळून केवळ उपयोगी, व्यवहार्य आणि प्रेरणादायी विचार मांडले आहेत.
            </p>
            <p>
              या लिखाणामुळे एखादी मोठी चळवळ उभी राहील असा दावा नसला, तरी समाजामध्ये सकारात्मक विचारांची जाणीव, आत्मविश्वास आणि व्यावसायिक जागृती निर्माण होईल, असा लेखकाचा ठाम विश्वास आहे. हेच या साहित्याचे खरे यश ठरेल.
            </p>
          </div>
          
          <div className="flex justify-center md:justify-start gap-4">
            {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 transition-all text-slate-600 dark:text-slate-300">
                <Icon size={18} className="md:w-5 md:h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};