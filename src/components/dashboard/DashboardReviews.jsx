import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, BookOpen, CheckCircle, 
  ChevronDown, Loader2, Calendar, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { adminService } from '../../api/service/adminService';

export const DashboardReviews = () => {
  // --- DATA STATE ---
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]); 
  
  // --- FILTER & PAGINATION STATE ---
  const [selectedBookId, setSelectedBookId] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // --- UI STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingId, setIsTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // 1. Fetch Books ONLY ONCE on mount
  useEffect(() => {
    const fetchBooksList = async () => {
      try {
        const data = await adminService.getInventory({});
        setBooks(data || []);
      } catch (error) {
        console.error("Failed to load books for filter");
      }
    };
    fetchBooksList();
  }, []);

  // 2. Fetch Reviews whenever Filter, Sort, or Page changes
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.getReviewsAdmin({ 
          bookId: selectedBookId,
          page: currentPage,
          limit: itemsPerPage,
          sort: sortOrder
        });
        
        // Matches your JSON: { reviews: [], totalItems: X, totalPages: Y, currentPage: Z }
        setReviews(response.reviews || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || 0);
      } catch (error) {
        showToast("Failed to fetch reviews.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [selectedBookId, currentPage, sortOrder]);

  const handleToggleStatus = async (review) => {
    setIsTogglingId(review._id);
    try {
      const response = await adminService.toggleReviewStatus(review._id);
      setReviews(prev => prev.map(r => 
        r._id === review._id ? { ...r, status: response.status } : r
      ));
      showToast(`Review is now ${response.status}.`);
    } catch (error) {
      showToast("Failed to update status.");
    } finally {
      setIsTogglingId(null);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Advanced Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and moderate product feedback.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Book Filter */}
          <div className="relative group flex-1 sm:flex-none">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
            <select 
              value={selectedBookId} 
              onChange={(e) => { setSelectedBookId(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-64 pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">All Books</option>
              {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16} />
          </div>

          {/* Sort Order */}
          <div className="relative group flex-1 sm:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
            <select 
              value={sortOrder} 
              onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-44 pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none cursor-pointer"
            >
              <option value="newest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16} />
          </div>
        </div>
      </div>

      {/* Reviews Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
              Loading reviews...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-100 w-64">Reviewer & Book</th>
                  <th className="p-4 font-bold border-b border-slate-100">Rating & Comment</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-center w-40">Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 align-top w-64">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-800 text-sm">{review.user?.name || 'Anonymous'}</span>
                          <span className="text-xs text-slate-500">{review.user?.email}</span>
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 w-fit">
                            <BookOpen size={12} className="text-slate-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{review.book?.title || 'Unknown Book'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 font-medium">{formatDate(review.createdAt)}</span>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1 mb-2 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                      </td>
                      
                      <td className="p-4 align-top text-center w-40">
                        <div className="flex flex-col items-center gap-2 mt-1">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                            review.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {review.status}
                          </span>
                          
                          {isTogglingId === review._id ? (
                            <Loader2 size={20} className="animate-spin text-emerald-500 mt-1" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(review)}
                              className={`relative inline-flex h-6 w-11 mt-1 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                review.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                review.status === 'Approved' ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-12 text-center text-slate-500">
                      <MessageSquare size={40} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-bold text-slate-600">No Reviews Found</p>
                      <p className="text-sm mt-1">Try selecting a different book or check back later.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* --- SERVER-SIDE PAGINATION FOOTER --- */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <span>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} reviews
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1 || isLoading} 
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center px-4 font-bold text-slate-700 bg-slate-50 rounded-lg border border-slate-200">
              Page {currentPage} of {totalPages}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || isLoading || totalPages === 0} 
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};