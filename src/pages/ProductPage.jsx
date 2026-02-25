import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import bookCoverImg from '../assets/cover.png'; // Fallback
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';

// 👉 1. Import your referral utility
import { captureAndVerifyReferral } from '../utils/referralManager';

import { 
  Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, 
  Loader2, CheckCircle, User, Book, Globe, FileText, Award, ChevronRight, Lock 
} from 'lucide-react';
import { Navbar } from '../components/sections/Navbar';

export const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const { addToCart, cartItems, updateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 👉 2. Add Referral State
  const [hasReferral, setHasReferral] = useState(false);
  const [referrerName, setReferrerName] = useState(null);

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const cartItem = book ? cartItems.find(item => item.bookId === book._id) : null;

  // 👉 3. Check for referral on page load
  useEffect(() => {
    const checkReferral = async () => {
      const name = await captureAndVerifyReferral();
      if (name) {
        setReferrerName(name);
        setHasReferral(true);
      }
    };
    checkReferral();
  }, []);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const [bookRes, reviewRes] = await Promise.all([
          apiClient.get(`/public/books/${id}`),
          apiClient.get(`/public/books/${id}/reviews`).catch(() => ({ data: [] }))
        ]);
        setBook(bookRes.data);
        setReviews(reviewRes.data || []);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookData();
  }, [id]);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(book);
    setTimeout(() => {
      setIsAdding(false);
    }, 500); 
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to submit a review.");
    
    setSubmittingReview(true);
    try {
      const { data } = await apiClient.post(`/public/books/${id}/reviews`, newReview);
      setReviews([data, ...reviews]); 
      setNewReview({ rating: 5, comment: '' }); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Book not found</h2>
        <Button onClick={() => navigate('/store')}>Return to Store</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <button onClick={() => navigate('/store')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Back to Collection
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            <div className="w-full lg:w-5/12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="sticky top-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900/50 rounded-[2.5rem] p-8 sm:p-12 flex items-center justify-center border border-slate-200 dark:border-slate-800"
              >
                <div className="relative group [perspective:1000px]">
                  <img 
                    src={book.coverImage || bookCoverImg} 
                    alt={book.title} 
                    className="w-full max-w-sm h-auto object-cover shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-r-2xl border-l-[6px] border-slate-300 dark:border-slate-700 transition-transform duration-500 group-hover:rotate-y-12 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent mix-blend-overlay pointer-events-none rounded-r-2xl" />
                </div>
              </motion.div>
            </div>

            <div className="w-full lg:w-7/12 py-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-800">
                    {book.type} Edition
                  </span>
                  {book.type === 'Physical' && book.stock > 0 ? (
                    <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={14}/> In Stock
                    </span>
                  ) : book.type === 'Physical' ? (
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  ) : null}
                </div>

                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight mb-2">
                  {book.title}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-6">by <span className="font-semibold text-slate-700 dark:text-slate-300">{book.author || 'SahakarStree'}</span></p>

                {/* 👉 4. Show VIP Badge if Unlocked */}
                {hasReferral && referrerName && (
                  <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold border border-green-200 dark:border-green-800/50 shadow-sm animate-[fadeIn_0.5s_ease-out]">
                    <Award size={18} /> Access Unlocked by {referrerName}
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill={i < Math.floor(book.rating || 5) ? "currentColor" : "none"} stroke="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 underline cursor-pointer hover:text-orange-600" onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}>
                    {reviews.length} Verified Reviews
                  </span>
                </div>

                <div className="text-4xl font-black text-slate-900 dark:text-white mb-8">
                  ₹{book.price}
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 text-lg">
                  {book.description || "Transform your mindset and achieve lasting success through structured, practical wisdom. The definitive guide to building habits that stick, written specifically for the modern Marathi entrepreneur and thinker."}
                </p>

                {/* 👉 5. INVITE-ONLY LOGIC AREA */}
                <div className="mb-10">
                  {!hasReferral ? (
                    /* Locked State */
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-inner">
                      <Lock size={32} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Invite-Only Access</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        This book is currently available exclusively through member referrals. Please click a valid referral link shared by a friend to unlock purchasing.
                      </p>
                    </div>
                  ) : cartItem ? (
                    /* Already in Cart State */
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                        <button 
                          onClick={() => updateQuantity(book._id, cartItem.qty - 1)} 
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors font-bold text-xl"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-slate-900 dark:text-white">
                          {cartItem.qty}
                        </span>
                        <button 
                          onClick={() => updateQuantity(book._id, cartItem.qty + 1)} 
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors font-bold text-xl"
                        >
                          +
                        </button>
                      </div>
                      
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/checkout')}
                        className="w-full sm:flex-1 py-4 text-base flex justify-center items-center gap-2 shadow-lg shadow-orange-500/20"
                      >
                        Proceed to Checkout <ChevronRight size={18} />
                      </Button>
                    </div>
                  ) : (
                    /* Unlocked / Ready to Add State */
                    <Button 
                      variant="primary" 
                      onClick={handleAddToCart}
                      disabled={isAdding || (book.type === 'Physical' && book.stock < 1)}
                      className="w-full sm:w-2/3 py-4 text-lg flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30 rounded-2xl"
                    >
                      {isAdding ? <><Loader2 size={20} className="animate-spin" /> Adding to Cart...</> : <><ShoppingBag size={20} /> Add to Cart</>}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-1">
                    <Globe className="text-slate-400 dark:text-slate-500 mb-1" size={20} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Language</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Marathi</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Book className="text-slate-400 dark:text-slate-500 mb-1" size={20} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Format</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{book.type}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <FileText className="text-slate-400 dark:text-slate-500 mb-1" size={20} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Pages</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{book.pages || '256'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Award className="text-slate-400 dark:text-slate-500 mb-1" size={20} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Publisher</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">SahakarStree</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 mt-4 rounded-2xl px-4">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400"><Truck size={20} /></div>
                    <span className="text-sm font-bold leading-tight">Fast Delivery<br/><span className="text-xs font-normal text-slate-500">Across Maharashtra</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400"><ShieldCheck size={20} /></div>
                    <span className="text-sm font-bold leading-tight">Secure Payment<br/><span className="text-xs font-normal text-slate-500">100% Encrypted</span></span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 mt-20 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white mb-8">What you'll discover inside</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-bold text-lg mb-4">1</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Build Better Habits</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Learn actionable techniques to break bad habits and consistently stick to good ones.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-bold text-lg mb-4">2</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Financial Freedom</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Understand wealth-building strategies specifically tailored for modern thinkers.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-bold text-lg mb-4">3</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Clarity of Mind</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Achieve 'Chintamukti' (Freedom from worry) through practical daily exercises.</p>
              </div>
            </div>
          </div>
        </div>

        <div id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-10">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit sticky top-32">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Write a Review</h3>
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You must be logged in to share your thoughts on this book.</p>
                  <Button variant="secondary" onClick={() => navigate('/dashboard')} className="w-full">Login to Review</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${star <= newReview.rating ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-700'}`}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Your Feedback</label>
                    <textarea 
                      required rows="4" 
                      value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="What did you think about the book?" 
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none shadow-sm"
                    />
                  </div>
                  <Button variant="primary" type="submit" disabled={submittingReview} className="w-full py-3.5">
                    {submittingReview ? <><Loader2 size={18} className="animate-spin mr-2 inline"/> Submitting...</> : 'Submit Review'}
                  </Button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <Star size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                reviews.map((review, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500 font-bold text-lg">
                          {review.user?.name ? review.user.name.charAt(0) : <User size={20}/>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{review.user?.name || 'Verified Reader'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle size={12} className="text-green-500"/> Verified Purchase • {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full w-fit">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" />)}
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};