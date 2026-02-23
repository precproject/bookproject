import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Package, Image as ImageIcon, Search, X, Save, CheckCircle, AlertTriangle, XCircle, BookOpen, Eye, History, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Hash } from 'lucide-react';

// --- STANDARD MOCK DATA ---
const INITIAL_INVENTORY = [
  { 
    id: 'BK-001', title: 'चिंतामुक्ती (Hardcopy)', desc: 'Physical paperback edition.', stock: 1250, price: 350, type: 'Physical',
    history: [
      { id: 1, date: '2026-02-23T10:30:00Z', type: 'Deduction', reason: 'Order #BK-8021', change: -1, balance: 1250 },
      { id: 2, date: '2026-02-20T14:00:00Z', type: 'Addition', reason: 'Supplier Restock', change: 500, balance: 1251 },
      { id: 3, date: '2026-01-15T09:00:00Z', type: 'Creation', reason: 'Initial Setup', change: 751, balance: 751 },
    ]
  },
  { 
    id: 'BK-002', title: 'चिंतामुक्ती (eBook)', desc: 'Digital PDF/ePub format.', stock: null, price: 150, type: 'Digital',
    history: [
      { id: 1, date: '2026-01-10T09:00:00Z', type: 'Creation', reason: 'Initial Setup', change: null, balance: '∞' }
    ]
  },
  { 
    id: 'BK-003', title: 'चिंतामुक्ती (Audiobook)', desc: 'MP3 format narrated by author.', stock: null, price: 200, type: 'Digital',
    history: [
      { id: 1, date: '2026-01-10T09:00:00Z', type: 'Creation', reason: 'Initial Setup', change: null, balance: '∞' }
    ]
  },
  { 
    id: 'BK-004', title: 'Chintamukti (English Print)', desc: 'Translated physical edition.', stock: 12, price: 400, type: 'Physical',
    history: [
      { id: 1, date: '2026-02-22T16:45:00Z', type: 'Deduction', reason: 'Order #BK-8012', change: -2, balance: 12 },
      { id: 2, date: '2026-01-20T11:00:00Z', type: 'Creation', reason: 'Initial Setup', change: 14, balance: 14 },
    ]
  },
];

export const DashboardInventory = () => {
  // --- STATE MANAGEMENT ---
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Forms State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  
  // Notice we added 'originalId' to track the item if the SKU gets edited
  const defaultForm = { originalId: null, id: '', title: '', desc: '', type: 'Physical', price: '', stock: '' };
  const [formData, setFormData] = useState(defaultForm);

  // --- FILTERING LOGIC ---
  const filteredInventory = useMemo(() => {
    let result = [...inventory];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }
    return result;
  }, [inventory, searchQuery]);

  // --- ACTION HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({ ...defaultForm, id: `BK-00${inventory.length + 1}` });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      originalId: item.id, // Store original ID to find it in the array later
      id: item.id,         // This is the editable SKU field
      title: item.title,
      desc: item.desc,
      type: item.type,
      price: item.price,
      stock: item.stock === null ? '' : item.stock
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (item) => {
    setSelectedItem(item);
    setIsHistoryExpanded(true); 
    setIsViewModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this item from inventory?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
      showToast('Item deleted successfully.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Prevent Duplicate SKUs
    const isDuplicateSKU = inventory.some(item => item.id === formData.id && item.id !== formData.originalId);
    if (isDuplicateSKU) {
      alert("This SKU / ID is already in use by another product. Please enter a unique SKU.");
      return;
    }

    const formattedStock = formData.type === 'Digital' ? null : Number(formData.stock);
    
    if (formData.originalId) {
      // --- LOGIC FOR EDITING ---
      const existingItem = inventory.find(item => item.id === formData.originalId);
      let updatedHistory = [...existingItem.history];
      
      // If stock changed manually, log it in history
      if (existingItem.type === 'Physical' && formattedStock !== existingItem.stock) {
        const stockDiff = formattedStock - existingItem.stock;
        updatedHistory.unshift({
          id: Date.now(),
          date: new Date().toISOString(),
          type: stockDiff > 0 ? 'Addition' : 'Deduction',
          reason: 'Manual Adjustment',
          change: stockDiff,
          balance: formattedStock
        });
      }

      setInventory(prev => prev.map(item => item.id === formData.originalId ? {
        ...item,
        id: formData.id, // The updated SKU
        title: formData.title,
        desc: formData.desc,
        type: formData.type,
        price: Number(formData.price),
        stock: formattedStock,
        history: updatedHistory
      } : item));
      showToast('Inventory updated successfully.');
    } else {
      // --- LOGIC FOR CREATING NEW ---
      const newHistory = [{
        id: Date.now(),
        date: new Date().toISOString(),
        type: 'Creation',
        reason: 'Initial Setup',
        change: formattedStock,
        balance: formattedStock || '∞'
      }];

      setInventory([{
        id: formData.id,
        title: formData.title,
        desc: formData.desc,
        type: formData.type,
        price: Number(formData.price),
        stock: formattedStock,
        history: newHistory
      }, ...inventory]);
      showToast('New product added to inventory.');
    }
    setIsEditModalOpen(false);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- UI HELPERS ---
  const formatDateTime = (isoString) => {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  };

  const getStatusInfo = (item) => {
    if (item.type === 'Digital') {
      return { label: 'Available', style: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle };
    }
    if (item.stock === 0) {
      return { label: 'Out of Stock', style: 'bg-red-50 text-red-700 border-red-100', icon: XCircle };
    }
    if (item.stock <= 50) {
      return { label: 'Low Stock', style: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: AlertTriangle };
    }
    return { label: 'In Stock', style: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Book Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage book details, pricing, and stock levels.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Add New Product
        </button>
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
              placeholder="Search by title or SKU..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">Product Info</th>
                <th className="p-4 font-bold border-b border-slate-100">SKU / ID</th>
                <th className="p-4 font-bold border-b border-slate-100">Price</th>
                <th className="p-4 font-bold border-b border-slate-100">Stock Count</th>
                <th className="p-4 font-bold border-b border-slate-100">Status</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const statusInfo = getStatusInfo(item);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                            {item.type === 'Physical' ? <BookOpen size={20} /> : <ImageIcon size={20} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                            <span className="text-xs text-slate-500 mt-0.5">{item.desc}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono font-medium text-slate-600 bg-slate-50/50 rounded-lg">{item.id}</td>
                      <td className="p-4 text-sm font-bold text-slate-800">₹{item.price}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                          <Package size={14} className="text-emerald-600"/> 
                          {item.type === 'Digital' ? '∞' : item.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.style}`}>
                          <StatusIcon size={12}/> {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenView(item)} title="View Info & History" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"><Eye size={16} /></button>
                          <button onClick={() => handleOpenEdit(item)} title="Edit Details" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} title="Delete Product" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    <BookOpen size={40} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold text-slate-600">No Inventory Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {formData.originalId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Configure product info and stock.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="overflow-y-auto">
              <div className="p-6 space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* EDITABLE SKU/ID FIELD */}
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">SKU / Product ID <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        required
                        value={formData.id}
                        onChange={(e) => setFormData({...formData, id: e.target.value.toUpperCase()})}
                        placeholder="e.g. BK-001" 
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Product Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value, stock: e.target.value === 'Digital' ? '' : formData.stock})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    >
                      <option value="Physical">Physical Book</option>
                      <option value="Digital">Digital / eBook</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Product Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. चिंतामुक्ती (Hardcopy)" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Short Description <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.desc}
                    onChange={(e) => setFormData({...formData, desc: e.target.value})}
                    placeholder="e.g. Physical paperback edition." 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Price (₹) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g. 350" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                  />
                </div>

                <div className={`space-y-2 p-4 rounded-xl border ${formData.type === 'Digital' ? 'bg-slate-50 border-slate-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <label className="text-sm font-bold text-slate-700">Inventory Stock <span className="text-red-500">*</span></label>
                  {formData.type === 'Digital' ? (
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mt-2">
                      <Package size={16} /> Digital products have infinite stock.
                    </div>
                  ) : (
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      placeholder="Enter quantity available..." 
                      className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm mt-1" 
                    />
                  )}
                </div>

              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md">
                  <Save size={18} /> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PRODUCT & HISTORY MODAL --- */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-500">
                  {selectedItem.type === 'Physical' ? <BookOpen size={24} /> : <ImageIcon size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedItem.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 font-mono">SKU: {selectedItem.id} • {selectedItem.type}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Stock</p>
                  <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    {selectedItem.type === 'Digital' ? '∞' : selectedItem.stock}
                    <span className="text-sm font-medium text-slate-500">Units</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                  <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    ₹{selectedItem.price}
                    <span className="text-sm font-medium text-slate-500">Per unit</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button 
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-slate-500"/>
                    <h3 className="text-sm font-bold text-slate-800">Inventory Update History</h3>
                  </div>
                  {isHistoryExpanded ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                </button>
                
                {isHistoryExpanded && (
                  <div className="p-0">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Date & Time</th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Action / Reason</th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Change</th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItem.history.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 text-xs text-slate-600">{formatDateTime(log.date)}</td>
                            <td className="p-3">
                              <p className="text-sm font-bold text-slate-800">{log.type}</p>
                              <p className="text-xs text-slate-500">{log.reason}</p>
                            </td>
                            <td className="p-3 text-right">
                              {log.change === null ? (
                                <span className="text-sm text-slate-400 font-bold">-</span>
                              ) : (
                                <span className={`flex items-center justify-end gap-1 text-sm font-bold ${log.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {log.change > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                                  {log.change > 0 ? '+' : ''}{log.change}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm font-bold text-slate-800 text-right">{log.balance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};