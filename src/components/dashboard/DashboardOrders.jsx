import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, MoreVertical, Download, BellRing, CheckCircle, 
  AlertCircle, Clock, ChevronDown, ChevronUp, X, Save, Send, Loader2, 
  MapPin, CreditCard, Truck, Receipt, Package, User, Tag, Gift
} from 'lucide-react';

// --- STANDARD MOCK DATA FOR TABLE ---
const INITIAL_MOCK_ORDERS = [
  { id: 'BK-8021', user: 'Rahul Patil', email: 'rahul.p@email.com', mobile: '9876543210', date: '2026-02-23T10:30:00Z', amount: 400, status: 'Success', type: 'Hardcopy' },
  { id: 'BK-8022', user: 'Sneha Deshmukh', email: 'sneha.d@email.com', mobile: '8765432109', date: '2026-02-22T14:15:00Z', amount: 400, status: 'Failed', type: 'Hardcopy' },
  { id: 'BK-8023', user: 'Amit Kulkarni', email: 'amit.k@email.com', mobile: '7654321098', date: '2026-02-22T09:00:00Z', amount: 800, status: 'Pending Payment', type: 'Hardcopy' },
  { id: 'BK-8024', user: 'Priya Shinde', email: 'priya.s@email.com', mobile: '6543210987', date: '2026-02-21T16:45:00Z', amount: 400, status: 'In Progress', type: 'Hardcopy' },
  { id: 'BK-8025', user: 'Vikram Thakur', email: 'vikram.t@email.com', mobile: '5432109876', date: '2026-02-21T11:20:00Z', amount: 400, status: 'Success', type: 'Hardcopy' },
];

export const DashboardOrders = () => {
  // --- CORE STATE ---
  const [orders, setOrders] = useState(INITIAL_MOCK_ORDERS);
  
  // --- FILTER & SORT STATE ---
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- MODAL & DYNAMIC FETCH STATE ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isTransitExpanded, setIsTransitExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // --- FILTERING & SORTING LOGIC ---
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];
    if (activeTab !== 'All Orders') result = result.filter(o => o.status === activeTab);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o => o.id.toLowerCase().includes(query) || o.user.toLowerCase().includes(query) || o.email.toLowerCase().includes(query) || o.mobile.includes(query));
    }
    if (startDate) result = result.filter(o => new Date(o.date) >= new Date(startDate));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.date) <= end);
    }
    result.sort((a, b) => {
      const dA = new Date(a.date).getTime(), dB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dB - dA : dA - dB;
    });
    return result;
  }, [orders, activeTab, searchQuery, sortOrder, startDate, endDate]);

  const totalItems = filteredAndSortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (currentPage > totalPages) setCurrentPage(totalPages);
  const paginatedOrders = filteredAndSortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- SIMULATED BACKEND FETCH ---
  const mockFetchOrderDetails = async (order) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          items: [
            { name: 'चिंतामुक्ती (Hardcopy)', qty: order.amount > 400 ? 2 : 1, price: 400 }
          ],
          priceBreakup: {
            subtotal: order.amount + 50,
            shipping: 50,
            discountCode: 'WELCOME50',
            discountAmount: -50,
            // Simulated Logic: Every alternate order or specific orders show referral data
            referralApplied: order.status === 'Success' ? 'AMIT100' : null, 
            referrerName: order.status === 'Success' ? 'Amit Kulkarni' : null,
            total: order.amount
          },
          payment: {
            txnId: `TXN-98${Math.floor(Math.random() * 1000)}`,
            method: 'UPI (PhonePe)',
            initiatedAt: new Date(new Date(order.date).getTime() - 5 * 60000).toISOString(),
            updatedAt: order.date,
            status: order.status === 'Pending Payment' ? 'Pending' : order.status
          },
          shipping: {
            address: 'Flat 402, Shiv Shakti Apts, MG Road, Pune, Maharashtra - 411001',
            partner: order.status === 'Pending Payment' ? 'Pending Assign' : 'Delhivery',
            trackingId: order.status === 'Success' || order.status === 'In Progress' ? 'AWB123456789' : '-'
          },
          transit: [
            { stage: 'Order Placed', time: '23 Feb 2026, 10:30 AM', completed: true },
            { stage: 'Packed', time: '23 Feb 2026, 02:00 PM', completed: order.status !== 'Pending Payment' },
            { stage: 'Shipped', time: '24 Feb 2026, 09:00 AM', completed: order.status === 'Success' || order.status === 'In Progress' },
            { stage: 'Out for Delivery', time: '25 Feb 2026, 08:30 AM', completed: order.status === 'Success' },
            { stage: 'Delivered', time: order.status === 'Success' ? '25 Feb 2026, 11:45 AM' : '', completed: order.status === 'Success' }
          ]
        });
      }, 800);
    });
  };

  // --- ACTION HANDLERS ---
  const handleOpenModal = async (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsTransitExpanded(false);
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    
    const details = await mockFetchOrderDetails(order);
    setOrderDetails(details);
    setIsLoadingDetails(false);
  };

  const handleSaveStatus = () => {
    if (newStatus !== selectedOrder.status) {
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      showToast(`Order #${selectedOrder.id} status updated to ${newStatus}`);
    }
    setIsModalOpen(false);
  };

  const handleNotifyUser = (email, type) => {
    showToast(`Payment ${type} reminder sent securely to ${email}`);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const formatDateTime = (isoString) => {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Success': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle size={12}/> Success</span>;
      case 'Failed': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100"><AlertCircle size={12}/> Failed</span>;
      case 'Pending Payment': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100"><Clock size={12}/> Pending</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"><Truck size={12}/> {status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track customer purchases.</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {['All Orders', 'Success', 'Pending Payment', 'Failed', 'In Progress'].map(tab => (
              <button key={tab} onClick={() => {setActiveTab(tab); setCurrentPage(1);}} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? 'bg-emerald-800 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-col xl:flex-row gap-4 pt-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search by Order ID, Name, Email..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Calendar size={16} className="text-slate-400 mr-2" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm text-slate-600 outline-none w-28" />
                <span className="text-slate-400 mx-2">-</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm text-slate-600 outline-none w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
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
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 text-sm">#{order.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">{order.user.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{order.user}</p>
                        <p className="text-xs text-slate-500">{order.mobile}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{formatDateTime(order.date).split(',')[0]}</td>
                  <td className="p-4 text-sm font-bold text-slate-800">₹{order.amount}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenModal(order)} className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 hover:border-emerald-200 transition-all active:scale-95">
                      View Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
          <span>Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries</span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-medium">Prev</button>
            <button className="px-3 py-1.5 rounded-lg font-bold bg-emerald-800 text-white shadow-sm">{currentPage}</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-medium">Next</button>
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
                    <h2 className="text-xl font-bold text-slate-800">Order #{selectedOrder.id}</h2>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Placed on {formatDateTime(selectedOrder.date)}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
              {isLoadingDetails || !orderDetails ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
                  <p className="text-sm font-medium">Fetching secure order details...</p>
                </div>
              ) : (
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
                        {/* Item List */}
                        {orderDetails.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="w-12 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-500 mt-1">Qty: {item.qty} × ₹{item.price}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-slate-800">₹{item.qty * item.price}</p>
                          </div>
                        ))}
                        
                        {/* Breakup & Referral Info */}
                        <div className="border-t border-slate-100 pt-4 space-y-2">
                          <div className="flex justify-between text-sm text-slate-600">
                            <p>Subtotal</p>
                            <p>₹{orderDetails.priceBreakup.subtotal}</p>
                          </div>
                          <div className="flex justify-between text-sm text-slate-600">
                            <p>Shipping</p>
                            <p>₹{orderDetails.priceBreakup.shipping}</p>
                          </div>
                          {orderDetails.priceBreakup.discountAmount < 0 && (
                            <div className="flex justify-between text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                              <p className="flex items-center gap-1"><Tag size={12}/> Discount ({orderDetails.priceBreakup.discountCode})</p>
                              <p>₹{orderDetails.priceBreakup.discountAmount}</p>
                            </div>
                          )}
                          
                          {/* NEW: Referral Applied Row */}
                          {orderDetails.priceBreakup.referralApplied && (
                            <div className="flex justify-between items-center text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                              <div className="flex flex-col">
                                <p className="flex items-center gap-1 font-bold"><Gift size={12}/> Referral Applied</p>
                                <p className="text-xs text-amber-600">By {orderDetails.priceBreakup.referrerName}</p>
                              </div>
                              <p className="font-mono bg-amber-100 px-2 py-0.5 rounded text-xs">{orderDetails.priceBreakup.referralApplied}</p>
                            </div>
                          )}

                          <div className="flex justify-between text-base font-black text-slate-800 pt-2 border-t border-slate-200">
                            <p>Final Total</p>
                            <p>₹{orderDetails.priceBreakup.total}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Transaction Info & NOTIFY BUTTON */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-slate-500"/>
                          <h3 className="text-sm font-bold text-slate-800">Payment Details</h3>
                        </div>
                        {selectedOrder.status === 'Pending Payment' && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full animate-pulse">
                            <Clock size={10} /> Awaiting Auth
                          </span>
                        )}
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Transaction ID</p>
                          <p className="text-sm font-mono font-medium text-slate-700">{orderDetails.payment.txnId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Payment Method</p>
                          <p className="text-sm font-bold text-slate-700">{orderDetails.payment.method}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Initiated</p>
                          <p className="text-xs text-slate-600">{formatDateTime(orderDetails.payment.initiatedAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Updated</p>
                          <p className="text-xs text-slate-600">{formatDateTime(orderDetails.payment.updatedAt)}</p>
                        </div>
                      </div>
                      
                      {/* NEW: Actionable Notify Button for Pending/Failed Payments */}
                      {(selectedOrder.status === 'Pending Payment' || selectedOrder.status === 'Failed') && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                          <button 
                            onClick={() => handleNotifyUser(selectedOrder.email, selectedOrder.status === 'Failed' ? 'Failure' : 'Pending')}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                          >
                            <BellRing size={16} /> Send Payment Link Reminder
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-6">
                    
                    {/* Customer & Shipping Details */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <User size={16} className="text-slate-500"/>
                        <h3 className="text-sm font-bold text-slate-800">Customer & Shipping</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{selectedOrder.user.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{selectedOrder.user}</p>
                            <p className="text-xs text-slate-500">{selectedOrder.email} • +91 {selectedOrder.mobile}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3 items-start">
                          <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-600 leading-relaxed">{orderDetails.shipping.address}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                           <div className="flex items-center gap-2"><Truck size={14} className="text-blue-600"/> <span className="font-bold text-slate-700">{orderDetails.shipping.partner}</span></div>
                           <span className="font-mono text-xs font-bold text-blue-700">{orderDetails.shipping.trackingId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Transit Expandable */}
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
                            {orderDetails.transit.map((step, idx) => (
                              <div key={idx} className="relative">
                                <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white ${step.completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                <p className={`text-sm font-bold ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>{step.stage}</p>
                                {step.time && <p className="text-xs text-slate-500 mt-0.5">{step.time}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Status Update */}
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
                    <option value="Success">Success (Delivered)</option>
                    <option value="Failed">Failed / Cancelled</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <button 
                onClick={handleSaveStatus}
                disabled={newStatus === selectedOrder.status}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};