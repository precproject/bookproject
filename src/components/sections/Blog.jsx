import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, Play, Headphones, FileText } from 'lucide-react';

export const Blog = () => {
  // Added a 'type' field to differentiate the content
  const articles = [
    {
      id: 1,
      type: "text",
      image: "https://images.unsplash.com/photo-1505934333218-8fe21ff8cece?auto=format&fit=crop&q=80&w=800",
      category: "Mindset",
      title: "सकारात्मक विचार कसे वाढवावे? (How to cultivate positive thinking?)",
      excerpt: "दैनंदिन जीवनात येणाऱ्या अडचणींवर मात करून आपले मन शांत आणि सकारात्मक कसे ठेवायचे याच्या सोप्या पद्धती.",
      date: "Feb 10, 2026"
    },
    {
      id: 2,
      type: "video",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      category: "Interview",
      title: "लेखकांसोबत खास बातचीत (Exclusive Author Interview)",
      excerpt: "चिंतामुक्ती हे पुस्तक लिहिण्यामागचा प्रवास आणि त्यातील महत्त्वाचे विचार कैलासराव पाटील यांच्या शब्दात ऐका.",
      date: "Feb 05, 2026"
    },
    {
      id: 3,
      type: "audio",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800",
      category: "Podcast",
      title: "Episode 1: व्यवसायातील ताण कसा हाताळावा?",
      excerpt: "या पॉडकास्टमध्ये आपण जाणून घेणार आहोत की उद्योजकांनी आणि नोकरदारांनी आपल्या कामातील ताणतणाव कसा कमी करावा.",
      date: "Jan 28, 2026"
    }
  ];

  // A simple helper to get the correct icon and text based on the media type
  const getTypeConfig = (type) => {
    switch(type) {
      case 'video': return { icon: Play, action: "Watch Video" };
      case 'audio': return { icon: Headphones, action: "Listen to Podcast" };
      case 'text':
      default: return { icon: FileText, action: "Read Article" };
    }
  };

  return (
    <section id="blog" className="py-20 md:py-24 bg-orange-50 dark:bg-slate-900/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <SectionHeading title="Latest Content" subtitle="Blog & Media" align="left" />
          <a href="#" className="hidden md:flex items-center gap-2 text-orange-600 dark:text-orange-500 font-bold hover:gap-3 transition-all mb-4 md:mb-16">
            View all content <ArrowRight size={20} />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => {
            const { icon: TypeIcon, action } = getTypeConfig(article.type);

            return (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 group cursor-pointer flex flex-col h-full"
              >
                {/* Image Container with Dynamic Media Overlays */}
                <div className="overflow-hidden relative h-56 shrink-0 bg-slate-900">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 ${article.type !== 'text' ? 'opacity-70 group-hover:opacity-50' : ''}`}
                  />
                  
                  {/* Top Left Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide shadow-sm z-10">
                    {article.category}
                  </div>

                  {/* Top Right Media Type Icon */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full z-10">
                    <TypeIcon size={16} />
                  </div>

                  {/* Centered Play/Listen Button (Only for Video/Audio) */}
                  {article.type !== 'text' && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-16 h-16 bg-orange-600/90 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <TypeIcon size={28} className={article.type === 'video' ? 'ml-1' : ''} fill={article.type === 'video' ? 'currentColor' : 'none'} />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content Container */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <p className="text-slate-400 dark:text-slate-500 text-sm mb-3 font-medium">
                    {article.date}
                  </p>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm md:text-base leading-relaxed line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  
                  {/* Dynamic Action Link */}
                  <div className="mt-auto flex items-center gap-2 text-orange-600 dark:text-orange-500 font-medium group-hover:gap-3 transition-all pt-4 border-t border-slate-100 dark:border-slate-700">
                    {action} <ArrowRight size={18} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-10 md:hidden flex justify-center">
          <a href="#" className="flex items-center gap-2 text-orange-600 dark:text-orange-500 font-bold hover:gap-3 transition-all bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            View all content <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};