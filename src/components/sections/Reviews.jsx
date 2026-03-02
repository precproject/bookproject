import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';

export const Reviews = () => {
  // A larger list of reviews to make the scrolling look full
  const reviews = [
    { name: "Sandeep R.", role: "Farmer & Entrepreneur", review: "हे पुस्तक वाचल्यानंतर माझ्या विचारांमध्ये खूप सकारात्मक बदल झाला आहे. खऱ्या अर्थाने चिंतामुक्तीचा मार्ग सापडला." },
    { name: "Priya D.", role: "Student", review: "The language is so simple and relatable. It feels like an elder guiding you through life's challenges." },
    { name: "Ramesh P.", role: "Businessman", review: "व्यावसायिक दृष्टिकोन कसा असावा याचे उत्तम मार्गदर्शन. प्रत्येक तरुणाने हे पुस्तक वाचायलाच हवे." },
    { name: "Anjali K.", role: "Teacher", review: "This book removes all the unnecessary clutter from your mind and helps you focus on what truly matters in daily life." },
    { name: "Vishal M.", role: "Shop Owner", review: "अत्यंत सोप्या भाषेत जीवनाचे तत्त्वज्ञान मांडले आहे. रोजच्या धकाधकीच्या जीवनात हे पुस्तक एक उत्तम मार्गदर्शक आहे." },
  ];

  // We duplicate the array so the scrolling loop is seamless
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section id="reviews" className="py-20 md:py-24 bg-slate-900 overflow-hidden transition-colors duration-300">
      
      {/* Container flex adjusted to push header to the left */}
      <div className="container mx-auto px-4 md:px-6 mb-12 flex justify-start dark:text-orange-500">
        <div className={`mb-12 md:mb-16 ${'left' === 'center' ? 'text-center' : 'text-left'}`}>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest text-xs md:text-sm block mb-2"
          >
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight"
          >
            Readers Love It
          </motion.h2>
        </div>
      </div>

      {/* The Scrolling Container */}
      <div className="relative flex overflow-x-hidden">
        {/* Gradient fades on the left and right edges for a professional look */}
        <div className="absolute top-0 bottom-0 left-0 w-24 md:w-48 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 md:w-48 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex flex-nowrap gap-6 md:gap-8 px-4"
        >
          {duplicatedReviews.map((r, i) => (
            <div 
              key={i} 
              className="bg-slate-800 p-6 md:p-8 rounded-3xl relative w-[300px] md:w-[400px] shrink-0"
            >
              <div className="text-orange-500 mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                </svg>
              </div>
              <p className="text-slate-300 italic mb-8 text-sm md:text-base leading-relaxed whitespace-normal">
                "{r.review}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-xl text-orange-400 shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm md:text-base">{r.name}</h5>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};