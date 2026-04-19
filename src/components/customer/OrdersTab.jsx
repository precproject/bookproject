import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { downloadInvoice } from '../../utils/generateInvoice';
import { Button } from '../ui/Button';
import { 
  PackageOpen, CreditCard, Download, Truck, Clock, 
  AlertCircle, X, MapPin, CheckCircle, FileText, ChevronRight, Loader2, ShieldCheck,
  Gift, Map, Banknote
} from 'lucide-react';

const OrdersTab = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [retryingOrderId, setRetryingOrderId] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Live Tracking States
  const [liveTracking, setLiveTracking] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch Live Tracking when a shipped order is selected
  useEffect(() => {
    if (selectedOrder?.shipping?.trackingId && selectedOrder.shipping.trackingId !== 'Digital' && selectedOrder.shipping.trackingId !== 'N/A') {
      fetchLiveTracking(selectedOrder.orderId);
    } else {
      setLiveTracking(null);
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get(ENDPOINTS.MY_ORDERS);
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveTracking = async (orderId) => {
    setIsTrackingLoading(true);
    try {
      const { data } = await apiClient.get(`/delivery/track/${orderId}`);
      setLiveTracking(data.tracking);
    } catch (error) {
      console.error('Failed to fetch live tracking', error);
      setLiveTracking(null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleRetryPayment = async (orderId) => {
    setRetryingOrderId(orderId);
    try {
      const { data } = await apiClient.get(ENDPOINTS.RETRY_PAYMENT(orderId));
      if (data.paymentPayload && data.paymentPayload.redirectUrl) {
        window.location.href = data.paymentPayload.redirectUrl;
      } else {
        alert(t('dashboard.orders.paymentError', "Could not connect to payment gateway. Please try again."));
        setRetryingOrderId(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || t('dashboard.orders.paymentFailed', 'Failed to initiate payment retry.'));
      setRetryingOrderId(null);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setLiveTracking(null);
  };

  const getShortAddress = (shipping) => {
    if (!shipping || shipping.street === 'Digital Delivery' || shipping.street === 'Digital') return t('dashboard.orders.digital', 'Digital Delivery');
    if (shipping.city) return `${shipping.city}, ${shipping.state}`;
    return t('dashboard.orders.digital', 'Digital Delivery');
  };

  // --- REUSABLE TRACKING BLOCK ---
  const renderTrackingTimeline = () => {
    // Hide if still awaiting initial online payment or cancelled
    if (selectedOrder.status === 'Pending Payment' || selectedOrder.status === 'Cancelled') return null;
    if (selectedOrder.shipping?.trackingId === 'Digital') return null;

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Truck size={18}/> {t('dashboard.orders.trackingHistory', 'Tracking History')}
          </h3>
        </div>

        {selectedOrder.shipping?.trackingId && selectedOrder.shipping.trackingId !== 'N/A' && (
          <div className="mb-6 bg-orange-50 border border-orange-100 p-3 rounded-xl flex justify-between items-center">
            <span className="text-sm font-bold text-orange-800">{selectedOrder.shipping.partner || 'Courier'}</span>
            <span className="text-xs font-mono bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded-full shadow-sm">
              {selectedOrder.shipping.trackingId}
            </span>
          </div>
        )}
        
        {isTrackingLoading ? (
           <div className="flex justify-center py-6"><Loader2 className="animate-spin text-orange-500" size={24} /></div>
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
                      isLast ? (isDelivered ? 'bg-green-500' : 'bg-blue-500') : 'bg-slate-300'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <div>
                      <p className={`font-bold text-base ${isLast ? (isDelivered ? 'text-green-700' : 'text-blue-700') : 'text-slate-700'}`}>
                        {scan.ScanDetail.Instructions}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <Map size={12}/> {scan.ScanDetail.ScannedLocation}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {new Date(scan.ScanDetail.ScanDateTime).toLocaleString(dateLocale, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative pl-4">
            <div className="absolute left-[23px] top-2 bottom-6 w-0.5 bg-slate-200"></div>
            <div className="space-y-6 relative">
              
              {/* --- GHOST STEP FOR PRE-DISPATCH --- */}
              {(!selectedOrder.shipping?.trackingId || selectedOrder.shipping.trackingId === 'N/A') && selectedOrder.status === 'In Progress' && (
                 <div className="flex gap-5 items-start opacity-70 animate-pulse">
                    <div className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 border-dashed border-blue-400 bg-white"></div>
                    <div>
                      <p className="font-bold text-base text-blue-600">Waiting for Courier Assignment</p>
                      <p className="text-sm text-slate-500 mt-0.5">Your package is being prepared for dispatch</p>
                    </div>
                 </div>
              )}

              {selectedOrder.transitHistory?.slice().reverse().map((history, idx) => {
                const isLast = idx === 0 && (selectedOrder.shipping?.trackingId && selectedOrder.shipping.trackingId !== 'N/A');
                const isDelivered = history.stage.includes('Delivered');
                
                return (
                  <div key={history._id || idx} className="flex gap-5 items-start">
                    <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isLast ? (isDelivered ? 'bg-green-500' : 'bg-orange-500') : 'bg-slate-300'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <div>
                      <p className={`font-bold text-base ${isLast ? (isDelivered ? 'text-green-700' : 'text-orange-600') : 'text-slate-700'}`}>
                        {history.stage}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {new Date(history.time || history.timestamp).toLocaleString(dateLocale, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Clock className="animate-spin text-orange-500" size={40} /></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
        <PackageOpen size={70} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-700 mb-2">{t('dashboard.orders.noOrdersTitle', 'No orders yet')}</h3>
        <p className="text-slate-500">{t('dashboard.orders.noOrdersDesc', 'When you purchase books, they will appear here.')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ORDER LIST VIEW */}
      {orders.map((order) => {
        const isPendingOnline = order.status === 'Pending Payment';
        const isConfirmed = ['In Progress', 'Delivered'].includes(order.status);
        const isCOD = order.payment?.method === 'COD';
        
        return (
          <div key={order._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 text-sm">
              <div className="flex gap-6 sm:gap-12">
                <div>
                  <p className="text-slate-500 uppercase font-semibold text-xs mb-1">{t('dashboard.orders.placedLabel', 'Order Placed')}</p>
                  <p className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase font-semibold text-xs mb-1">{t('dashboard.orders.totalLabel', 'Total')}</p>
                  <p className="font-bold text-slate-800">₹{order.priceBreakup?.total || 0}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-slate-500 uppercase font-semibold text-xs mb-1">{t('dashboard.orders.shipToLabel', 'Ship To')}</p>
                  <p className="font-bold text-orange-600 dark:text-amber-500 truncate max-w-[150px]">
                    {getShortAddress(order.shipping)}
                  </p>
                </div>
              </div>
              <div className="text-right flex-1 sm:flex-none">
                <p className="text-slate-500 uppercase font-semibold text-xs mb-1">{t('dashboard.orders.orderIdLabel', 'Order ID')}</p>
                <p className="font-mono font-bold text-slate-800">#{order.orderId}</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <h3 className={`text-lg font-bold flex items-center gap-2 mb-3 ${
                  order.status === 'Delivered' ? 'text-green-700' : isPendingOnline ? 'text-orange-600' : order.status === 'Cancelled' ? 'text-red-600' : 'text-blue-700'
                }`}>
                  {isPendingOnline && <AlertCircle size={20} />}
                  {order.status === 'Delivered' && <CheckCircle size={20} />}
                  {order.status === 'In Progress' && <Truck size={20} />}
                  {t(`dashboard.orders.status.${order.status.replace(/\s+/g, '')}`, order.status)}
                </h3>

                <div className="space-y-1 mb-4">
                  {order.items.map(item => (
                    <p key={item._id} className="text-slate-700 font-medium">
                      {item.name} <span className="text-slate-400 font-normal">x {item.qty}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-56 shrink-0">
                <Button 
                  onClick={() => setSelectedOrder(order)} 
                  variant="secondary" 
                  className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 py-2.5 shadow-sm flex justify-center items-center gap-2"
                >
                  {isConfirmed && order.shipping?.trackingId !== 'Digital' ? t('dashboard.orders.trackBtn', 'Track Order') : t('dashboard.orders.viewDetailsBtn', 'View Details')} <ChevronRight size={16} />
                </Button>

                {isPendingOnline ? (
                  <Button 
                    onClick={() => handleRetryPayment(order.orderId)} 
                    variant="primary" 
                    className="w-full py-2.5 shadow-md flex justify-center items-center gap-2"
                    disabled={retryingOrderId === order.orderId}
                  >
                    {retryingOrderId === order.orderId ? (
                      <><Loader2 size={18} className="animate-spin" /> {t('dashboard.orders.processing', 'Processing...')}</>
                    ) : (
                      <><CreditCard size={18} /> {t('dashboard.orders.payNowBtn', 'Complete Payment')}</>
                    )}
                  </Button>
                ) : isConfirmed ? (
                    <Button 
                        onClick={async () => {
                          setIsDownloading(true);
                          await downloadInvoice(order); // <--- MUST BE 'order' HERE
                          setIsDownloading(false);
                        }} 
                        variant="secondary" 
                        disabled={isDownloading}
                        className="w-full bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 py-2.5 flex justify-center items-center gap-2"
                      >
                        {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                        {isDownloading ? 'Generating...' : t('dashboard.orders.invoiceBtn', 'Invoice')}
                      </Button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {/* =========================================
          ORDER DETAILS MODAL (Pop-up)
      ========================================= */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 sm:px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                      {t('dashboard.orders.modalTitle', 'Order Summary')}
                    </h2>
                    {selectedOrder.payment?.method === 'COD' && selectedOrder.status !== 'Delivered' && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md uppercase tracking-wider border border-amber-200">
                        COD
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-mono mt-1">{t('dashboard.orders.modalId', 'ID')}: #{selectedOrder.orderId}</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full text-slate-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
                  
                  {/* LEFT COLUMN */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={18}/> {t('dashboard.orders.itemsOrdered', 'Items Ordered')}
                      </h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map(item => (
                          <div key={item._id} className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-slate-800 text-lg">{item.name}</p>
                              <p className="text-sm text-slate-500 mt-1">{t('dashboard.orders.qty', 'Quantity')}: {item.qty}</p>
                            </div>
                            <p className="font-black text-slate-800 text-lg">₹{item.price * item.qty}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedOrder.shipping && typeof selectedOrder.shipping === 'object' && selectedOrder.shipping.street !== 'Digital Delivery' && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <MapPin size={18}/> {t('dashboard.orders.deliveryAddress', 'Delivery Address')}
                        </h3>
                        <div className="text-slate-700 leading-relaxed">
                          <p className="font-bold text-lg mb-1">{selectedOrder.shipping.fullName}</p>
                          <p className="text-slate-600 font-medium mb-2">📞 {selectedOrder.shipping.phone}</p>
                          <p className="text-slate-500">
                            {selectedOrder.shipping.street}<br/>
                            {selectedOrder.shipping.city}, {selectedOrder.shipping.state} - {selectedOrder.shipping.pincode}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.priceBreakup?.referralApplied && !selectedOrder.priceBreakup?.discountCode && (
                      <div className="flex justify-between items-center text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        <div className="flex flex-col">
                          <p className="flex items-center gap-1 font-bold"><Gift size={16}/> {t('dashboard.orders.referralApplied', 'Referral Applied')}</p>
                        </div>
                        <p className="font-mono bg-amber-100 px-3 py-1 rounded text-xs font-bold">{selectedOrder.priceBreakup.referralApplied}</p>
                      </div>
                    )}

                    {/* TRACKING: Shown on Mobile right after Address */}
                    <div className="block lg:hidden">
                      {renderTrackingTimeline()}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ShieldCheck size={18}/> {t('dashboard.orders.paymentInfo', 'Payment Information')}
                      </h3>
                      
                      <div className="space-y-3 text-[15px] text-slate-600 mb-4 pb-4 border-b border-slate-100">
                        <div className="flex justify-between"><span>{t('dashboard.orders.subtotal', 'Subtotal')}</span> <span className="font-bold">₹{selectedOrder.priceBreakup?.subtotal || 0}</span></div>
                        
                        <div className="flex justify-between"><span>{t('dashboard.orders.shippingFee', 'Shipping')}</span> <span className="font-bold">{selectedOrder.priceBreakup?.shipping === 0 ? t('dashboard.orders.free', 'Free') : `₹${selectedOrder.priceBreakup?.shipping}`}</span></div>
                        
                        {/* --- COD FEE --- */}
                        {selectedOrder.priceBreakup?.codFee > 0 && (
                          <div className="flex justify-between text-amber-700 bg-amber-50 rounded px-2 -mx-2">
                            <span>COD Fee</span> <span className="font-bold">+₹{selectedOrder.priceBreakup.codFee}</span>
                          </div>
                        )}

                        <div className="flex justify-between"><span>{t('dashboard.orders.tax', 'Tax')}</span> <span className="font-bold">₹{selectedOrder.priceBreakup?.taxAmount || 0}</span></div>
                        
                        {/* --- PROMO / PREBOOK DISCOUNT --- */}
                        {selectedOrder.priceBreakup?.discountAmount > 0 && (
                          <div className="flex justify-between text-green-600 bg-green-50 rounded px-2 -mx-2">
                            <span>{t('dashboard.orders.discount', 'Discount')} {selectedOrder.priceBreakup?.discountCode && `(${selectedOrder.priceBreakup.discountCode})`}</span> 
                            <span className="font-bold">-₹{selectedOrder.priceBreakup.discountAmount}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-slate-800 text-lg">{t('dashboard.orders.grandTotal', 'Grand Total')}</span>
                        <span className="font-black text-orange-600 text-2xl">₹{selectedOrder.priceBreakup?.total || 0}</span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                        <div className="grid grid-cols-2 gap-y-3">
                          <div className="text-slate-500">{t('dashboard.orders.paymentStatus', 'Status')}</div>
                          <div className={`font-bold text-right ${selectedOrder.payment?.status === 'Success' ? 'text-green-600' : selectedOrder.payment?.status === 'Failed' ? 'text-red-600' : 'text-orange-600'}`}>
                            {selectedOrder.payment?.method === 'COD' && selectedOrder.status !== 'Delivered' ? 'To be paid on delivery' : t(`dashboard.orders.status.${selectedOrder.payment?.status}`, selectedOrder.payment?.status)}
                          </div>
                          
                          <div className="text-slate-500">{t('dashboard.orders.gateway', 'Method')}</div>
                          <div className="font-bold text-slate-800 text-right flex items-center justify-end gap-1">
                            {selectedOrder.payment?.method === 'COD' ? <Banknote size={14} className="text-orange-500"/> : <CreditCard size={14} className="text-blue-500"/>}
                            {selectedOrder.payment?.method || 'Online'}
                          </div>

                          {selectedOrder.payment?.txnId && selectedOrder.payment?.method !== 'COD' && (
                            <>
                              <div className="text-slate-500">{t('dashboard.orders.txnId', 'Transaction ID')}</div>
                              <div className="font-mono text-xs font-bold text-slate-800 text-right break-all">
                                {selectedOrder.payment.txnId}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* TRACKING: Shown on Desktop below Payment */}
                    <div className="hidden lg:block">
                      {renderTrackingTimeline()}
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersTab;