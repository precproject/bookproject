import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Search, Calendar, Download, BellRing, CheckCircle, 
  AlertCircle, Clock, ChevronDown, ChevronUp, X, Save, Loader2, 
  MapPin, CreditCard, Truck, Receipt, Package, User, Tag, Gift
} from 'lucide-react';
import { AdminContext } from '../../context/AdminContext';
import { adminService } from '../../api/service/adminService';

export const DashboardOrders = () => {
  // --- CONSUME GLOBAL CACHE ---
  const { orderCache, fetchAdminOrders, updateLocalOrder } = useContext(AdminContext);
  
  // --- SERVER-SIDE PAGINATION STATE ---
  const [currentOrderIds, setCurrentOrderIds] = useState([]); 
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  // --- FILTER & SORT STATE ---
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; 

  // --- MODAL & STATUS STATE ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitExpanded, setIsTransitExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // --- TRIGGER API ON FILTER/PAGE CHANGE ---
  useEffect(() => {
    // Debounce to prevent spamming the API while typing
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 400); 

    return () => clearTimeout(delayDebounceFn);
    // Re-run whenever ANY of these filters change
  }, [activeTab, searchQuery, sortOrder, startDate, endDate, currentPage]);

  const loadData = async () => {
    setIsLoadingList(true);
    try {
      // Create the query parameters exactly as the backend expects them
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: activeTab !== 'All Orders' ? activeTab : '',
        search: searchQuery,
        sort: sortOrder,
        startDate: startDate || '',
        endDate: endDate || ''
      };

      // Calls context -> hits API -> saves to global cache
      const response = await fetchAdminOrders(params);

      // The Context handles saving the raw data. This component only keeps track of which IDs to show right now.
      if (response && response.orders) {
        setCurrentOrderIds(response.orders.map(o => o._id));
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
      }
      
    } catch (error) {
      console.error("Error loading paginated data:", error);
      showToast("Failed to load orders from server.");
    } finally {
      setIsLoadingList(false);
    }
  };

  // --- MAP IDs TO ACTUAL DATA ---
  // We use useMemo so it only recalculates when currentOrderIds or the global cache changes
  const visibleOrders = useMemo(() => {
    return currentOrderIds.map(id => orderCache[id]).filter(Boolean);
  }, [currentOrderIds, orderCache]);


  // --- ACTION HANDLERS ---
  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsTransitExpanded(false);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (newStatus === selectedOrder.status) return;
    
    setIsUpdatingStatus(true);
    try {
      // 1. Send update to Backend API
      await adminService.updateOrderStatus(selectedOrder._id, newStatus);
      
      // 2. Update global cache. Because `visibleOrders` relies on `orderCache`, the UI updates instantly!
      updateLocalOrder(selectedOrder._id, { status: newStatus });
      
      // 3. Update the modal's internal state
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      
      showToast(`Order #${selectedOrder.orderId} updated to ${newStatus}`);
    } catch (error) {
      showToast("Failed to update status. " + (error.response?.data?.message || ''));
    } finally {
      setIsUpdatingStatus(false);
      setIsModalOpen(false);
    }
  };

  const handleNotifyUser = (email, type) => {
    showToast(`Payment ${type} reminder triggered for ${email}`);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- UI HELPERS ---
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle size={12}/> Delivered</span>;
      case 'Cancelled': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100"><AlertCircle size={12}/> Cancelled</span>;
      case 'Pending Payment': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100"><Clock size={12}/> Pending</span>;
      case 'In Progress': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"><Truck size={12}/> In Progress</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
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
          <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, update, and track customer purchases.</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {['All Orders', 'Pending Payment', 'In Progress', 'Delivered', 'Cancelled'].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? 'bg-emerald-800 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row gap-4 pt-2">
            
            {/* Server-Side Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                placeholder="Search by Order ID, Name, Email..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Calendar size={16} className="text-slate-400 mr-2" />
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="bg-transparent text-sm text-slate-600 outline-none w-28 cursor-pointer" />
                <span className="text-slate-400 mx-2">-</span>
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="bg-transparent text-sm text-slate-600 outline-none w-28 cursor-pointer" />
              </div>
              
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
              Fetching orders from server...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-100">Order ID</th>
                  <th className="p-4 font-bold border-b border-slate-100">Customer</th>
                  <th className="p-4 font-bold border-b border-slate-100">Date</th>
                  <th className="p-4 font-bold border-b border-slate-100">Amount</th>
                  <th className="p-4 font-bold border-b border-slate-100">Status</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 text-sm">#{order.orderId}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                          {(order.user?.name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{order.user?.name || 'Guest'}</p>
                          <p className="text-xs text-slate-500">{order.user?.email || order.user?.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatDateTime(order.createdAt).split(',')[0]}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">₹{order.priceBreakup?.total}</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenModal(order)} className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 hover:border-emerald-200 transition-all active:scale-95">
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500 font-medium">No orders found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Server-Side Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
          <span>Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} total orders</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1 || isLoadingList} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-medium"
            >
              Prev
            </button>
            <button className="px-3 py-1.5 rounded-lg font-bold bg-emerald-800 text-white shadow-sm">
              {currentPage}
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
              disabled={currentPage === totalPages || isLoadingList || totalPages === 0} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- COMPREHENSIVE VIEW ORDER MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-700">
                  <Receipt size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800">Order #{selectedOrder.orderId}</h2>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Placed on {formatDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  
                  {/* Items & Price Breakup */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                      <Package size={16} className="text-slate-500"/>
                      <h3 className="text-sm font-bold text-slate-800">Order Items</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="w-12 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400">
                              <Package size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-1">Qty: {item.qty} × ₹{item.price} • {item.book?.type || 'Physical'}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-800">₹{item.qty * item.price}</p>
                        </div>
                      ))}
                      
                      <div className="border-t border-slate-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                          <p>Subtotal</p>
                          <p>₹{selectedOrder.priceBreakup?.subtotal || 0}</p>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                          <p>Shipping</p>
                          <p>₹{selectedOrder.priceBreakup?.shipping || 0}</p>
                        </div>
                        {selectedOrder.priceBreakup?.discountAmount < 0 && (
                          <div className="flex justify-between text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                            <p className="flex items-center gap-1"><Tag size={12}/> Discount</p>
                            <p>{selectedOrder.priceBreakup.discountAmount}</p>
                          </div>
                        )}

                        {selectedOrder.referralCode && (
                          <div className="flex justify-between items-center text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <div className="flex flex-col">
                              <p className="flex items-center gap-1 font-bold"><Gift size={12}/> Referral Applied</p>
                            </div>
                            <p className="font-mono bg-amber-100 px-2 py-0.5 rounded text-xs">{selectedOrder.referralCode}</p>
                          </div>
                        )}

                        <div className="flex justify-between text-base font-black text-slate-800 pt-2 border-t border-slate-200">
                          <p>Final Total</p>
                          <p>₹{selectedOrder.priceBreakup?.total || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-slate-500"/>
                        <h3 className="text-sm font-bold text-slate-800">Payment Details</h3>
                      </div>
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedOrder.payment?.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {selectedOrder.payment?.status || 'Pending'}
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Transaction ID</p>
                        <p className="text-sm font-mono font-medium text-slate-700 break-all">{selectedOrder.payment?.transactionId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Gateway</p>
                        <p className="text-sm font-bold text-slate-700">PhonePe / UPI</p>
                      </div>
                    </div>
                    
                    {selectedOrder.status === 'Pending Payment' && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <button 
                          onClick={() => handleNotifyUser(selectedOrder.user?.email, 'Pending')}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                        >
                          <BellRing size={16} /> Send Payment Reminder
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  
                  {/* Customer & Shipping */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                      <User size={16} className="text-slate-500"/>
                      <h3 className="text-sm font-bold text-slate-800">Customer & Delivery</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{(selectedOrder.user?.name || 'G').charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{selectedOrder.user?.name || 'Guest User'}</p>
                          <p className="text-xs text-slate-500">{selectedOrder.user?.email} • {selectedOrder.user?.mobile}</p>
                        </div>
                      </div>
                      
                      {selectedOrder.shippingAddress !== 'Digital Delivery' ? (
                        <>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3 items-start">
                            <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 leading-relaxed">{selectedOrder.shippingAddress}</p>
                          </div>
                          {selectedOrder.shipping?.trackingId && (
                            <div className="flex items-center justify-between text-sm bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                               <div className="flex items-center gap-2"><Truck size={14} className="text-blue-600"/> <span className="font-bold text-slate-700">{selectedOrder.shipping.partner}</span></div>
                               <span className="font-mono text-xs font-bold text-blue-700">{selectedOrder.shipping.trackingId}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex gap-3 items-center text-emerald-700 font-medium text-sm">
                          <CheckCircle size={16} /> Digital Delivery (E-Book)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transit History Expandable */}
                  {selectedOrder.transitHistory && selectedOrder.transitHistory.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <button 
                        onClick={() => setIsTransitExpanded(!isTransitExpanded)}
                        className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-slate-500"/>
                          <h3 className="text-sm font-bold text-slate-800">Transit History</h3>
                        </div>
                        {isTransitExpanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                      </button>
                      
                      {isTransitExpanded && (
                        <div className="p-6">
                          <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                            {selectedOrder.transitHistory.map((step, idx) => {
                              const isLast = idx === selectedOrder.transitHistory.length - 1;
                              const isDelivered = step.stage === 'Delivered';
                              return (
                                <div key={step._id || idx} className="relative">
                                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white ${isLast ? (isDelivered ? 'bg-emerald-500' : 'bg-orange-500') : 'bg-slate-300'}`} />
                                  <p className={`text-sm font-bold ${isLast ? (isDelivered ? 'text-emerald-700' : 'text-orange-600') : 'text-slate-600'}`}>{step.stage}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(step.timestamp)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="w-full sm:w-auto flex items-center gap-3">
                <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Order Status:</label>
                <div className="relative w-full sm:w-48">
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  >
                    <option value="Pending Payment">Pending Payment</option>
                    <option value="In Progress">In Progress (Shipped)</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <button 
                onClick={handleSaveStatus}
                disabled={newStatus === selectedOrder.status || isUpdatingStatus}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isUpdatingStatus ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};