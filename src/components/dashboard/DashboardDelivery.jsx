import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Search, MapPin, Truck, ExternalLink, PackageCheck, PackageSearch, 
  Calendar, ChevronDown, X, Save, CheckCircle, Loader2, Eye, Map 
} from 'lucide-react';
import { AdminContext } from '../../context/AdminContext'; 
import { adminService } from '../../api/service/adminService';
import apiClient from '../../api/client';

export const DashboardDelivery = () => {
  // --- CONSUME GLOBAL CACHE ---
  const { orderCache, fetchAdminOrders, updateLocalOrder } = useContext(AdminContext);

  // --- SERVER-SIDE PAGINATION STATE ---
  const [currentDeliveryIds, setCurrentDeliveryIds] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  // --- FILTER & SORT STATE ---
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // Performance Fix
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // --- MODAL & ACTION STATE ---
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ partner: '', trackingId: '', status: '' });

  // --- VIEW DETAILS MODAL STATE ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [liveTracking, setLiveTracking] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const { showToast } = useToast(); // 2. Destructure showToast

  // --- TRIGGER API ON FILTER/PAGE CHANGE ---
  
  // 1. Debounce only the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Fetch data instantly on tab, page, or debounced search change
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingList(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          sort: sortOrder,
          startDate: startDate || '',
          endDate: endDate || '',
          isDeliveryView: true, 
          deliveryStatus: activeStatus !== 'All' ? activeStatus : ''
        };

        const response = await fetchAdminOrders(params);

        if (response && response.orders) {
          setCurrentDeliveryIds(response.orders.map(o => o._id));
          setTotalItems(response.totalItems);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Error loading paginated deliveries:", error);
        showToast("Failed to load delivery data from server.");
      } finally {
        setIsLoadingList(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, debouncedSearch, sortOrder, startDate, endDate, currentPage]);

  // --- MAP IDs TO ACTUAL DATA FROM CACHE ---
  const visibleDeliveries = useMemo(() => {
    return currentDeliveryIds.map(id => {
      const order = orderCache[id];
      if (!order) return null;

      const addressParts = order.shippingAddress && order.shippingAddress !== 'Digital Delivery' 
        ? order.shippingAddress.split(',') 
        : ['Digital'];
      const shortLocation = addressParts.length > 2 
        ? addressParts.slice(-3, -1).join(', ').trim() 
        : addressParts[0];

      let delStatus = 'Initiated';
      if (order.status === 'Delivered') {
        delStatus = 'Delivered';
      } else if (order.shipping?.trackingId && order.shipping.trackingId !== '-' && order.shipping.trackingId !== 'N/A') {
        delStatus = 'In Transit';
      }

      return {
        id: order._id,           
        orderId: order.orderId,  
        customer: order.user?.name || 'Guest User',
        location: shortLocation,
        partner: order.shipping?.partner || 'Pending Assign',
        trackingId: order.shipping?.trackingId || '-',
        status: delStatus,
        date: order.createdAt
      };
    }).filter(Boolean); 
  }, [currentDeliveryIds, orderCache]);

  // --- ACTION HANDLERS ---
  const handleTabChange = (tab) => {
    setActiveStatus(tab);
    setCurrentPage(1);
  };

  const handleOpenModal = (delivery) => {
    setSelectedDelivery(delivery);
    setEditForm({
      partner: delivery.partner === 'Pending Assign' ? '' : delivery.partner,
      trackingId: delivery.trackingId === '-' ? '' : delivery.trackingId,
      status: delivery.status
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = async (delivery) => {
    setSelectedDelivery(delivery);
    setIsViewModalOpen(true);
    setIsTrackingLoading(true);
    setLiveTracking(null);
  
    const fullOrder = orderCache[delivery.id];
  
    try {
      if (fullOrder?.shipping?.trackingId && fullOrder.shipping.trackingId !== '-' && fullOrder.shipping.trackingId !== 'N/A') {
        const { data } = await apiClient.get(`/delivery/track/${fullOrder.orderId}`);
        setLiveTracking(data.tracking);
      }
    } catch (error) {
      console.error('Failed to fetch live tracking', error);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleSaveDelivery = async () => {
    setIsSaving(true);
    try {
      const trackingPayload = {
        partner: editForm.partner || 'Self-Shipped',
        trackingId: editForm.trackingId || 'N/A',
        stage: editForm.status === 'Initiated' ? 'Packed & Ready' : editForm.status
      };
      
      await adminService.addTransitUpdate(selectedDelivery.id, trackingPayload);

      let newOrderStatus = 'In Progress';
      if (editForm.status === 'Delivered') {
        await adminService.updateOrderStatus(selectedDelivery.id, 'Delivered');
        newOrderStatus = 'Delivered';
      }

      const existingOrder = orderCache[selectedDelivery.id] || {};
      updateLocalOrder(selectedDelivery.id, {
        status: newOrderStatus,
        shipping: {
          ...existingOrder.shipping,
          partner: trackingPayload.partner,
          trackingId: trackingPayload.trackingId
        }
      });
      
      showToast(`Tracking updated for Order #${selectedDelivery.orderId}`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update delivery:", error);
      showToast("Error updating delivery details.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- UI HELPERS ---
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(isoString));
  };

  const getDeliveryBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700"><PackageCheck size={14}/> Delivered</span>;
      case 'In Transit': return <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700"><Truck size={14}/> In Transit</span>;
      case 'Initiated': return <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600"><PackageSearch size={14}/> Processing</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Delivery & Logistics</h1>
        <p className="text-sm text-slate-500 mt-1">Track dispatch, assign tracking IDs, and manage shipping status.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          
          <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-fit">
            {['All', 'Initiated', 'In Transit', 'Delivered'].map(status => (
              <button 
                key={status}
                onClick={() => handleTabChange(status)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeStatus === status ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col xl:flex-row gap-4 pt-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search tracking ID, order ID, or customer..." 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
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

              {(startDate || endDate || searchQuery) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); setDebouncedSearch(''); setCurrentPage(1); }} className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-all">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
              Fetching logistics data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-100">Order Ref</th>
                  <th className="p-4 font-bold border-b border-slate-100">Order Date</th>
                  <th className="p-4 font-bold border-b border-slate-100">Destination</th>
                  <th className="p-4 font-bold border-b border-slate-100">Partner & Tracking</th>
                  <th className="p-4 font-bold border-b border-slate-100">Status</th>
                  <th className="p-4 font-bold border-b border-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleDeliveries.length > 0 ? (
                  visibleDeliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-sm">#{del.orderId}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{formatDate(del.date)}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">{del.customer}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={12}/> {del.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{del.partner}</span>
                          {del.trackingId !== '-' && del.trackingId !== 'N/A' ? (
                            <a href={`https://google.com/search?q=${encodeURIComponent(del.trackingId)}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
                              {del.trackingId} <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 mt-0.5">Not generated</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{getDeliveryBadge(del.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleViewDetails(del)}
                            className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all"
                            title="View Live Tracking"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(del)}
                            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-700 transition-all active:scale-95"
                          >
                            Update Info
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500">
                      <PackageSearch size={40} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-bold text-slate-600">No Deliveries Found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <span>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1 || isLoadingList} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Prev
            </button>
            <button className="px-3 py-1.5 rounded-lg font-bold bg-emerald-800 text-white shadow-sm">
              {currentPage}
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || isLoadingList || totalPages === 0} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* --- UPDATE DELIVERY MODAL --- */}
      {isModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Assign Logistics</h2>
                <p className="text-xs text-slate-500 mt-1">Order Ref: #{selectedDelivery.orderId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Delivery Status</label>
                <div className="relative">
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  >
                    <option value="Initiated">Initiated (Ready to Pack)</option>
                    <option value="In Transit">In Transit (Shipped)</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Logistics Partner</label>
                <input 
                  type="text" 
                  value={editForm.partner}
                  onChange={(e) => setEditForm({...editForm, partner: e.target.value})}
                  placeholder="e.g. Delhivery, BlueDart, India Post" 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm placeholder:text-slate-400" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tracking ID / AWB</label>
                <input 
                  type="text" 
                  value={editForm.trackingId}
                  onChange={(e) => setEditForm({...editForm, trackingId: e.target.value})}
                  placeholder="Enter Tracking Number..." 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm placeholder:text-slate-400 uppercase font-mono" 
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                disabled={isSaving}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDelivery} 
                disabled={isSaving || (editForm.status === 'In Transit' && !editForm.trackingId)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                {isSaving ? 'Saving...' : 'Save & Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW LIVE TRACKING MODAL --- */}
      {isViewModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-[scaleIn_0.2s_ease-out]">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Order Details</h2>
                <p className="text-sm font-mono text-slate-500 mt-1">Ref: #{selectedDelivery.orderId}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Customer & Payment Summary */}
              {orderCache[selectedDelivery.id] && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Customer</p>
                      <p className="font-bold text-slate-800">{orderCache[selectedDelivery.id].user?.name}</p>
                      <p className="text-slate-600 mt-0.5">{orderCache[selectedDelivery.id].user?.mobile || orderCache[selectedDelivery.id].user?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Payment</p>
                      <p className={`font-bold ${orderCache[selectedDelivery.id].payment?.status === 'Success' ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {orderCache[selectedDelivery.id].payment?.status}
                      </p>
                      <p className="text-slate-800 font-black mt-0.5">₹{orderCache[selectedDelivery.id].priceBreakup?.total}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Full Shipping Address</p>
                    <p className="text-slate-700 font-medium">
                      {orderCache[selectedDelivery.id].shippingAddress === 'Digital Delivery' 
                        ? 'Digital Delivery Only' 
                        : orderCache[selectedDelivery.id].shippingAddress}
                    </p>
                  </div>
                </div>
              )}

              {/* Live Tracking Timeline */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-blue-500"/> Live Tracking History
                </h3>

                {isTrackingLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <Loader2 className="animate-spin text-blue-500 mb-3" size={28} />
                    <p className="text-sm font-medium">Connecting to logistics partner...</p>
                  </div>
                ) : liveTracking && liveTracking.scans?.length > 0 ? (
                  <div className="relative pl-4">
                    <div className="absolute left-[23px] top-2 bottom-6 w-0.5 bg-slate-200"></div>
                    <div className="space-y-6 relative">
                      {liveTracking.scans.map((scan, idx) => {
                        const isLast = idx === 0; 
                        const isDelivered = scan.ScanDetail.Instructions.includes('Delivered');
                        return (
                          <div key={idx} className="flex gap-5 items-start">
                            <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isLast ? (isDelivered ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-slate-300'
                            }`}>
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${isLast ? (isDelivered ? 'text-emerald-700' : 'text-blue-700') : 'text-slate-700'}`}>
                                {scan.ScanDetail.Instructions}
                              </p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                <Map size={12}/> {scan.ScanDetail.ScannedLocation}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 font-medium">
                                {new Date(scan.ScanDetail.ScanDateTime).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <PackageSearch size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-600">No active tracking data found.</p>
                    <p className="text-xs text-slate-500 mt-1">If recently shipped, check back in a few hours.</p>
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