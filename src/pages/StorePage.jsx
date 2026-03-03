import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, BookOpen, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Components
import { Navbar } from '../components/sections/Navbar';
import { Footer } from '../components/sections/Footer'; 

// Context & API
import { useTheme } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import apiClient from '../api/client';

// Assets
import bookCoverImg from '../assets/cover.png'; 

export const StorePage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  
  // Safely extract cart state alongside addToCart
  const { addToCart, cart, cartItems } = useContext(CartContext);
  const activeCart = cart || cartItems || []; // Safe fallback depending on your context structure

  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

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
    // CRITICAL FIX: Stop both default behavior and event bubbling
    e.preventDefault();
    e.stopPropagation(); 
    
    // Safety check just in case the disabled attribute is bypassed
    if (book.type === 'Physical' && (book.stock === undefined || book.stock <= 0)) {
      return;
    }

    setAddingToCart(book._id);
    addToCart(book);
    
    setTimeout(() => {
      setAddingToCart(null);
    }, 600);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
  };

  const getSafeImageUrl = (book) => {
    if (!book.coverImage) return bookCoverImg; // Catches null, undefined
    if (book.coverImage.trim() === '') return bookCoverImg; // Catches empty strings
    return book.coverImage;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors duration-300 flex flex-col font-sans">
      

      <Navbar theme={theme} setTheme={toggleTheme} />

      <main className="flex-grow flex flex-col">
        
        <div className="pt-28 pb-8 md:pt-32 md:pb-12 px-6 text-center relative overflow-hidden shrink-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-slate-900 dark:text-white mb-4 relative z-10 tracking-tight"
          >
            {t('store.headerTitle1', 'आमचा')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 drop-shadow-sm">{t('store.headerTitle2', 'संग्रह')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg relative z-10 font-medium"
          >
            {t('store.headerDesc', 'विचार बदलणारी आणि आयुष्यभर टिकणाऱ्या सवयी निर्माण करणारी पुस्तके शोधा.')}
          </motion.p>
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 flex-grow">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
              <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
              <p className="font-medium">{t('store.loading', 'संग्रह लोड होत आहे...')}</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-3xl mx-auto">
              <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('store.emptyTitle', 'शेल्फ रिकामा आहे')}</h3>
              <p className="text-slate-500 dark:text-slate-400">{t('store.emptyDesc', 'आम्ही सध्या आमची पुस्तके रिस्टॉक करत आहोत. लवकरच पुन्हा भेट द्या!')}</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {books.map((book) => {
                // Determine stock status safely
                const isOutOfStock = book.type === 'Physical' && (book.stock === undefined || book.stock <= 0);

                // Check if book is already in cart to dynamically change the button
                const cartItem = activeCart.find(item => item._id === book._id || item.bookId === book._id);
                const inCartQty = cartItem ? (cartItem.quantity || 1) : 0;

                return (
                  <motion.div 
                    key={book._id}
                    variants={itemVariants}
                    onClick={() => navigate(`/store/book/${book._id}`)}
                    className="group bg-transparent rounded-3xl cursor-pointer flex flex-col h-full"
                  >
                    
                    <div className="w-full bg-[#f4f4f6] dark:bg-slate-800/60 rounded-[2rem] p-6 sm:p-8 mb-5 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:bg-[#ebebef] dark:group-hover:bg-slate-800/80 [perspective:1200px]">
                      
                      <div className="relative z-10 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] transform group-hover:-translate-y-3 group-hover:rotate-y-12 transition-all duration-500 ease-out">
                        <img 
                          src={getSafeImageUrl(book)}
                          alt={book.title || book.name} 
                          loading="lazy"
                          className={`w-full h-auto object-cover rounded-r-md rounded-l-sm shadow-[0_15px_35px_rgba(0,0,0,0.25)] border-slate-300 dark:border-slate-600 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} 
                        />
                        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent rounded-l-sm pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent mix-blend-overlay rounded-r-md pointer-events-none" />
                        <div className="absolute -bottom-3 left-2 right-2 h-3 bg-black/40 blur-md rounded-[100%] -z-10 group-hover:blur-lg group-hover:opacity-70 transition-all duration-500" />
                      </div>

                      {book.type === 'Digital' && (
                        <span className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm backdrop-blur-md">
                          {t('store.ebookBadge', 'eBook')}
                        </span>
                      )}

                      {/* Explicit Out of Stock Badge Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <span className="bg-red-600/90 text-white font-bold px-4 py-2 rounded-lg rotate-12 backdrop-blur-sm shadow-xl uppercase tracking-wider text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col px-2">
                      <div className="flex items-center gap-1.5 text-yellow-500 mb-2">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{book.rating || "4.8"}</span>
                      </div>
                      
                      {/* Safety Mapping: Support either book.title or book.name */}
                      <h3 className="text-[1.1rem] md:text-xl font-bold text-slate-900 dark:text-white leading-snug mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {book.title || book.name || "Untitled Book"}
                      </h3>
                      
                      {/* Mapping Author */}
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 font-medium">
                        {book.author || t('store.authorFallback', 'कैलासराव तुकाराम तुरकणे पाटील')}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        {/* Mapping Price */}
                        <span className={`text-xl md:text-2xl font-black tracking-tight ${isOutOfStock ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          ₹{book.price || "0.00"}
                        </span>
                        
                        {/* DYNAMIC BUTTON LOGIC */}
                        {inCartQty > 0 && addingToCart !== book._id ? (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate('/checkout');
                            }}
                            className="h-11 px-4 rounded-full flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/30 active:scale-95 text-sm font-bold"
                          >
                            <CheckCircle size={18} />
                            {t('store.checkout', 'Checkout')} ({inCartQty})
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => handleAddToCart(e, book)}
                            disabled={addingToCart === book._id || isOutOfStock}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm ${
                              addingToCart === book._id 
                                ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/30' 
                                : isOutOfStock
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-600 hover:text-white active:scale-95'
                            }`}
                            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
                          >
                            {addingToCart === book._id ? (
                              <CheckCircle size={18} />
                            ) : isOutOfStock ? (
                              <XCircle size={18} />
                            ) : (
                              <ShoppingBag size={18} />
                            )}
                          </button>
                        )}

                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};