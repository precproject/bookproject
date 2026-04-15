import React, { useState, useEffect } from 'react';
import { 
  Plus, IndianRupee, Clock, CheckCircle, Link as LinkIcon, 
  Edit, Search, Copy, Eye, Tag, ChevronDown, X, Save, ArrowUpRight, Loader2, User, UserPlus 
} from 'lucide-react';
import { adminService } from '../../api/service/adminService';
import { useToast } from '../../context/ToastContext';

export const DashboardReferrals = () => {
  const { showToast } = useToast(); // 2. Destructure showToast

  // --- SERVER-SIDE STATE ---
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ totalEarned: 0, totalPending: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // --- FILTER & SORT STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- MODAL & ACTION STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTxnLoading, setIsTxnLoading] = useState(false);
  
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [fetchedTransactions, setFetchedTransactions] = useState([]);

  // --- USER SEARCH & CREATE STATES ---
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingUserLoading, setIsCreatingUserLoading] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', mobile: '' });

  // Form State
  const defaultForm = { 
    _id: null, code: '', userId: '', userName: '', rate: 50, status: 'Active', 
    isDiscountLinked: false,
    discountType: 'Percentage', discountValue: 10, validTill: '', maxUsage: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  // --- FETCH LIVE REFERRAL DATA ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadReferrals();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortOrder, currentPage]);

  const loadReferrals = async () => {
    setIsLoadingList(true);
    try {
      const response = await adminService.getReferralsPaginated({
        page: currentPage, limit: itemsPerPage, search: searchQuery, sort: sortOrder
      });
      if (response) {
        setReferrals(response.referrals || []);
        setTotalItems(response.totalItems || 0);
        setTotalPages(response.totalPages || 1);
        if (response.stats) setStats(response.stats);
      }
    } catch (error) {
      console.error("Failed to load referrals:", error);
      showToast("Error fetching referral data.");
    } finally {
      setIsLoadingList(false);
    }
  };

  // --- USER SEARCH LOGIC ---
  useEffect(() => {
    if (!userSearchQuery || userSearchQuery.length < 3) {
      setUserSearchResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingUser(true);
      try {
        const response = await adminService.getUsersPaginated({ page: 1, limit: 5, search: userSearchQuery });
        setUserSearchResults(response.users || []);
      } catch (error) {
        console.error("User search failed", error);
      } finally {
        setIsSearchingUser(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearchQuery]);

  const handleSelectUser = (user) => {
    setFormData({ ...formData, userId: user._id, userName: user.name });
    setUserSearchQuery('');
    setUserSearchResults([]);
    setIsCreatingUser(false);
  };

  // --- QUICK CREATE USER LOGIC ---
  const handleQuickCreateUser = async () => {
    if (!newUserForm.name || (!newUserForm.email && !newUserForm.mobile)) {
      return showToast("Name and either Email or Mobile are required to create a user.");
    }

    setIsCreatingUserLoading(true);
    try {
      const newUser = await adminService.createUser({
        name: newUserForm.name,
        email: newUserForm.email,
        mobile: newUserForm.mobile,
        password: Math.random().toString(36).slice(-10) + 'A1!' 
      });
      
      handleSelectUser(newUser);
      showToast("User created and linked successfully!");
      setNewUserForm({ name: '', email: '', mobile: '' });
      setIsCreatingUser(false);
    } catch (error) {
      console.log(error)
      showToast(error.response?.data?.message || "Failed to create new user.");
    } finally {
      setIsCreatingUserLoading(false);
    }
  };

  // --- STATS CALCULATION ---
  const totalGenerated = stats.totalEarned || 0;
  const totalPending = stats.totalPending || 0;
  const totalPaidOut = Math.max(0, totalGenerated - totalPending);

  // --- ACTION HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setUserSearchQuery('');
    setUserSearchResults([]);
    setIsCreatingUser(false);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (ref) => {
    setFormData({
      _id: ref._id,
      code: ref.code,
      userId: ref.userId, 
      userName: ref.userName,
      rate: ref.rate,
      status: ref.status,
      isDiscountLinked: ref.isDiscountLinked,
      discountType: ref.discountDetails?.type || 'Percentage',
      discountValue: ref.discountDetails?.value || 10,
      validTill: ref.discountDetails?.validTill ? new Date(ref.discountDetails.validTill).toISOString().split('T')[0] : '',
      maxUsage: ref.discountDetails?.maxUsage || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveReferral = async (e) => {
    e.preventDefault();
    if (!formData.userId) return showToast('Please select a user to link this referral code to.');

    setIsSaving(true);
    try {
      // CRITICAL FIX: Safe parsing of optional number/date fields to prevent bugs
      const safeMaxUsage = formData.maxUsage && formData.maxUsage !== "" ? Number(formData.maxUsage) : null;
      const safeValidTill = formData.validTill && formData.validTill !== "" ? formData.validTill : null;

      const payload = { 
        ...formData, 
        code: formData.code.toUpperCase(),
        discountDetails: formData.isDiscountLinked ? {
          type: formData.discountType,
          value: Number(formData.discountValue),
          validTill: safeValidTill,
          maxUsage: safeMaxUsage
        } : null
      };

      if (formData._id) {
        await adminService.updateReferral(formData._id, payload);
        showToast('Referral configuration updated.');
      } else {
        await adminService.createReferral(payload);
        showToast('New referral code generated.');
      }
      
      setIsEditModalOpen(false);
      loadReferrals(); 
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save referral.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenView = async (ref) => {
    setSelectedReferral(ref);
    setIsViewModalOpen(true);
    setIsTxnLoading(true);
    try {
      const txns = await adminService.getReferralTransactions(ref._id);
      setFetchedTransactions(txns || []);
    } catch (error) {
      showToast('Failed to load transaction history.');
    } finally {
      setIsTxnLoading(false);
    }
  };

  const handleMarkPaid = async (txnId, amount) => {
    try {
      await adminService.markTransactionPaid(txnId);
      setFetchedTransactions(prev => prev.map(txn => txn._id === txnId ? { ...txn, payoutStatus: 'Paid' } : txn));
      setReferrals(prev => prev.map(r => r._id === selectedReferral._id ? { ...r, pending: Math.max(0, r.pending - amount) } : r));
      setStats(prev => ({ ...prev, totalPending: Math.max(0, prev.totalPending - amount) }));
      showToast(`₹${amount} marked as paid to referrer.`);
    } catch (error) {
      showToast('Failed to mark transaction as paid.');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${code}`);
    showToast('Referral link copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      
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
          <p className="text-sm text-slate-500 mt-1">Manage codes, track usage, and clear payouts.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> New Code
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600"><IndianRupee size={20} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Generated</p>
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search code or user..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase placeholder:normal-case" 
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <select 
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
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
          {isLoadingList ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500">
               <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
               Loading referral programs...
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-100">Referral Code</th>
                  <th className="p-4 font-bold border-b border-slate-100">Linked User</th>
                  <th className="p-4 font-bold border-b border-slate-100">Reward Setup</th>
                  <th className="p-4 font-bold border-b border-slate-100">Uses / Earned</th>
                  <th className="p-4 font-bold border-b border-slate-100">Pending Pay</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.length > 0 ? (
                  referrals.map((ref) => (
                    <tr key={ref._id} className={`hover:bg-slate-50/50 transition-colors ${ref.status === 'Disabled' ? 'opacity-60' : ''}`}>
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                            {(ref.userName || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{ref.userName}</p>
                            <p className="text-xs text-slate-400 font-mono">{ref.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-sm font-bold text-slate-800">₹{ref.rate} <span className="text-xs font-medium text-slate-500">/ order</span></span>
                          {ref.isDiscountLinked && (
                            <span className="flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-purple-100">
                              <Tag size={10}/> Discount Active
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
                            <CheckCircle size={12}/> Cleared
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenView(ref)} title="View Transactions" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleOpenEdit(ref)} title="Edit Configuration" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
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
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <span>Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries</span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || isLoadingList} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors font-medium">Prev</button>
            <button className="px-3 py-1.5 rounded-lg font-bold bg-emerald-800 text-white shadow-sm">{currentPage}</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || isLoadingList || totalPages === 0} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors font-medium">Next</button>
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
                <h2 className="text-xl font-bold text-slate-800">{formData._id ? 'Edit Referral' : 'Create Referral'}</h2>
                <p className="text-xs text-slate-500 mt-1">Configure sharing codes and rewards.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveReferral} className="overflow-y-auto flex-1 flex flex-col">
              <div className="p-6 space-y-5 flex-1">
                
                {/* --- LIVE USER SEARCH LOGIC --- */}
                {!formData._id ? (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Link to Customer <span className="text-red-500">*</span></label>
                    {!formData.userId ? (
                      <div className="relative">
                        {!isCreatingUser ? (
                          <>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              placeholder="Type email or mobile to search..."
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                            />
                            
                            {/* CRITICAL FIX: Z-Index added so it overlays other form elements */}
                            {userSearchQuery.length >= 3 && (
                              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                                {isSearchingUser ? (
                                  <div className="p-4 text-center text-sm text-slate-500">
                                    <Loader2 className="animate-spin inline mr-2" size={14}/> Searching...
                                  </div>
                                ) : userSearchResults.length > 0 ? (
                                  userSearchResults.map(u => (
                                    <div key={u._id} onClick={() => handleSelectUser(u)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 flex items-center justify-between group">
                                      <div>
                                        <p className="font-bold text-slate-800 text-sm group-hover:text-emerald-700">{u.name}</p>
                                        <p className="text-xs text-slate-500">{u.email} • {u.mobile}</p>
                                      </div>
                                      <User size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                    </div>
                                  ))
                                ) : null}

                                {!isSearchingUser && (
                                  <div 
                                    onClick={() => setIsCreatingUser(true)}
                                    className="p-3 hover:bg-emerald-50 cursor-pointer text-emerald-700 flex items-center justify-center gap-2 border-t border-slate-100"
                                  >
                                    <UserPlus size={16} /> <span className="text-sm font-bold">Create New User</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          // QUICK CREATE USER FORM
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><UserPlus size={16}/> Quick Create User</h4>
                              <button type="button" onClick={() => setIsCreatingUser(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                            <input type="text" placeholder="Full Name" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                            <input type="email" placeholder="Email Address" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                            <input type="tel" placeholder="Mobile Number" value={newUserForm.mobile} onChange={e => setNewUserForm({...newUserForm, mobile: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                            <button 
                              type="button"
                              onClick={handleQuickCreateUser}
                              disabled={isCreatingUserLoading}
                              className="w-full bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                              {isCreatingUserLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                              Create & Select
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-emerald-800">{formData.userName}</p>
                          <p className="text-xs text-emerald-600 font-mono">{formData.userId}</p>
                        </div>
                        <button type="button" onClick={() => setFormData({...formData, userId: '', userName: ''})} className="text-xs font-bold text-red-500 hover:text-red-700 underline">Change User</button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit Mode (User is fixed)
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <label className="text-sm font-bold text-slate-700">Linked User ID</label>
                      <input type="text" disabled value={formData.userId} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm cursor-not-allowed text-slate-500" />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <label className="text-sm font-bold text-slate-700">User Name</label>
                      <input type="text" disabled value={formData.userName} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm cursor-not-allowed text-slate-500" />
                    </div>
                  </div>
                )}

                {/* Code & Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Referral Code Text <span className="text-red-500">*</span></label>
                    <input type="text" required disabled={!!formData._id} value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. CUSTOM50" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm disabled:bg-slate-50 disabled:text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Referrer Reward (₹) <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                  </div>
                </div>

                {/* --- DISCOUNT CODE SYNC SETTINGS --- */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Use as Discount Code for Buyers</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Generates a parallel discount code using the same text.</p>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, isDiscountLinked: !formData.isDiscountLinked})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.isDiscountLinked ? 'bg-purple-500' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.isDiscountLinked ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {formData.isDiscountLinked && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-4 animate-[fadeIn_0.3s_ease-out]">
                      <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1"><Tag size={12}/> Buyer Discount Settings</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="discountType" className="text-xs font-bold text-purple-900">Discount Type</label>
                          <select id="discountType" value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-400">
                            <option value="Percentage">Percentage (%)</option>
                            <option value="Amount">Flat Amount (₹)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="discountValue" className="text-xs font-bold text-purple-900">Discount Value</label>
                          <input id="discountValue" type="number" min="0" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-400" />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="maxUsage" className="text-xs font-bold text-purple-900">Max Usages (Optional)</label>
                          <input id="maxUsage" type="number" min="0" placeholder="Unlimited" value={formData.maxUsage} onChange={(e) => setFormData({...formData, maxUsage: e.target.value})} className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-400" />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="validTill" className="text-xs font-bold text-purple-900">Expiry Date (Optional)</label>
                          <input id="validTill" type="date" value={formData.validTill} onChange={(e) => setFormData({...formData, validTill: e.target.value})} className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Referral Status</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Suspend this code from generating new rewards.</p>
                  </div>
                  <button type="button" onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Disabled' : 'Active'})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 mt-auto">
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isSaving} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving || !formData.userId} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  {isSaving ? 'Saving...' : 'Save Configuration'}
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
              {isTxnLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 size={32} className="animate-spin text-emerald-600 mb-4" />
                  <p className="text-sm font-medium">Fetching transaction history...</p>
                </div>
              ) : fetchedTransactions.length > 0 ? (
                <div className="space-y-4">
                  {fetchedTransactions.map((txn) => (
                    <div key={txn._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-200 transition-colors">
                      
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">Order {txn.orderId || txn.orderRef} <ArrowUpRight size={14} className="text-slate-400"/></p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(txn.createdAt || txn.date).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        {txn.orderStatus === 'Success' || txn.orderStatus === 'Delivered' ? (
                          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase tracking-wider">Order Complete</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100 uppercase tracking-wider">Order Pending</span>
                        )}

                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">₹{txn.amount}</span>
                          {txn.payoutStatus === 'Paid' ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 w-[80px] justify-end"><CheckCircle size={14}/> Paid</span>
                          ) : (
                            <button 
                              onClick={() => handleMarkPaid(txn._id, txn.amount)}
                              disabled={txn.orderStatus !== 'Success' && txn.orderStatus !== 'Delivered'}
                              className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-[80px]"
                              title={txn.orderStatus !== 'Success' && txn.orderStatus !== 'Delivered' ? "Order must be completed to pay reward" : "Mark as paid to referrer"}
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
                  <p className="text-sm mt-1">This code hasn't been used for any orders.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};