import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { downloadInvoice } from '../../utils/generateInvoice';
import { Button } from '../ui/Button';
import { 
  PackageOpen, CreditCard, Download, Truck, Clock, 
  AlertCircle, X, MapPin, CheckCircle, FileText, ChevronRight, Loader2, ShieldCheck,
  Gift
} from 'lucide-react';

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [retryingOrderId, setRetryingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get(ENDPOINTS.MY_ORDERS);
      // Sort orders by newest first
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (orderId) => {
    setRetryingOrderId(orderId);
    try {
      const { data } = await apiClient.get(ENDPOINTS.RETRY_PAYMENT(orderId));
      if (data.paymentPayload && data.paymentPayload.redirectUrl) {
        window.location.href = data.paymentPayload.redirectUrl; // Redirects to PhonePe
      } else {
        alert("Could not connect to payment gateway. Please try again.");
        setRetryingOrderId(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to initiate payment retry.');
      setRetryingOrderId(null);
    }
  };

  const closeModal = () => setSelectedOrder(null);

  if (loading) return <div className="flex justify-center py-20"><Clock className="animate-spin text-orange-500" size={40} /></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
        <PackageOpen size={70} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-700 mb-2">No orders yet</h3>
        <p className="text-slate-500">When you purchase books, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* =========================================
          1. E-COMMERCE STYLE ORDER LIST VIEW
      ========================================= */}
      {orders.map((order) => {
        const isPaid = order.payment?.status === 'Success';
        const isPending = order.status === 'Pending Payment';
        const hasTracking = order.shipping?.trackingId && isPaid;

        return (
          <div key={order._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            {/* Gray Header (Amazon Style) */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 text-sm">
              <div className="flex gap-6 sm:gap-12">
                <div>
                  <p className="text-slate-500 uppercase font-semibold text-xs mb-1">Order Placed</p>
                  <p className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase font-semibold text-xs mb-1">Total</p>
                  <p className="font-bold text-slate-800">₹{order.priceBreakup.total}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-slate-500 uppercase font-semibold text-xs mb-1">Ship To</p>
                  <p className="font-bold text-blue-600 truncate max-w-[150px]">
                    {order.shippingAddress === 'Digital Delivery' ? 'Digital' : order?.shippingAddress?.split(',')[0]}
                  </p>
                </div>
              </div>
              <div className="text-right flex-1 sm:flex-none">
                <p className="text-slate-500 uppercase font-semibold text-xs mb-1">Order ID</p>
                <p className="font-mono font-bold text-slate-800">#{order.orderId}</p>
              </div>
            </div>

            {/* Order Body */}
            <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                {/* Status Headline */}
                <h3 className={`text-lg font-bold flex items-center gap-2 mb-3 ${
                  isPaid ? 'text-green-700' : isPending ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {isPending && <AlertCircle size={20} />}
                  {order.status === 'Delivered' && <CheckCircle size={20} />}
                  {order.status === 'In Progress' && <Truck size={20} />}
                  {order.status}
                </h3>

                {/* Items Summary */}
                <div className="space-y-1 mb-4">
                  {order.items.map(item => (
                    <p key={item._id} className="text-slate-700 font-medium">
                      {item.name} <span className="text-slate-400 font-normal">x {item.qty}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full md:w-56 shrink-0">
                <Button 
                  onClick={() => setSelectedOrder(order)} 
                  variant="secondary" 
                  className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 py-2.5 shadow-sm flex justify-center items-center gap-2"
                >
                  {hasTracking ? 'Track Order' : 'View Order Details'} <ChevronRight size={16} />
                </Button>

                {isPending ? (
                  <Button 
                    onClick={() => handleRetryPayment(order.orderId)} 
                    variant="primary" 
                    className="w-full py-2.5 shadow-md flex justify-center items-center gap-2"
                    disabled={retryingOrderId === order.orderId}
                  >
                    {retryingOrderId === order.orderId ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard size={18} /> Complete Payment</>
                    )}
                  </Button>
                ) : isPaid ? (
                  <Button 
                    onClick={() => downloadInvoice(order)} 
                    variant="secondary" 
                    className="w-full bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 py-2.5 flex justify-center items-center gap-2"
                  >
                    <Download size={18} /> Invoice
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {/* =========================================
          2. HIGH-FIDELITY ORDER DETAILS MODAL
      ========================================= */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                    Order Summary
                  </h2>
                  <p className="text-sm text-slate-500 font-mono mt-1">ID: #{selectedOrder.orderId}</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full text-slate-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* LEFT COLUMN */}
                  <div className="space-y-6">
                    
                    {/* Items Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={18}/> Items Ordered
                      </h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map(item => (
                          <div key={item._id} className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-slate-800 text-lg">{item.name}</p>
                              <p className="text-sm text-slate-500 mt-1">Quantity: {item.qty} • {item.type} Copy</p>
                            </div>
                            <p className="font-black text-slate-800 text-lg">₹{item.price * item.qty}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address (Only show if not digital) */}
                    {selectedOrder.shippingAddress && selectedOrder.shippingAddress !== 'Digital Delivery' && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <MapPin size={18}/> Delivery Address
                        </h3>
                        <div className="text-slate-700 leading-relaxed">
                          {/* Formatting the address nicely */}
                          <p className="font-bold text-lg mb-1">{selectedOrder.shippingAddress.split(',')[0]}</p>
                          <p className="text-slate-600 font-medium mb-2">📞 {selectedOrder.shippingAddress.split(',')[1]}</p>
                          <p className="text-slate-500">
                            {selectedOrder.shippingAddress.split(',').slice(2).join(', ').trim()}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.referralCode && (
                      <div className="flex justify-between items-center text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <div className="flex flex-col">
                          <p className="flex items-center gap-1 font-bold"><Gift size={12}/> Referral Applied</p>
                        </div>
                        <p className="font-mono bg-amber-100 px-2 py-0.5 rounded text-xs">{selectedOrder?.referralCode}</p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-6">
                    
                    {/* Payment & Gateway Information */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ShieldCheck size={18}/> Payment Information
                      </h3>
                      
                      {/* Subtotals */}
                      <div className="space-y-3 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                        <div className="flex justify-between"><span>Subtotal</span> <span className="font-medium">₹{selectedOrder.priceBreakup.subtotal}</span></div>
                        <div className="flex justify-between"><span>Tax</span> <span className="font-medium">₹{selectedOrder.priceBreakup.taxAmount}</span></div>
                        <div className="flex justify-between"><span>Shipping</span> <span className="font-medium">{selectedOrder.priceBreakup.shipping === 0 ? 'Free' : `₹${selectedOrder.priceBreakup.shipping}`}</span></div>
                        {selectedOrder.priceBreakup.discountAmount > 0 && (
                          <div className="flex justify-between text-green-600"><span>Discount ({selectedOrder.priceBreakup.discountCode})</span> <span className="font-bold">{selectedOrder.priceBreakup.discountAmount}</span></div>
                        )}
                      </div>
                      
                      {/* Grand Total */}
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-slate-800 text-lg">Grand Total</span>
                        <span className="font-black text-orange-600 text-2xl">₹{selectedOrder.priceBreakup.total}</span>
                      </div>

                      {/* Gateway Details */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                        <div className="grid grid-cols-2 gap-y-3">
                          <div className="text-slate-500">Status</div>
                          <div className={`font-bold text-right ${selectedOrder.payment.status === 'Success' ? 'text-green-600' : 'text-orange-600'}`}>
                            {selectedOrder.payment.status.toUpperCase()}
                          </div>
                          
                          <div className="text-slate-500">Payment Gateway</div>
                          <div className="font-bold text-slate-800 text-right">PhonePe</div>

                          {selectedOrder.payment.transactionId && (
                            <>
                              <div className="text-slate-500">Transaction ID</div>
                              <div className="font-mono text-xs font-bold text-slate-800 text-right break-all">
                                {selectedOrder.payment.transactionId}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Timeline (ONLY show if payment is success AND timeline exists) */}
                    {selectedOrder.payment.status === 'Success' && selectedOrder.transitHistory && selectedOrder.transitHistory.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Truck size={18}/> Tracking History
                          </h3>
                        </div>

                        {/* Delivery Partner Info */}
                        {selectedOrder.shipping?.trackingId && (
                          <div className="mb-6 bg-blue-50 border border-blue-100 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-sm font-bold text-blue-800">{selectedOrder.shipping.partner}</span>
                            <span className="text-xs font-mono bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full shadow-sm">
                              {selectedOrder.shipping.trackingId}
                            </span>
                          </div>
                        )}
                        
                        {/* Vertical Stepper Timeline */}
                        <div className="relative pl-4">
                          {/* The vertical line */}
                          <div className="absolute left-[23px] top-2 bottom-6 w-0.5 bg-slate-200"></div>
                          
                          <div className="space-y-6 relative">
                            {selectedOrder.transitHistory.map((history, idx) => {
                              const isLast = idx === selectedOrder.transitHistory.length - 1;
                              const isDelivered = history.stage === 'Delivered';
                              
                              return (
                                <div key={history._id} className="flex gap-5 items-start">
                                  {/* Dot */}
                                  <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                    isLast ? (isDelivered ? 'bg-green-500' : 'bg-orange-500') : 'bg-slate-300'
                                  }`}>
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                  </div>
                                  {/* Content */}
                                  <div>
                                    <p className={`font-bold text-base ${isLast ? (isDelivered ? 'text-green-700' : 'text-orange-600') : 'text-slate-700'}`}>
                                      {history.stage}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                      {new Date(history.timestamp).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 sm:px-8 border-t border-slate-200 bg-white flex flex-wrap gap-4 justify-end">
                {selectedOrder.status === 'Pending Payment' && (
                  <Button 
                    onClick={() => handleRetryPayment(selectedOrder.orderId)} 
                    variant="primary" 
                    className="px-8 shadow-md flex items-center gap-2"
                    disabled={retryingOrderId === selectedOrder.orderId}
                  >
                    {retryingOrderId === selectedOrder.orderId ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />} 
                    Pay Now
                  </Button>
                )}
                {selectedOrder.payment.status === 'Success' && (
                  <Button onClick={() => downloadInvoice(selectedOrder)} variant="secondary" className="bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 flex items-center gap-2">
                    <Download size={18} /> Download Invoice
                  </Button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersTab;