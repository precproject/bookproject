import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, BookOpen, CheckCircle, Search, Loader2 } from 'lucide-react';
import { adminService } from '../../api/service/adminService';

export const DashboardReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]); // For the filter dropdown
  const [selectedBookId, setSelectedBookId] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingId, setIsTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // 1. Fetch data on load
  useEffect(() => {
    fetchBooksList();
    fetchReviews();
  }, [selectedBookId]);

  const fetchBooksList = async () => {
    try {
      // Assuming your getInventory fetches the books for the dropdown
      const data = await adminService.getInventory({});
      setBooks(data || []);
    } catch (error) {
      console.error("Failed to load books for filter");
    }
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getReviewsAdmin({ bookId: selectedBookId });
      setReviews(data.reviews || []);
    } catch (error) {
      showToast("Failed to fetch reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (review) => {
    setIsTogglingId(review._id);
    try {
      const response = await adminService.toggleReviewStatus(review._id);
      
      // Update UI instantly
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

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and moderate product feedback.</p>
        </div>
        
        <div className="w-full sm:w-auto relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={selectedBookId} 
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none"
          >
            <option value="">All Books</option>
            {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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
                  <th className="p-4 font-bold border-b border-slate-100">Reviewer & Book</th>
                  <th className="p-4 font-bold border-b border-slate-100">Rating & Comment</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-center">Visibility</th>
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
                            <BookOpen size={12} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-700">{review.book?.title || 'Unknown Book'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">{formatDate(review.createdAt)}</span>
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
                      
                      {/* TOGGLE SWITCH */}
                      <td className="p-4 align-top text-center w-40">
                        <div className="flex flex-col items-center gap-2">
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
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};