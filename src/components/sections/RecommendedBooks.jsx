import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { BookMarked, ExternalLink } from 'lucide-react';

export const RecommendedBooks = () => {
  // A curated list of books the author recommends
  const recommendations = [
    {
      id: 1,
      title: "Atomic Habits",
      author: "James Clear",
      marathiNote: "सवयी कशा बदलाव्यात याचे जागतिक स्तरावरील उत्तम पुस्तक.",
      cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
      link: "#"
    },
    {
      id: 2,
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      marathiNote: "आर्थिक साक्षरतेसाठी प्रत्येक तरुणाने वाचलेच पाहिजे.",
      cover: "https://images.unsplash.com/photo-1553729459-efe14ef20550?auto=format&fit=crop&q=80&w=400",
      link: "#"
    },
    {
      id: 3,
      title: "श्रीमंत होण्याचा मार्ग",
      author: "George S. Clason (Translated)",
      marathiNote: "संपत्ती कशी कमवावी आणि टिकवावी याचा उत्कृष्ट मराठी अनुवाद.",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
      link: "#"
    }
  ];

  return (
    <section id="recommended" className="py-24 md:py-32 bg-white dark:bg-slate-950 relative z-0">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 max-w-7xl mx-auto gap-6">
          <div className="md:w-2/3">
            <SectionHeading title="The Author's Bookshelf" subtitle="Recommended Reading" align="left" />
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed mt-4 max-w-2xl">
              While <i>चिंतामुक्ती</i> is the author's debut work, building a great mindset requires continuous learning. Here are a few foundational books that heavily inspired this journey.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400 pb-4">
            <BookMarked size={20} />
            <span className="text-sm font-medium uppercase tracking-widest">Curated List</span>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 max-w-7xl mx-auto">
          {recommendations.map((book, index) => (
            <motion.div 
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
              className="group flex flex-col"
            >
              {/* Premium 3D Book Cover Container */}
              <div className="relative w-full aspect-[3/4] mb-8 [perspective:1000px] flex justify-center">
                <div className="relative w-2/3 h-full rounded-r-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-3 group-hover:rotate-2 group-hover:shadow-[0_30px_50px_-15px_rgba(255,90,54,0.3)] border-l-[6px] border-slate-200 dark:border-slate-800 overflow-hidden">
                  
                  {/* Note: Replace these src links with real local assets if you have them */}
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                  />
                  
                  {/* Glossy lighting effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Book Details */}
              <div className="text-center px-4 flex-1 flex flex-col">
                <h4 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                  {book.title}
                </h4>
                <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-4">
                  By {book.author}
                </p>
                
                {/* Author's specific note/reason for recommending */}
                <div className="relative pt-4 mt-auto">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px bg-orange-200 dark:bg-orange-900" />
                  <p className="text-slate-600 dark:text-slate-400 italic text-sm md:text-base leading-relaxed">
                    "{book.marathiNote}"
                  </p>
                </div>

                {/* Optional: Link to buy the recommended book */}
                <a 
                  href={book.link} 
                  className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300"
                >
                  View Book <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};