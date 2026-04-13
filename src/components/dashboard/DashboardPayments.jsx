import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Search, CheckCircle, AlertCircle, Clock, ArrowUpRight, 
  ChevronDown, CreditCard, Loader2 
} from 'lucide-react';
import { AdminContext } from '../../context/AdminContext'; // Global Cache

export const DashboardPayments = () => {
  // --- CONSUME GLOBAL CACHE ---
  const { orderCache, fetchAdminOrders } = useContext(AdminContext);

  // --- SERVER-SIDE PAGINATION STATE ---
  const [currentPaymentIds, setCurrentPaymentIds] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  // --- FILTER & SORT STATE ---
  const [activeFilter, setActiveFilter] = useState('All');
  
  // CRITICAL FIX 1: Decouple search input from API trigger to prevent double-firing
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- DEBOUNCE EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- TRIGGER API ON FINALIZED DEPENDENCIES ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingList(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          sort: sortOrder,
          paymentStatus: activeFilter !== 'All' ? activeFilter : ''
        };

        const response = await fetchAdminOrders(params);

        if (response && response.orders) {
          setCurrentPaymentIds(response.orders.map(o => o._id));
          setTotalItems(response.totalItems);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Error loading paginated payments:", error);
      } finally {
        setIsLoadingList(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, debouncedSearch, sortOrder, currentPage]);

  // --- MAP IDs TO ACTUAL DATA FROM CACHE ---
  const visiblePayments = useMemo(() => {
    return currentPaymentIds.map(id => {
      const order = orderCache[id];
      if (!order) return null;

      // Extract the relevant payment info from the complex order object
      return {
        id: order._id,
        transactionId: order.payment?.transactionId || order.payment?.txnId || `Pending-${order.orderId}`,
        orderId: order.orderId,
        method: order.payment?.method || 'PhonePe Gateway',
        amount: order.priceBreakup?.total || 0,
        date: order.payment?.updatedAt || order.createdAt,
        status: order.payment?.status || (order.status === 'Failed' ? 'Failed' : 'Pending')
      };
    }).filter(Boolean); 
  }, [currentPaymentIds, orderCache]);

  // --- UI HELPERS ---
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); 
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: false 
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Success': return <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle size={14}/> Success</span>;
      case 'Failed': return <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100"><AlertCircle size={14}/> Failed</span>;
      case 'Pending': 
      case 'In Progress': return <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100"><Clock size={14}/> Processing</span>;
      default: return null;
    }
  };

  // CRITICAL FIX 2: Ensured everything is inside the single parent div wrapper
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor transaction history, gateways, and statuses.</p>
        </div>
        <button 
          onClick={() => alert("CSV Export feature would trigger here.")}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          
          <div className="flex flex-wrap gap-2">
            {['All', 'Success', 'Pending', 'Failed'].map(filter => (
              <button 
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === filter ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search Txn ID or Order Ref..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
              />
            </div>
            
            {/* Sort & Filter Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={sortOrder}
                  onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                  className="appearance-none flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all outline-none pr-10 cursor-pointer"
                >
                  <option value="newest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
              Fetching payment records...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-100">Transaction ID</th>
                  <th className="p-4 font-bold border-b border-slate-100">Order Ref</th>
                  <th className="p-4 font-bold border-b border-slate-100">Method</th>
                  <th className="p-4 font-bold border-b border-slate-100">Date & Time</th>
                  <th className="p-4 font-bold border-b border-slate-100">Amount</th>
                  <th className="p-4 font-bold border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiblePayments.length > 0 ? (
                  visiblePayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 font-mono font-bold text-slate-800 text-sm flex items-center gap-2 break-all max-w-[200px]">
                        {payment.transactionId} <ArrowUpRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-emerald-600" />
                      </td>
                      <td className="p-4 text-sm font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer transition-colors">#{payment.orderId}</td>
                      <td className="p-4 text-sm text-slate-600">{payment.method}</td>
                      <td className="p-4 text-sm text-slate-600">{formatDate(payment.date)}</td>
                      <td className="p-4 text-sm font-black text-slate-800">₹{payment.amount}</td>
                      <td className="p-4">{getStatusBadge(payment.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500">
                      <CreditCard size={40} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-bold text-slate-600">No Transactions Found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Server-Side Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <span>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1 || isLoadingList} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Prev
            </button>
            
            <button className="px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-white shadow-sm">
              {currentPage}
            </button>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || isLoadingList || totalPages === 0} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};