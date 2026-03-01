import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Clock, Calendar, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Navbar } from '../components/sections/Navbar';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client'; // 👈 Import your API client

// Dynamic Categories (You can also fetch these from the backend if you want them to be truly dynamic)
const CATEGORIES = ["All", "Technology", "Business", "Mindset", "Finance", "Marketing", "Education"];

export const BlogPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // --- STATE ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // --- REAL API FETCH ---
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      try {
        // Build the query parameters to send to the backend
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery.trim() || undefined,
          category: activeCategory !== "All" ? activeCategory : undefined
        };

        // Call the public blogs endpoint
        const response = await apiClient.get('/blogs', { params });
        
        // Update state with real data
        setPosts(response.data.blogs || []);
        setTotalPages(response.data.totalPages || 1);
        
        // Failsafe: If current page is suddenly higher than total pages (due to a filter), reset it.
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

    // Debounce search so we don't spam the API on every keystroke
    const timer = setTimeout(() => { 
      fetchPosts(); 
    }, 400);

    return () => clearTimeout(timer);
    
  }, [activeCategory, searchQuery, currentPage]);

  // Handle Search Input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  // Handle Category Click
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSearchQuery(""); // Clear search when switching categories
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      <main className="pt-24 pb-20">
        
        {/* --- HEADER SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white mb-4">
            Insights & <span className="text-orange-600 dark:text-orange-500">Stories</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Discover articles on entrepreneurship, technology, financial freedom, and building cooperative success in the modern age.
          </p>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            
            {/* Category Pills (Scrollable on Mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar snap-x">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all snap-start ${
                    activeCategory === cat 
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20 border border-orange-600' 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
              />
            </div>
          </div>
        </section>

        {/* --- ARTICLES GRID --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Fetching latest articles...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link 
                  key={post._id} // 👈 Note: Changed to _id for MongoDB compatibility
                  to={`/blog/${post.slug}`}
                  className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-xl hover:shadow-orange-500/5 dark:hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14}/> {post.readTime}</span>
                    </div>

                    {/* Title & Excerpt */}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Footer (Author & Read More) */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <div className="flex items-center gap-3">
                        <img src={post.author?.avatar || 'https://via.placeholder.com/50'} alt={post.author?.name} className="w-8 h-8 rounded-full bg-slate-100 object-cover" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{post.author?.name || 'Admin'}</span>
                      </div>
                      <span className="text-orange-600 dark:text-orange-500 flex items-center gap-1 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Read <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No articles found</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your search query or selecting a different category.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="mt-6 text-orange-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* --- PAGINATION --- */}
          {!loading && totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-2 px-4">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-orange-600 text-white shadow-md' 
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
                className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

      </main>

      {/* Scoped CSS to hide scrollbar on category pills for mobile */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};