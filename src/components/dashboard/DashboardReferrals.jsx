import React, { useState, useMemo } from 'react';
import { Plus, IndianRupee, Clock, CheckCircle, Link as LinkIcon, Edit, Search, Copy, Eye, Tag, ChevronDown, User, X, Save, ArrowUpRight } from 'lucide-react';

// --- STANDARD MOCK DATA ---
const INITIAL_REFERRALS = [
  { 
    id: 'REF-001', code: 'RAHUL50', userId: 'USR-001', userName: 'Rahul Patil', rate: 50, uses: 2, earned: 100, pending: 50, status: 'Active', isDiscountLinked: true,
    transactions: [
      { orderId: 'BK-8021', date: '2026-02-23', orderStatus: 'Success', payoutStatus: 'Paid', amount: 50 },
      { orderId: 'BK-8024', date: '2026-02-24', orderStatus: 'Success', payoutStatus: 'Pending', amount: 50 }
    ]
  },
  { 
    id: 'REF-002', code: 'SNEHA50', userId: 'USR-003', userName: 'Sneha Deshmukh', rate: 50, uses: 8, earned: 400, pending: 0, status: 'Active', isDiscountLinked: false,
    transactions: [
      { orderId: 'BK-8022', date: '2026-02-22', orderStatus: 'Success', payoutStatus: 'Paid', amount: 50 }
    ] // Only showing 1 for brevity
  },
  { 
    id: 'REF-003', code: 'PROMO100', userId: 'USR-004', userName: 'Amit Kulkarni', rate: 100, uses: 45, earned: 4500, pending: 500, status: 'Disabled', isDiscountLinked: true,
    transactions: [
      { orderId: 'BK-8023', date: '2026-02-22', orderStatus: 'Pending Payment', payoutStatus: 'Pending', amount: 100 },
      { orderId: 'BK-8015', date: '2026-02-15', orderStatus: 'Success', payoutStatus: 'Pending', amount: 100 }
    ]
  },
];

export const DashboardReferrals = () => {
  // --- STATE MANAGEMENT ---
  const [referrals, setReferrals] = useState(INITIAL_REFERRALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); 
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const defaultForm = { id: null, code: '', userId: '', userName: '', rate: 50, status: 'Active', isDiscountLinked: false };
  const [formData, setFormData] = useState(defaultForm);

  // --- STATS CALCULATION ---
  const totalGenerated = referrals.reduce((acc, curr) => acc + curr.earned, 0);
  const totalPending = referrals.reduce((acc, curr) => acc + curr.pending, 0);
  const totalPaidOut = totalGenerated - totalPending;

  // --- FILTERING & SORTING LOGIC ---
  const filteredAndSortedReferrals = useMemo(() => {
    let result = [...referrals];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ref => 
        ref.code.toLowerCase().includes(query) ||
        ref.userName.toLowerCase().includes(query) ||
        ref.userId.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortOrder === 'most_uses') return b.uses - a.uses;
      if (sortOrder === 'most_earned') return b.earned - a.earned;
      return 0; // newest defaults to array order for mock
    });

    return result;
  }, [referrals, searchQuery, sortOrder]);

  // --- PAGINATION LOGIC ---
  const totalItems = filteredAndSortedReferrals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (currentPage > totalPages) setCurrentPage(totalPages);
  const paginatedReferrals = filteredAndSortedReferrals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- ACTION HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({ ...defaultForm, id: `REF-00${referrals.length + 1}` });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (ref) => {
    setFormData({
      id: ref.id,
      code: ref.code,
      userId: ref.userId,
      userName: ref.userName,
      rate: ref.rate,
      status: ref.status,
      isDiscountLinked: ref.isDiscountLinked
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (ref) => {
    setSelectedReferral(ref);
    setIsViewModalOpen(true);
  };

  const handleSaveReferral = (e) => {
    e.preventDefault();
    const existingIndex = referrals.findIndex(r => r.id === formData.id);
    
    if (existingIndex >= 0) {
      setReferrals(prev => prev.map(r => r.id === formData.id ? { ...r, ...formData, code: formData.code.toUpperCase() } : r));
      showToast('Referral code updated successfully.');
    } else {
      setReferrals([{
        ...formData,
        code: formData.code.toUpperCase(),
        uses: 0,
        earned: 0,
        pending: 0,
        transactions: []
      }, ...referrals]);
      showToast('New referral code generated.');
    }
    setIsEditModalOpen(false);
  };

  const handleMarkPaid = (refId, transactionIndex, amount) => {
    setReferrals(prev => prev.map(ref => {
      if (ref.id === refId) {
        // Create a deep copy of transactions
        const newTransactions = [...ref.transactions];
        newTransactions[transactionIndex].payoutStatus = 'Paid';
        
        return {
          ...ref,
          pending: Math.max(0, ref.pending - amount), // Decrease pending amount
          transactions: newTransactions
        };
      }
      return ref;
    }));
    
    // Update local selected state to reflect in modal instantly
    if (selectedReferral && selectedReferral.id === refId) {
      const newTransactions = [...selectedReferral.transactions];
      newTransactions[transactionIndex].payoutStatus = 'Paid';
      setSelectedReferral({
        ...selectedReferral,
        pending: Math.max(0, selectedReferral.pending - amount),
        transactions: newTransactions
      });
    }
    
    showToast(`₹${amount} marked as paid successfully.`);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(`https://chintamukti.com/buy?ref=${code}`);
    showToast('Referral link copied to clipboard!');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Referral Program</h1>
          <p className="text-sm text-slate-500 mt-1">Manage referral codes, track usage, and clear payouts.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> New Referral Code
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600"><IndianRupee size={20} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Referral Generated</p>
            <p className="text-2xl font-bold text-slate-800">₹{totalGenerated.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center text-white"><CheckCircle size={20} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Paid Out</p>
            <p className="text-2xl font-bold text-slate-800">₹{totalPaidOut.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-yellow-50 p-5 rounded-3xl border border-yellow-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-600 shadow-sm"><Clock size={20} /></div>
          <div>
            <p className="text-sm font-medium text-yellow-800">Pending Payouts</p>
            <p className="text-2xl font-bold text-yellow-700">₹{totalPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or user..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase placeholder:normal-case" 
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full appearance-none flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all outline-none pr-10 cursor-pointer"
            >
              <option value="newest">Sort by Newest</option>
              <option value="most_uses">Sort by Most Uses</option>
              <option value="most_earned">Sort by Most Earned</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">Referral Code / Link</th>
                <th className="p-4 font-bold border-b border-slate-100">Linked User</th>
                <th className="p-4 font-bold border-b border-slate-100">Reward Setup</th>
                <th className="p-4 font-bold border-b border-slate-100">Uses / Earned</th>
                <th className="p-4 font-bold border-b border-slate-100">Pending Pay</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReferrals.length > 0 ? (
                paginatedReferrals.map((ref) => (
                  <tr key={ref.id} className={`hover:bg-slate-50/50 transition-colors ${ref.status === 'Disabled' ? 'opacity-60' : ''}`}>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="flex items-center gap-2 font-mono font-bold text-sm bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <LinkIcon size={14} /> {ref.code}
                        </span>
                        <button onClick={() => copyToClipboard(ref.code)} className="text-[10px] text-slate-400 hover:text-emerald-600 flex items-center gap-1 font-bold tracking-wider ml-1 transition-colors">
                          <Copy size={10} /> COPY LINK
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {/* Tooltip Hover for User Info */}
                      <div className="group relative inline-flex items-center gap-2 cursor-help">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                          {ref.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{ref.userName}</span>
                        
                        <div className="absolute bottom-full left-10 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg animate-[scaleIn_0.1s_ease-out] z-10">
                          User ID: {ref.userId}
                          <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-bold text-slate-800">₹{ref.rate} <span className="text-xs font-medium text-slate-500">/ use</span></span>
                        {ref.isDiscountLinked && (
                          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-purple-100">
                            <Tag size={10}/> Also Discount Code
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{ref.uses} Uses</span>
                        <span className="text-xs text-emerald-600 font-bold">Total: ₹{ref.earned}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {ref.pending > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-bold text-yellow-600 bg-yellow-50 w-fit px-2.5 py-1 rounded-md">
                          <Clock size={12}/> ₹{ref.pending}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 w-fit px-2.5 py-1 rounded-md border border-slate-100">
                          <CheckCircle size={12}/> Clear
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenView(ref)} title="View Transactions" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleOpenEdit(ref)} title="Edit Referral" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    <LinkIcon size={40} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold text-slate-600">No Referrals Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <span>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${currentPage === i + 1 ? 'bg-emerald-800 text-white shadow-sm' : 'border border-slate-200 hover:bg-slate-50'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{formData.id.includes('REF') && formData.userName ? 'Edit Referral' : 'Create Referral'}</h2>
                <p className="text-xs text-slate-500 mt-1">Configure sharing codes and rewards.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReferral} className="overflow-y-auto">
              <div className="p-6 space-y-5">
                
                {/* User Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Linked User ID <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} placeholder="e.g. USR-001" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">User Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} placeholder="e.g. Rahul Patil" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                  </div>
                </div>

                {/* Code & Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Referral Code Text <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. CUSTOM50" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Reward Rate (₹) <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                  </div>
                </div>

                {/* Link Preview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generated Share Link Preview</label>
                  <p className="text-sm font-mono text-emerald-700 break-all">https://chintamukti.com/buy?ref={formData.code || 'CODE'}</p>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Use as Discount Code</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Allows buyers to enter this at checkout for a discount.</p>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, isDiscountLinked: !formData.isDiscountLinked})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.isDiscountLinked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.isDiscountLinked ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Referral Status</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Suspend this code from generating new rewards.</p>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Disabled' : 'Active'})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md">
                  <Save size={18} /> Save Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW TRANSACTIONS MODAL --- */}
      {isViewModalOpen && selectedReferral && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[85vh]">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-200">
                  <LinkIcon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedReferral.code} <span className="text-sm font-normal text-slate-500 ml-2">({selectedReferral.userName})</span></h2>
                  <p className="text-xs text-slate-500 mt-1">Pending Payout: <span className="font-bold text-yellow-600">₹{selectedReferral.pending}</span></p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/30">
              {selectedReferral.transactions.length > 0 ? (
                <div className="space-y-4">
                  {selectedReferral.transactions.map((txn, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-200 transition-colors">
                      
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">Order {txn.orderId} <ArrowUpRight size={14} className="text-slate-400"/></p>
                        <p className="text-xs text-slate-500 mt-0.5">{txn.date}</p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        {/* Order Status Badge */}
                        {txn.orderStatus === 'Success' ? (
                          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase tracking-wider">Order Success</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100 uppercase tracking-wider">Order Pending</span>
                        )}

                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                        
                        {/* Payout Action/Status */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">₹{txn.amount}</span>
                          {txn.payoutStatus === 'Paid' ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Paid</span>
                          ) : (
                            <button 
                              onClick={() => handleMarkPaid(selectedReferral.id, idx, txn.amount)}
                              disabled={txn.orderStatus !== 'Success'}
                              className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              title={txn.orderStatus !== 'Success' ? "Order must be successful to pay reward" : "Mark as paid to referrer"}
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-lg font-bold text-slate-600">No Transactions Yet</p>
                  <p className="text-sm mt-1">This code hasn't been used for any successful orders.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};