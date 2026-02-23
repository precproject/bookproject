import React, { useState, useMemo } from 'react';
import { Plus, Tag, Edit, Trash2, CheckCircle, XCircle, Search, X, Save, IndianRupee } from 'lucide-react';

// --- STANDARD MOCK DATA ---
const INITIAL_DISCOUNTS = [
  { id: 'DC-001', code: 'FESTIVAL20', type: 'Percentage', value: 20, maxDiscount: 150, validTill: '2026-12-31', currentUsage: 45, maxUsage: 100, totalDiscountProvided: 6750, status: 'Active' },
  { id: 'DC-002', code: 'FLAT50', type: 'Amount', value: 50, maxDiscount: 50, validTill: '2026-11-15', currentUsage: 200, maxUsage: 200, totalDiscountProvided: 10000, status: 'Expired' },
  { id: 'DC-003', code: 'WELCOME10', type: 'Percentage', value: 10, maxDiscount: 100, validTill: '', currentUsage: 892, maxUsage: null, totalDiscountProvided: 89200, status: 'Active' },
];

export const DashboardDiscounts = () => {
  // --- STATE MANAGEMENT ---
  const [discounts, setDiscounts] = useState(INITIAL_DISCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form State
  const defaultForm = { id: null, code: '', type: 'Percentage', value: '', maxDiscount: '', validTill: '', maxUsage: '' };
  const [formData, setFormData] = useState(defaultForm);

  // --- FILTERING LOGIC ---
  const filteredDiscounts = useMemo(() => {
    let result = [...discounts];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => d.code.toLowerCase().includes(query));
    }
    return result;
  }, [discounts, searchQuery]);

  // Stats
  const activeCount = discounts.filter(d => d.status === 'Active').length;
  const totalSaved = discounts.reduce((acc, curr) => acc + curr.totalDiscountProvided, 0);

  // --- ACTION HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (discount) => {
    setFormData({
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      maxDiscount: discount.maxDiscount,
      validTill: discount.validTill || '',
      maxUsage: discount.maxUsage || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      setDiscounts(prev => prev.filter(d => d.id !== id));
      showToast('Discount code deleted successfully.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Determine status based on dates and limits
    let newStatus = 'Active';
    if (formData.validTill && new Date(formData.validTill) < new Date()) newStatus = 'Expired';
    if (formData.maxUsage && formData.currentUsage >= parseInt(formData.maxUsage)) newStatus = 'Expired'; // Exhausted

    if (formData.id) {
      // Edit Existing
      setDiscounts(prev => prev.map(d => d.id === formData.id ? {
        ...d,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        maxDiscount: Number(formData.maxDiscount),
        validTill: formData.validTill,
        maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
        status: newStatus
      } : d));
      showToast('Discount updated successfully.');
    } else {
      // Add New
      const newDiscount = {
        id: `DC-${Math.floor(Math.random() * 10000)}`,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        maxDiscount: Number(formData.maxDiscount),
        validTill: formData.validTill,
        currentUsage: 0,
        maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
        totalDiscountProvided: 0,
        status: newStatus
      };
      setDiscounts([newDiscount, ...discounts]);
      showToast('New discount code created.');
    }
    setIsModalOpen(false);
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
              {filteredDiscounts.length > 0 ? (
                filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-slate-50/50 transition-colors">
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
                      {/* Premium Hover Tooltip for Usage */}
                      <div className="group relative inline-flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-help transition-colors hover:bg-slate-200">
                        {discount.currentUsage} / {discount.maxUsage || '∞'}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-lg animate-[scaleIn_0.1s_ease-out] z-10">
                          Total Value Provided: <span className="text-emerald-400 font-bold">₹{discount.totalDiscountProvided.toLocaleString()}</span>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {discount.status === 'Active' ? (
                        <span className="flex items-center w-fit gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700"><CheckCircle size={12}/> Active</span>
                      ) : (
                        <span className="flex items-center w-fit gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500"><XCircle size={12}/> Expired</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(discount)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(discount.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
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
                <h2 className="text-xl font-bold text-slate-800">{formData.id ? 'Edit Discount Code' : 'Create Discount Code'}</h2>
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
                      placeholder="Leave blank for unlimited" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                    />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md">
                  <Save size={18} /> {formData.id ? 'Save Changes' : 'Create Code'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};