import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Search, Calendar, Download, BellRing, CheckCircle, 
  AlertCircle, Clock, ChevronDown, ChevronUp, X, Save, Loader2, 
  MapPin, CreditCard, Truck, Receipt, Package, User, Tag, Gift
} from 'lucide-react';
import { AdminContext } from '../../context/AdminContext';
import { adminService } from '../../api/service/adminService';
import { OrderDetailsModal } from '../shared/OrderDetailsModal';

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

  const handleSaveStatus = async (orderId, newStatus) => {
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

      <OrderDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        isAdmin={true} // True if used in Admin Dashboard, False if used in Customer Dashboard
        onUpdateStatus={handleSaveStatus}
        onNotifyUser={handleNotifyUser}
      />

    </div>
  );
};