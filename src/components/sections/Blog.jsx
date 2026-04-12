import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Headphones, FileText, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

export const Blog = () => {
  const { t, i18n } = useTranslation();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getTypeConfig = (type) => {
    switch (type) {
      case 'video':
        return { icon: Play, action: t('homeBlog.actionVideo', 'Watch Video') };
      case 'audio':
        return { icon: Headphones, action: t('homeBlog.actionAudio', 'Listen to Audio') };
      default:
        return { icon: FileText, action: t('homeBlog.actionText', 'Read Article') };
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const locale = i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  return (
    <section
      id="blog"
      className="relative py-20 md:py-32 overflow-hidden z-0"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2 -z-10" />

      {/* FIX: Removed max-w-7xl so it aligns perfectly with the Hero and Features sections */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* HEADER: Perfectly aligned left to right */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6"
        >
          <div>
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs md:text-sm font-mukta font-bold uppercase tracking-widest shadow-sm">
              {t('homeBlog.badge', 'ब्लॉग आणि मीडिया')}
            </span>

            <h2 className="font-rozha text-4xl sm:text-5xl lg:text-6xl gold-gradient-text drop-shadow-sm dark:drop-shadow-none leading-tight">
              {t('homeBlog.title', 'नवीनतम लेख आणि विचार')}
            </h2>
          </div>

          <Link
            to="/blog"
            className="flex items-center gap-2 text-orange-600 dark:text-amber-400 hover:text-orange-700 dark:hover:text-amber-300 font-mukta font-bold uppercase tracking-wider text-sm md:text-base transition-colors group mb-2"
          >
            {t('homeBlog.viewAll', 'View All')}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="glass-card rounded-[2rem] h-[400px] animate-pulse"
              />
            ))
          ) : articles.length > 0 ? (
            articles.map((article, index) => {
              const { icon: TypeIcon, action } = getTypeConfig(article.type || 'text');
              const displayImage = article.featuredImage || article.coverImage || "https://images.unsplash.com/photo-1505934333218-8fe21ff8cece?auto=format&fit=crop&q=80&w=800";

              return (
                <Link
                  to={`/blog/${article.slug}`}
                  key={article._id}
                  className="block h-full outline-none"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group glass-card rounded-[2rem] overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:border-amber-500/30 transition-all duration-500 flex flex-col h-full"
                  >
                    
                    {/* IMAGE */}
                    <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={displayImage}
                        alt={article.title}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${article.type && article.type !== 'text' ? 'opacity-90 group-hover:opacity-75' : ''}`}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                      {/* CATEGORY */}
                      {article.category && (
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 shadow-sm z-10">
                          <Tag className="w-3 h-3 text-orange-600 dark:text-amber-400" />
                          <span className="text-[11px] font-black font-mukta text-slate-800 dark:text-amber-300 uppercase tracking-widest">
                            {article.category}
                          </span>
                        </div>
                      )}

                      {/* RESTORED: Centered Play/Listen Button for Media */}
                      {article.type && article.type !== 'text' && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(245,158,11,0.4)] transform group-hover:scale-110 transition-transform duration-300">
                            <TypeIcon size={24} className={article.type === 'video' ? 'ml-1' : ''} fill={article.type === 'video' ? 'currentColor' : 'none'} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-[11px] font-bold font-mukta text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {formatDate(article.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-rozha text-xl md:text-2xl text-slate-900 dark:text-slate-100 mb-3 group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-sm md:text-[15px] font-mukta text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-1">
                        {article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '') : ''}
                      </p>

                      <div className="mt-auto flex items-center gap-2 text-orange-600 dark:text-amber-400 font-mukta text-[13px] font-black uppercase tracking-widest pt-5 border-t border-slate-200/50 dark:border-slate-700/50">
                        {action}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>

                    </div>
                  </motion.article>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 font-mukta">
              {t('homeBlog.noArticles', 'No articles published yet.')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};