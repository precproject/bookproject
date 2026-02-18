import React from 'react';
import { motion } from 'framer-motion';
import { Play, Feather, BookOpen } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';

export const Reviews = () => (
    <div>
        {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <SectionHeading title="Readers Love It" subtitle="Testimonials" />
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { name: "Rajesh Patil", role: "Startup Founder", review: "Finally a book that explains complex product psychology in simple Marathi. A must-read for every startup founder in Pune." },
              { name: "Sneha Deshmukh", role: "Product Manager", review: "The case studies are highly relatable. Santosh has done a phenomenal job translating Silicon Valley concepts for us." },
              { name: "Amit Joshi", role: "Student", review: "Not just for business, this book helped me build better personal study habits. Highly recommended!" }
            ].map((r, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-slate-800 p-8 rounded-3xl relative"
              >
                <div className="text-orange-500 mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                </div>
                <p className="text-slate-300 italic mb-8 leading-relaxed">"{r.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-xl text-orange-400">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{r.name}</h5>
                    <p className="text-sm text-slate-400">{r.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
</div>
);