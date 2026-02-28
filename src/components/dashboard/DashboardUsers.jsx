import React, { useState, useEffect, useContext } from 'react';
import { Search, Mail, Phone, ShoppingBag, ChevronRight, Shield, User, X, CheckCircle, Ban, Gift, Loader2 } from 'lucide-react';
import { adminService } from '../../api/service/adminService';
import { OrderDetailsModal } from '../shared/OrderDetailsModal';
import { AdminContext } from '../../context/AdminContext';

export const DashboardUsers = () => {
  
  const { updateLocalOrder } = useContext(AdminContext);  

  // --- SERVER-SIDE STATE ---
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  // --- FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- MODAL & DYNAMIC FETCH STATE ---
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [fetchedOrders, setFetchedOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isTogglingId, setIsTogglingId] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // Make your API call here: await apiClient.put(`/admin/orders/${orderId}`, { status: newStatus });
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
      console.log(error)
      showToast("Failed to update status. " + (error.response?.data?.message || ''));
    } finally {
      setIsUpdatingStatus(false);
      setIsModalOpen(false);
    }
    console.log(`Updating order ${orderId} to ${newStatus}`);
  };

  const handleNotifyUser = (email, type) => {
    console.log(`Sending ${type} notification to ${email}`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase tracking-wider">Delivered</span>;
      case 'In Progress': return <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase tracking-wider">In Progress</span>;
      case 'Cancelled': return <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 uppercase tracking-wider">Cancelled</span>;
      default: return <span className="text-[10px] font-bold px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100 uppercase tracking-wider">Pending</span>;
    }
  };

  // --- TRIGGER API ON FILTER/PAGE CHANGE ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage]);

  const loadUsers = async () => {
    setIsLoadingList(true);
    try {
      const response = await adminService.getUsersPaginated({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery
      });

      if (response && response.users) {
        setUsers(response.users);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      showToast("Failed to load user list.");
    } finally {
      setIsLoadingList(false);
    }
  };

  // --- ACTION HANDLERS ---
  const handleToggleStatus = async (user) => {
    if (user.role === 'Admin') return; // Protection
    
    setIsTogglingId(user._id);
    try {
      await adminService.toggleUserStatus(user._id);
      
      // Update UI locally without full reload
      const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
      setUsers(prev => prev.map(u => 
        u._id === user._id ? { ...u, status: newStatus } : u
      ));
      
      showToast(`${user.name}'s account is now ${newStatus}.`);
    } catch (error) {
      showToast("Failed to update user status.");
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleOpenOrders = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setIsOrdersLoading(true);
    try {
      const orders = await adminService.getUserOrders(user._id);
      console.log(orders)
      setFetchedOrders(orders.orders);
    } catch (error) {
      console.error("Failed to load user orders:", error);
      showToast("Failed to load order history.");
      setFetchedOrders([]);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(isoString));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      
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
          <h1 className="text-2xl font-bold text-slate-800">Users & Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage accounts, permissions, and view histories.</p>
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, email, or mobile..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
              Fetching user directory...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-100">Customer Details</th>
                  <th className="p-4 font-bold border-b border-slate-100">Contact Info</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-center">Account Access</th>
                  <th className="p-4 font-bold border-b border-slate-100">Store Activity</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${user.role === 'Admin' ? 'bg-purple-800 text-white' : 'bg-emerald-800 text-white'}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-slate-800">{user.name}</p>
                              
                              {user.role === 'Admin' ? (
                                <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold"><Shield size={10}/> Admin</span>
                              ) : (
                                <span className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold"><User size={10}/> Customer</span>
                              )}
                              
                              {user.referralCode && (
                                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  <Gift size={10}/> Referral Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Joined {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                          <span className="flex items-center gap-2"><Mail size={12}/> {user.email}</span>
                          <span className="flex items-center gap-2"><Phone size={12}/> +91 {user.mobile || 'N/A'}</span>
                        </div>
                      </td>
                      
                      {/* --- TOGGLE SWITCH AREA --- */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {user.status === 'Active' ? (
                            <span className="w-16 text-right text-xs font-bold text-emerald-700">Active</span>
                          ) : (
                            <span className="w-16 text-right text-xs font-bold text-slate-400">Disabled</span>
                          )}
                          
                          {isTogglingId === user._id ? (
                            <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              disabled={user.role === 'Admin'} 
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 ${
                                user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                              } ${user.role === 'Admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                  user.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="p-4">
                        {user.ordersCount > 0 ? (
                          <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                            <ShoppingBag size={14} className="text-emerald-600"/> 
                            {user.ordersCount} Orders
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-slate-400">No Orders</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleOpenOrders(user)}
                          disabled={user.ordersCount === 0}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm hover:border-emerald-200 hover:text-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View Orders <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500">
                      <User size={40} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-bold text-slate-600">No Users Found</p>
                      <p className="text-sm mt-1">Try adjusting your search query.</p>
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
            <button className="px-3 py-1.5 rounded-lg font-bold bg-emerald-800 text-white shadow-sm">
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

      {/* --- DYNAMIC USER ORDERS MODAL --- */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[80vh]">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}'s Orders</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/30">
              {isOrdersLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 size={32} className="animate-spin text-emerald-600 mb-4" />
                  <p className="text-sm font-medium">Fetching order history from server...</p>
                </div>
              ) : fetchedOrders.length > 0 ? (
                <div className="space-y-4">
                  {fetchedOrders.map((order) => (
                    <div key={order._id} onClick={() => handleOpenOrder(order)} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-200 transition-colors">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">#{order.orderId}</p>
                          <p className="text-xs text-slate-500">Ordered on {formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <span className="font-bold text-slate-800">₹{order.priceBreakup?.total}</span>
                        
                        {order.status === 'Delivered' && <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase tracking-wider">Delivered</span>}
                        {order.status === 'In Progress' && <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase tracking-wider">In Progress</span>}
                        {order.status === 'Cancelled' && <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 uppercase tracking-wider">Cancelled</span>}
                        {order.status === 'Pending Payment' && <span className="text-[10px] font-bold px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100 uppercase tracking-wider">Pending</span>}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm font-medium">No orders found for this user.</p>
                </div>
              )}
            </div>

            <OrderDetailsModal 
              isOpen={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              order={selectedOrder}
              isAdmin={true} // True if used in Admin Dashboard, False if used in Customer Dashboard
              onUpdateStatus={handleUpdateStatus}
              onNotifyUser={handleNotifyUser}
            />
                  
          </div>
        </div>
      )}

    </div>
  );
};