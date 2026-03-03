import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, Play, Headphones, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

export const Blog = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest 3 articles from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await apiClient.get('/blogs', { params: { limit: 3 } });
        setArticles(response.data.blogs || []);
      } catch (error) {
        console.error("Failed to load blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Helper to configure UI based on content type (text, video, audio)
  const getTypeConfig = (type) => {
    switch(type) {
      case 'video': return { icon: Play, action: t('homeBlog.actionVideo') };
      case 'audio': return { icon: Headphones, action: t('homeBlog.actionAudio') };
      case 'text':
      default: return { icon: FileText, action: t('homeBlog.actionText') };
    }
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section id="blog" className="py-24 bg-slate-50 dark:bg-slate-900/40 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* --- FIXED HEADER SECTION --- 
            Now perfectly split: Title on left, Link on right 
        */}
        <div className="flex flex-row justify-between items-end mb-12 md:mb-16">
          <SectionHeading 
            title={t('homeBlog.title')} 
            subtitle={t('homeBlog.subtitle')} 
            align="left" 
          />
          <Link 
            to="/blog" 
            className="flex items-center self-center  gap-2 text-orange-600 dark:text-orange-500 font-bold hover:gap-3 transition-all text-sm md:text-base mb-4 md:mb-12"
          >
            {t('homeBlog.viewAll')} <ArrowRight size={20} />
          </Link>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Skeleton Loader for Premium Experience */}
          {loading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col animate-pulse">
                <div className="h-56 bg-slate-200 dark:bg-slate-700 w-full shrink-0"></div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 w-1/4 rounded mb-4"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 w-full rounded mb-3"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 w-5/6 rounded mb-6"></div>
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 w-full rounded"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 w-full rounded"></div>
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 w-1/3 rounded mt-auto"></div>
                </div>
              </div>
            ))
          ) : articles.length > 0 ? (
            articles.map((article, index) => {
              // Extract config, fallback to 'text' if article.type is missing
              const { icon: TypeIcon, action } = getTypeConfig(article.type || 'text');
              // Fallback image if coverImage is not present
              const displayImage = article.coverImage || "https://images.unsplash.com/photo-1505934333218-8fe21ff8cece?auto=format&fit=crop&q=80&w=800";

              return (
                <Link 
                  to={`/blog/${article.slug}`} 
                  key={article._id}
                  className="block h-full outline-none"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 group cursor-pointer flex flex-col h-full hover:border-orange-500/30 transition-colors duration-300"
                  >
                    {/* Image Container with Dynamic Media Overlays */}
                    <div className="overflow-hidden relative h-56 shrink-0 bg-slate-100 dark:bg-slate-900">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title} 
                        className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 ${article.type && article.type !== 'text' ? 'opacity-80 group-hover:opacity-60' : ''}`}
                      />
                      
                      {/* Top Left Category Badge */}
                      {article.category && (
                        <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest shadow-sm z-10 border border-slate-100 dark:border-slate-800">
                          {article.category}
                        </div>
                      )}

                      {/* Top Right Media Type Icon */}
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2 rounded-full z-10">
                        <TypeIcon size={16} strokeWidth={2.5} />
                      </div>

                      {/* Centered Play/Listen Button (Only for Video/Audio) */}
                      {article.type && article.type !== 'text' && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(234,88,12,0.4)] transform group-hover:scale-110 transition-transform duration-300">
                            <TypeIcon size={28} className={article.type === 'video' ? 'ml-1' : ''} fill={article.type === 'video' ? 'currentColor' : 'none'} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Container */}
                    <div className="p-6 md:p-8 flex flex-col flex-1 bg-white dark:bg-slate-900 transition-colors">
                      <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest mb-3 font-bold">
                        {formatDate(article.createdAt)}
                      </p>
                      
                      <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      
                      {/* Parse raw excerpt to plain text to remove any accidentally leaked HTML tags */}
                      <p className="text-slate-600 dark:text-slate-400 mb-6 text-[15px] leading-relaxed line-clamp-3 flex-1">
                        {article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '') : ''}
                      </p>
                      
                      {/* Dynamic Action Link */}
                      <div className="mt-auto flex items-center gap-2 text-orange-600 dark:text-orange-500 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all pt-5 border-t border-slate-100 dark:border-slate-800">
                        {action} <ArrowRight size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
              {t('homeBlog.noArticles')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};