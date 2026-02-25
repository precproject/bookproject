import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/sections/Navbar';
import { useTheme } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import apiClient from '../api/client';
import bookCoverImg from '../assets/cover.png'; // Fallback image

export const StorePage = () => {
  const { theme, toggleTheme } = useTheme();
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await apiClient.get('/public/books');
        setBooks(data || []);
      } catch (error) {
        console.error("Failed to load books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleAddToCart = (e, book) => {
    e.stopPropagation(); // Prevent navigating to the product page
    setAddingToCart(book._id);
    addToCart(book);
    setTimeout(() => {
      setAddingToCart(null);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      {/* Store Header */}
      <div className="pt-32 pb-12 md:pt-40 md:pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 dark:text-white mb-4 relative z-10"
        >
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">Collection</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg relative z-10"
        >
          Discover books that transform thinking and build lifelong habits.
        </motion.p>
      </div>

      {/* Book Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
            <p className="font-medium">Loading collection...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Shelf is Empty</h3>
            <p className="text-slate-500 dark:text-slate-400">We are currently restocking our books. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book, index) => (
              <motion.div 
                key={book._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/store/book/${book._id}`)}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(255,90,54,0.1)] transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Image Container with 3D hover effect */}
                <div className="relative w-full aspect-[3/4] mb-6 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden [perspective:1000px]">
                  <img 
                    src={book.coverImage || bookCoverImg} 
                    alt={book.title} 
                    className="w-2/3 h-auto object-cover shadow-xl group-hover:scale-105 group-hover:rotate-y-12 transition-transform duration-500 rounded-r-md border-l-4 border-slate-300 dark:border-slate-700" 
                  />
                  {book.type === 'Digital' && (
                    <span className="absolute top-3 right-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                      eBook
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{book.rating || "4.8"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{book.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{book.author || 'Author Name'}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900 dark:text-white">₹{book.price}</span>
                    <button 
                      onClick={(e) => handleAddToCart(e, book)}
                      disabled={addingToCart === book._id || (book.type === 'Physical' && book.stock < 1)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        addingToCart === book._id 
                          ? 'bg-green-500 text-white' 
                          : book.type === 'Physical' && book.stock < 1 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-500'
                      }`}
                    >
                      {addingToCart === book._id ? <CheckCircle size={18} /> : <ShoppingBag size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};