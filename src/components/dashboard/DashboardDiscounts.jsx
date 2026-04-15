import React, { useState, useEffect } from 'react';
import { 
  Plus, Tag, Edit, Trash2, CheckCircle, XCircle, Search, X, Save, IndianRupee, Loader2, AlertCircle, Clock
} from 'lucide-react';
import { adminService } from '../../api/service/adminService';
import { useToast } from '../../context/ToastContext';

export const DashboardDiscounts = () => {
  const { showToast } = useToast(); 

  // --- STATE MANAGEMENT ---
  const [discounts, setDiscounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const defaultForm = { _id: null, code: '', type: 'Percentage', value: '', maxDiscount: '', validTill: '', maxUsage: '' };
  const [formData, setFormData] = useState(defaultForm);

  // --- FETCH LIVE DATA (WITH DEBOUNCE) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadDiscounts();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadDiscounts = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDiscounts({ search: searchQuery });
      setDiscounts(data || []);
    } catch (error) {
      console.error("Failed to load discounts:", error);
      showToast("Error fetching discount codes.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- DYNAMIC STATS CALCULATION ---
  const activeCount = discounts.filter(d => {
    const isExpired = d.validTill && new Date(d.validTill) < new Date();
    const isExhausted = d.maxUsage && d.currentUsage >= d.maxUsage;
    return d.status === 'Active' && !isExpired && !isExhausted;
  }).length;
  
  const totalSaved = discounts.reduce((acc, curr) => acc + (curr.totalDiscountProvided || 0), 0); 

  // --- ACTION HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (discount) => {
    setFormData({
      _id: discount._id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      maxDiscount: discount.maxDiscount,
      validTill: discount.validTill ? new Date(discount.validTill).toISOString().split('T')[0] : '', 
      maxUsage: discount.maxUsage || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      try {
        await adminService.deleteDiscount(id);
        setDiscounts(prev => prev.filter(d => d._id !== id));
        showToast('Discount code deleted successfully.', 'success');
      } catch (error) {
        showToast('Failed to delete discount.', 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const maxUsageValue = formData.maxUsage && formData.maxUsage !== "" ? Number(formData.maxUsage) : null;
      const validTillValue = formData.validTill && formData.validTill !== "" ? formData.validTill : null;

      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        maxDiscount: Number(formData.maxDiscount),
        validTill: validTillValue,
        maxUsage: maxUsageValue
      };

      if (formData._id) {
        await adminService.updateDiscount(formData._id, payload);
        showToast('Discount updated successfully.', 'success');
      } else {
        await adminService.createDiscount(payload);
        showToast('New discount code created.', 'success');
      }
      
      setIsModalOpen(false);
      loadDiscounts(); 
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save discount.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Discount Codes</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage promotional offers.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Add New Code
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Tag size={20} /></div>
          <div>
            <p className="text-sm font-bold text-emerald-900">Active Codes</p>
            <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600"><IndianRupee size={20} /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">Total Discount Provided</p>
            <p className="text-2xl font-black text-slate-800">₹{totalSaved.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search promo codes..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase placeholder:normal-case" 
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
              Loading discount codes...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-100">Promo Code</th>
                  <th className="p-4 font-bold border-b border-slate-100">Discount Value</th>
                  <th className="p-4 font-bold border-b border-slate-100">Max Discount</th>
                  <th className="p-4 font-bold border-b border-slate-100">Validity</th>
                  <th className="p-4 font-bold border-b border-slate-100">Usage</th>
                  <th className="p-4 font-bold border-b border-slate-100">Status</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.length > 0 ? (
                  discounts.map((discount) => {
                    const isExpired = discount.validTill && new Date(discount.validTill) < new Date();
                    const isExhausted = discount.maxUsage && discount.currentUsage >= discount.maxUsage;
                    
                    let displayStatus = discount.status;
                    let StatusIcon = CheckCircle;
                    let statusClasses = "bg-slate-100 text-slate-500"; 
                    
                    if (displayStatus === 'Active') {
                      if (isExpired) {
                        displayStatus = 'Expired';
                        StatusIcon = Clock;
                        statusClasses = "bg-rose-50 text-rose-700 border border-rose-100";
                      } else if (isExhausted) {
                        displayStatus = 'Exhausted';
                        StatusIcon = AlertCircle;
                        statusClasses = "bg-amber-50 text-amber-700 border border-amber-100";
                      } else {
                        StatusIcon = CheckCircle;
                        statusClasses = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                      }
                    } else {
                       StatusIcon = XCircle;
                    }

                    return (
                      <tr key={discount._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg tracking-wider border border-slate-200">
                            {discount.code}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">
                              {discount.type === 'Percentage' ? `${discount.value}%` : `₹${discount.value}`}
                            </span>
                            <span className="text-xs text-slate-500">{discount.type}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-medium">₹{discount.maxDiscount}</td>
                        <td className="p-4 text-sm text-slate-600">
                          {discount.validTill ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(discount.validTill)) : 'Never Expires'}
                        </td>
                        <td className="p-4">
                          <div className={`group relative inline-flex items-center gap-2 text-sm font-bold ${isExhausted ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-700 bg-slate-100 border-slate-200'} px-3 py-1.5 rounded-lg cursor-help transition-colors hover:bg-slate-200`}>
                            {discount.currentUsage || 0} / {discount.maxUsage || '∞'}
                            
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-lg animate-[scaleIn_0.1s_ease-out] z-10">
                              Total Value Provided: <span className="text-emerald-400 font-bold">₹{(discount.totalDiscountProvided || 0).toLocaleString()}</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${statusClasses}`}>
                            <StatusIcon size={14} /> {displayStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenEdit(discount)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(discount._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500">
                      <Tag size={40} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-bold text-slate-600">No Discounts Found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{formData._id ? 'Edit Discount Code' : 'Create Discount Code'}</h2>
                <p className="text-xs text-slate-500 mt-1">Configure usage limits and values.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="overflow-y-auto">
              <div className="p-6 space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Promo Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="e.g. DIWALI50" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Discount Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Amount">Flat Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                      Value {formData.type === 'Percentage' ? '(%)' : '(₹)'} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max={formData.type === 'Percentage' ? "100" : undefined}
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      placeholder={formData.type === 'Percentage' ? 'e.g. 20' : 'e.g. 150'} 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Max Discount (₹) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                      placeholder="e.g. 200" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Valid Till <span className="font-normal text-slate-400 text-xs">(Optional)</span></label>
                    <input 
                      type="date" 
                      value={formData.validTill}
                      onChange={(e) => setFormData({...formData, validTill: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm text-slate-600" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Max Usage <span className="font-normal text-slate-400 text-xs">(Optional)</span></label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.maxUsage}
                      onChange={(e) => setFormData({...formData, maxUsage: e.target.value})}
                      placeholder="Blank for unlimited" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                    />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  {formData._id ? 'Save Changes' : 'Create Code'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};