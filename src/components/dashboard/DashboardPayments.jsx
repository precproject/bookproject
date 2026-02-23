import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle, AlertCircle, Clock, ArrowUpRight, Download, ChevronDown, CreditCard } from 'lucide-react';

// --- STANDARD MOCK DATA ---
const INITIAL_PAYMENTS = [
  { id: 'TXN-98210', orderId: 'BK-8021', method: 'UPI (PhonePe)', amount: 400, date: '2026-02-23T14:30:00Z', status: 'Success' },
  { id: 'TXN-98211', orderId: 'BK-8022', method: 'Credit Card', amount: 400, date: '2026-02-22T15:00:00Z', status: 'Failed' },
  { id: 'TXN-98212', orderId: 'BK-8023', method: 'UPI (GPay)', amount: 800, date: '2026-02-22T09:15:00Z', status: 'In Progress' },
  { id: 'TXN-98213', orderId: 'BK-8025', method: 'Net Banking', amount: 400, date: '2026-02-21T11:45:00Z', status: 'Success' },
  { id: 'TXN-98214', orderId: 'BK-8026', method: 'UPI (Paytm)', amount: 400, date: '2026-02-20T18:10:00Z', status: 'Success' },
  { id: 'TXN-98215', orderId: 'BK-8027', method: 'Credit Card', amount: 400, date: '2026-02-20T13:05:00Z', status: 'In Progress' },
  { id: 'TXN-98216', orderId: 'BK-8028', method: 'UPI (PhonePe)', amount: 1200, date: '2026-02-19T08:30:00Z', status: 'Success' },
  { id: 'TXN-98217', orderId: 'BK-8029', method: 'Debit Card', amount: 400, date: '2026-02-18T15:20:00Z', status: 'Failed' },
  { id: 'TXN-98218', orderId: 'BK-8030', method: 'UPI (GPay)', amount: 400, date: '2026-02-18T10:00:00Z', status: 'Success' },
  { id: 'TXN-98219', orderId: 'BK-8031', method: 'Net Banking', amount: 400, date: '2026-02-17T12:45:00Z', status: 'Success' },
];

export const DashboardPayments = () => {
  // --- STATE MANAGEMENT ---
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); 
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- FILTERING & SORTING LOGIC ---
  const filteredAndSortedPayments = useMemo(() => {
    let result = [...INITIAL_PAYMENTS];

    // 1. Filter by Status Tab
    if (activeFilter !== 'All') {
      result = result.filter(payment => payment.status === activeFilter);
    }

    // 2. Filter by Search Query (Transaction ID or Order ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(payment => 
        payment.id.toLowerCase().includes(query) ||
        payment.orderId.toLowerCase().includes(query)
      );
    }

    // 3. Sort by Date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [activeFilter, searchQuery, sortOrder]);

  // --- PAGINATION LOGIC ---
  const totalItems = filteredAndSortedPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Prevent empty pages when filtering
  if (currentPage > totalPages) setCurrentPage(totalPages);

  const paginatedPayments = filteredAndSortedPayments.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // --- UI HELPERS ---
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page
  };

  const formatDate = (isoString) => {
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
      case 'In Progress': return <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100"><Clock size={14}/> Processing</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor transaction history and statuses.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          
          <div className="flex flex-wrap gap-2">
            {['All', 'Success', 'In Progress', 'Failed'].map(filter => (
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
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all outline-none pr-10 cursor-pointer"
                >
                  <option value="newest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                <Filter size={16} /> Filter
              </button>
            </div>

          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
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
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 font-bold text-slate-800 text-sm flex items-center gap-2">
                      #{payment.id} <ArrowUpRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-emerald-600" />
                    </td>
                    <td className="p-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer transition-colors">#{payment.orderId}</td>
                    <td className="p-4 text-sm text-slate-600">{payment.method}</td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(payment.date)}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">₹{payment.amount}</td>
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
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <span>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1} 
                onClick={() => setCurrentPage(i + 1)} 
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${currentPage === i + 1 ? 'bg-emerald-800 text-white shadow-sm' : 'border border-slate-200 hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages} 
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