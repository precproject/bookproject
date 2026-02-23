import React, { useState, useMemo } from 'react';
import { Search, Mail, Phone, ShoppingBag, ChevronRight, Shield, User, X, CheckCircle, Ban, Gift, Loader2 } from 'lucide-react';

// --- STANDARD MOCK DATA ---
const INITIAL_USERS = [
  { id: 'USR-001', name: 'Rahul Patil', email: 'rahul.p@email.com', mobile: '9876543210', role: 'Customer', status: 'Active', joined: '2026-11-10', spent: 800, ordersCount: 2, referralEnabled: true },
  { id: 'USR-002', name: 'System Admin', email: 'admin@chintamukti.com', mobile: '9999999999', role: 'Admin', status: 'Active', joined: '2026-01-01', spent: 0, ordersCount: 0, referralEnabled: false },
  { id: 'USR-003', name: 'Sneha Deshmukh', email: 'sneha.d@email.com', mobile: '8765432109', role: 'Customer', status: 'Disabled', joined: '2026-11-22', spent: 400, ordersCount: 1, referralEnabled: false },
  { id: 'USR-004', name: 'Amit Kulkarni', email: 'amit.k@email.com', mobile: '7654321098', role: 'Customer', status: 'Active', joined: '2026-11-05', spent: 1600, ordersCount: 4, referralEnabled: true },
  { id: 'USR-005', name: 'Priya Shinde', email: 'priya.s@email.com', mobile: '6543210987', role: 'Customer', status: 'Active', joined: '2026-11-25', spent: 400, ordersCount: 1, referralEnabled: false },
  { id: 'USR-006', name: 'Vikram Thakur', email: 'vikram.t@email.com', mobile: '5432109876', role: 'Customer', status: 'Active', joined: '2026-11-20', spent: 400, ordersCount: 1, referralEnabled: true },
];

export const DashboardUsers = () => {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal & Dynamic Fetch State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [fetchedOrders, setFetchedOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // --- FILTERING LOGIC ---
  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.mobile.includes(query)
      );
    }
    return result;
  }, [users, searchQuery]);

  // --- PAGINATION LOGIC ---
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (currentPage > totalPages) setCurrentPage(totalPages);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- ACTION HANDLERS ---
  
  // Single Toggle Switch Logic
  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
        showToast(`${user.name}'s account is now ${newStatus}.`);
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  // Simulated API Call to fetch orders dynamically
  const mockFetchOrders = async (user) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = Array.from({ length: user.ordersCount }).map((_, i) => ({
          id: `BK-${8000 + Math.floor(Math.random() * 1000)}`,
          date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
          amount: user.spent / user.ordersCount,
          status: Math.random() > 0.2 ? 'Success' : 'Pending Payment'
        }));
        resolve(orders);
      }, 800); 
    });
  };

  const handleOpenOrders = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setIsOrdersLoading(true);
    const data = await mockFetchOrders(user);
    setFetchedOrders(data);
    setIsOrdersLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer accounts and view histories.</p>
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">Customer Details</th>
                <th className="p-4 font-bold border-b border-slate-100">Contact Info</th>
                <th className="p-4 font-bold border-b border-slate-100 text-center">Account Access</th>
                <th className="p-4 font-bold border-b border-slate-100">Orders & Spent</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${user.role === 'Admin' ? 'bg-purple-800 text-white' : 'bg-emerald-800 text-white'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-slate-800">{user.name}</p>
                            
                            {user.role === 'Admin' ? (
                              <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold"><Shield size={10}/> Admin</span>
                            ) : (
                              <span className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold"><User size={10}/> Customer</span>
                            )}
                            
                            {user.referralEnabled && (
                              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                <Gift size={10}/> Referral Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Joined {user.joined}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                        <span className="flex items-center gap-2"><Mail size={12}/> {user.email}</span>
                        <span className="flex items-center gap-2"><Phone size={12}/> +91 {user.mobile}</span>
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
                        
                        {/* The Premium Animated Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={user.role === 'Admin'} // Protect admins from being disabled
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 ${
                            user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                          } ${user.role === 'Admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          role="switch"
                          aria-checked={user.status === 'Active'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                              user.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Orders & Spent with Hover Tooltip */}
                    <td className="p-4">
                      {user.ordersCount > 0 ? (
                        <div className="group relative inline-flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-help transition-colors hover:bg-slate-200">
                          <ShoppingBag size={14} className="text-emerald-600"/> 
                          {user.ordersCount} Orders
                          
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg animate-[scaleIn_0.1s_ease-out] z-10">
                            Total Spent: ₹{user.spent}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">0 Orders</span>
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
        </div>

        {/* Pagination Footer */}
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

      {/* --- DYNAMIC USER ORDERS MODAL --- */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[80vh]">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}'s Orders</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedUser.email} • {selectedUser.ordersCount} Total Orders</p>
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
              ) : (
                <div className="space-y-4">
                  {fetchedOrders.map((order, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-200 transition-colors">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{order.id}</p>
                          <p className="text-xs text-slate-500">Ordered on {order.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <span className="font-bold text-slate-800">₹{order.amount}</span>
                        
                        {order.status === 'Success' && <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase tracking-wider">Success</span>}
                        {order.status === 'Failed' && <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 uppercase tracking-wider">Failed</span>}
                        {order.status === 'Pending Payment' && <span className="text-[10px] font-bold px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100 uppercase tracking-wider">Pending</span>}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};