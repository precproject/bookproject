import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Package, Image as ImageIcon, Search, 
  X, Save, CheckCircle, AlertTriangle, XCircle, BookOpen, 
  Eye, History, ChevronDown, ChevronUp, TrendingUp, TrendingDown, 
  Hash, Loader2, Upload, Scale, EyeOff, User, Building
} from 'lucide-react';
import { adminService } from '../../api/service/adminService';
import { useToast } from '../../context/ToastContext';

export const DashboardInventory = () => {

  const { showToast } = useToast(); // 2. Destructure showToast

  // --- STATE MANAGEMENT ---
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals & Forms State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  
  const fileInputRef = useRef(null);

  // CRITICAL FIX: Form state now perfectly matches the Book Schema
  const defaultForm = { 
    _id: null, sku: '', title: '', description: '', 
    type: 'Physical', price: '', stock: '', weightInGrams: 500, 
    coverImage: '', status: 'Active', author: 'SahakarStree', publisher: 'Independent'
  };
  const [formData, setFormData] = useState(defaultForm);

  // --- FETCH LIVE DATA (WITH DEBOUNCE) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadInventory();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getInventory({ search: searchQuery });
      setInventory(data || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      showToast("Error fetching inventory data.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTION HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({ ...defaultForm, sku: `BK-00${inventory.length + 1}` });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      _id: item._id, 
      sku: item.sku || item.id, 
      title: item.title,
      description: item.description,
      type: item.type,
      price: item.price,
      stock: item.stock === null ? '' : item.stock,
      weightInGrams: item.weightInGrams || 500,
      coverImage: item.coverImage || '',
      status: item.status || 'Active',
      author: item.author || 'SahakarStree',
      publisher: item.publisher || 'Independent'
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this item from inventory? It may affect past order displays.')) {
      try {
        await adminService.deleteInventory(id);
        setInventory(prev => prev.filter(item => item._id !== id));
        showToast('Item deleted successfully.');
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to delete item.');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be smaller than 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const response = await adminService.uploadImage(uploadData);
      
      setFormData({ ...formData, coverImage: response.imageUrl });
      showToast("Image uploaded and optimized securely.");
    } catch (error) {
      console.error(error);
      showToast("Image upload failed. Please check network or file type.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const isDigital = formData.type === 'Digital';
      // CRITICAL FIX: Payload now sends Author & Publisher to backend
      const payload = {
        sku: formData.sku.toUpperCase(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: Number(formData.price),
        stock: isDigital ? null : Number(formData.stock),
        weightInGrams: isDigital ? 0 : Number(formData.weightInGrams),
        coverImage: formData.coverImage,
        status: formData.status,
        author: formData.author,
        publisher: formData.publisher
      };

      if (formData._id) {
        await adminService.updateInventory(formData._id, payload);
        showToast('Inventory updated successfully.');
      } else {
        await adminService.addInventory(payload);
        showToast('New product added to inventory.');
      }
      
      setIsEditModalOpen(false);
      loadInventory(); 
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenView = (item) => {
    setSelectedItem(item);
    setIsHistoryExpanded(true); 
    setIsViewModalOpen(true);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  };

  const getStatusInfo = (item) => {
    if (item.status === 'Inactive') {
      return { label: 'Hidden (Inactive)', style: 'bg-slate-100 text-slate-600 border-slate-200', icon: EyeOff };
    }
    
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
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      
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
          <p className="text-sm text-slate-500 mt-1">Manage book details, pricing, and live stock levels.</p>
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
              Loading inventory database...
            </div>
          ) : (
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
                {inventory.length > 0 ? (
                  inventory.map((item) => {
                    const statusInfo = getStatusInfo(item);
                    const StatusIcon = statusInfo.icon;
                    const visualSku = item.sku || item.id; 
                    
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-16 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden ${item.status === 'Inactive' ? 'opacity-50 grayscale' : 'text-slate-400'}`}>
                              {item.coverImage ? (
                                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                              ) : item.type === 'Physical' ? (
                                <BookOpen size={20} />
                              ) : (
                                <ImageIcon size={20} />
                              )}
                            </div>
                            <div className={`flex flex-col ${item.status === 'Inactive' ? 'opacity-50' : ''}`}>
                              <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                              <span className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{item.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-mono font-medium text-slate-600 bg-slate-50/50 rounded-lg">{visualSku}</td>
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
                            <button onClick={() => handleDelete(item._id)} title="Delete Product" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
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
          )}
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {formData._id ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Configure product info, stock, and publishing details.</p>
              </div>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="overflow-y-auto flex flex-col flex-1">
              <div className="p-6 space-y-6 flex-1">

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Storefront Visibility</p>
                    <p className="text-xs text-slate-500">Should this book be visible to customers?</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} 
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {/* Basic Identifiers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">SKU / Product ID <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
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

                {/* NEW: Author & Publisher Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Author Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        required
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        placeholder="e.g. SahakarStree" 
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Publisher</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={formData.publisher}
                        onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                        placeholder="e.g. Independent" 
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Short Description <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g. Physical paperback edition." 
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm resize-none" 
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-sm font-bold text-slate-700">Cover Image / File URL</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={formData.coverImage}
                        onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                        placeholder="https://yourserver.com/uploads/..." 
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" 
                      />
                    </div>
                    
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  
                  {formData.coverImage && (
                    <div className="mt-3 flex items-start gap-3">
                      <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-white">
                        <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-2 gap-4">
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

                  <div className={`space-y-2 p-3 rounded-xl border ${formData.type === 'Digital' ? 'bg-slate-50 border-slate-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <label className="text-sm font-bold text-slate-700">Inventory Stock <span className="text-red-500">*</span></label>
                    {formData.type === 'Digital' ? (
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-xs mt-2">
                        <Package size={14} /> Infinite stock
                      </div>
                    ) : (
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        placeholder="Qty" 
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm mt-1" 
                      />
                    )}
                  </div>
                </div>

                {/* Weight (Delhivery) */}
                {formData.type === 'Physical' && (
                  <div className="space-y-2 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Scale size={16} className="text-orange-500"/> Product Weight (Grams) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-2">Required for accurate Delhivery shipping rate calculations.</p>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={formData.weightInGrams}
                        onChange={(e) => setFormData({...formData, weightInGrams: e.target.value})}
                        placeholder="e.g. 500" 
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 shadow-sm" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">g</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto shrink-0">
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isSaving} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving || isUploading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  {isSaving ? 'Saving...' : 'Save Product'}
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
                <div className="w-12 h-16 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                  {selectedItem.coverImage ? (
                    <img src={selectedItem.coverImage} alt={selectedItem.title} className="w-full h-full object-cover" />
                  ) : selectedItem.type === 'Physical' ? (
                    <BookOpen size={24} />
                  ) : (
                    <ImageIcon size={24} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedItem.title} 
                    {selectedItem.status === 'Inactive' && <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Hidden</span>}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-mono">SKU: {selectedItem.sku || selectedItem.id} • {selectedItem.type}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1 space-y-6">
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <span className="text-sm font-medium text-slate-500">/ unit</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center col-span-2 lg:col-span-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ship Weight</p>
                  <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    {selectedItem.type === 'Digital' ? '-' : `${selectedItem.weightInGrams || 500}g`}
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
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Date & Time</th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Action / Reason</th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Change</th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItem.history && selectedItem.history.length > 0 ? (
                          selectedItem.history.map((log) => (
                            <tr key={log._id || log.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 text-xs text-slate-600">{formatDateTime(log.date || log.createdAt)}</td>
                              <td className="p-3">
                                <p className="text-sm font-bold text-slate-800">{log.type}</p>
                                <p className="text-xs text-slate-500">{log.reason}</p>
                              </td>
                              <td className="p-3 text-right">
                                {log.change === null || log.change === undefined ? (
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-6 text-center text-slate-500 text-sm">No history records found for this item.</td>
                          </tr>
                        )}
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