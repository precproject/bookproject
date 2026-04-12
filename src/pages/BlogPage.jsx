import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Clock, Calendar, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Navbar } from '../components/sections/Navbar';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client';
import { useTranslation } from 'react-i18next'; // 👈 Import translation hook
import { Footer } from '../components/sections/Footer';

const CATEGORIES = ["All", "Technology", "Business", "Mindset", "Finance", "Marketing", "Education"];

export const BlogPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(); // 👈 Initialize translation

  // --- STATE ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // PERFORMANCE FIX
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

    // --- PERFORMANCE FIX: Debounce only the search input, not category clicks ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- REAL API FETCH ---
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch.trim() || undefined,
          category: activeCategory !== "All" ? activeCategory : undefined
        };

        const response = await apiClient.get('/blogs', { params });
        
        setPosts(response.data.blogs || []);
        setTotalPages(response.data.totalPages || 1);
        
        if (currentPage > response.data.totalPages && response.data.totalPages > 0) {
          setCurrentPage(response.data.totalPages);
        }

      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => { 
      fetchPosts(); 
    }, 400);

    return () => clearTimeout(timer);
    
  }, [activeCategory, debouncedSearch, currentPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      <main className="pt-20 pb-20">
        
        {/* --- HEADER SECTION (Made much more compact) --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-black text-slate-900 dark:text-white mb-2">
            {t('blog.headerTitle1', 'Insights &')} <span className="text-orange-600 dark:text-orange-500">{t('blog.headerTitle2', 'Stories')}</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-6">
            {t('blog.headerDesc', 'Discover articles on mindset, financial freedom, and building success.')}
          </p>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar snap-x">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all snap-start ${
                    activeCategory === cat 
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20 border border-orange-600' 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  {t(`blog.categories.${cat}`, cat)}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={t('blog.searchPlaceholder', 'Search articles...')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
              />
            </div>
          </div>
        </section>

        {/* --- ARTICLES GRID --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('blog.loading', 'Fetching latest articles...')}</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const authorInitial = post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'S';
                return (
                  <Link 
                    key={post._id} 
                    to={`/blog/${post.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-xl hover:shadow-orange-500/5 dark:hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {t(`blog.categories.${post.category}`, post.category)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3">
                        <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(post.publishedAt || post.createdAt).toLocaleDateString(t('locale', 'en-IN'), { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12}/> {post.readTime || '5 min'}</span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                        <div className="flex items-center gap-2">
                          {/* NO MOCK DATA: Native Fallback UI */}
                          {post.author?.avatar ? (
                            <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full bg-slate-100 object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                              {authorInitial}
                            </div>
                          )}
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.author?.name || 'Admin'}</span>
                        </div>
                        <span className="text-orange-600 dark:text-orange-500 flex items-center gap-1 text-xs font-bold group-hover:translate-x-1 transition-transform">
                          {t('blog.read', 'Read')} <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t('blog.emptyTitle', 'No articles found')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('blog.emptyDesc', 'Try adjusting your search query or selecting a different category.')}</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); setDebouncedSearch(''); }}
                className="mt-5 text-sm text-orange-600 font-bold hover:underline"
              >
                {t('blog.clearFilters', 'Clear all filters')}
              </button>
            </div>
          )}

          {/* --- PAGINATION --- */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1 px-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-orange-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>

      <Footer />

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};