import React, { useState, useEffect } from 'react';
import { 
  Receipt, X, Package, Tag, Gift, CreditCard, BellRing, User, 
  MapPin, Truck, CheckCircle, ChevronUp, ChevronDown, Save, Loader2 
} from 'lucide-react';

export const OrderDetailsModal = ({ 
  isOpen, 
  onClose, 
  order, 
  isAdmin = false, 
  onUpdateStatus, 
  onNotifyUser 
}) => {
  const [isTransitExpanded, setIsTransitExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Sync internal status state when a new order is passed
  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setIsTransitExpanded(false);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSaveStatus = async () => {
    if (!onUpdateStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(order.orderId, newStatus);
      onClose();
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase tracking-wider">Delivered</span>;
      case 'In Progress': return <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase tracking-wider">In Progress</span>;
      case 'Cancelled': return <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 uppercase tracking-wider">Cancelled</span>;
      default: return <span className="text-[10px] font-bold px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100 uppercase tracking-wider">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-700">
              <Receipt size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">Order #{order.orderId}</h2>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              
              {/* Items */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Package size={16} className="text-slate-500"/>
                  <h3 className="text-sm font-bold text-slate-800">Order Items</h3>
                </div>
                <div className="p-4 space-y-4">
                  {order.items?.map((item, idx) => (
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
                  
                  {/* Price Breakup */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <p>Subtotal</p><p>₹{order.priceBreakup?.subtotal || 0}</p>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <p>Shipping</p><p>₹{order.priceBreakup?.shipping || 0}</p>
                    </div>
                    {order.priceBreakup?.taxAmount > 0 && (
                      <div className="flex justify-between text-sm text-slate-600">
                        <p>Tax</p><p>₹{order.priceBreakup.taxAmount}</p>
                      </div>
                    )}
                    {order.priceBreakup?.discountAmount > 0 && (
                      <div className="flex justify-between text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                        <p className="flex items-center gap-1"><Tag size={12}/> Discount ({order.priceBreakup.discountCode})</p>
                        <p>-₹{order.priceBreakup.discountAmount}</p>
                      </div>
                    )}
                    {order.priceBreakup?.referralApplied && (
                      <div className="flex justify-between items-center text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <p className="flex items-center gap-1 font-bold"><Gift size={12}/> Referral Applied</p>
                        <p className="font-mono bg-amber-100 px-2 py-0.5 rounded text-xs">{order.priceBreakup.referralApplied}</p>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-slate-800 pt-2 border-t border-slate-200">
                      <p>Final Total</p><p>₹{order.priceBreakup?.total || 0}</p>
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
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${order.payment?.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.payment?.status || 'Pending'}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Transaction ID</p>
                    <p className="text-sm font-mono font-medium text-slate-700 break-all">{order.payment?.txnId || order.payment?.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Gateway</p>
                    <p className="text-sm font-bold text-slate-700">{order.payment?.method || 'PhonePe'}</p>
                  </div>
                </div>
                
                {/* Admin Only: Send Reminder */}
                {isAdmin && order.status === 'Pending Payment' && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button 
                      onClick={() => onNotifyUser && onNotifyUser(order.user?.email, 'Pending')}
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
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{(order.user?.name || 'G').charAt(0)}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{order.user?.name || 'Guest User'}</p>
                      <p className="text-xs text-slate-500">{order.user?.email} • {order.user?.mobile}</p>
                    </div>
                  </div>
                  
                  {order.shipping?.address && order.shipping.address !== 'Digital Delivery' ? (
                    <>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3 items-start">
                        <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600 leading-relaxed">{order.shipping.address}</p>
                      </div>
                      {order.shipping?.trackingId && (
                        <div className="flex items-center justify-between text-sm bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                           <div className="flex items-center gap-2"><Truck size={14} className="text-blue-600"/> <span className="font-bold text-slate-700">{order.shipping.partner}</span></div>
                           <span className="font-mono text-xs font-bold text-blue-700">{order.shipping.trackingId}</span>
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
              {order.transitHistory && order.transitHistory.length > 0 && (
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
                        {order.transitHistory.map((step, idx) => {
                          const isLast = idx === order.transitHistory.length - 1;
                          const isDelivered = step.stage === 'Delivered';
                          return (
                            <div key={step._id || idx} className="relative">
                              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white ${isLast ? (isDelivered ? 'bg-emerald-500' : 'bg-orange-500') : 'bg-slate-300'}`} />
                              <p className={`text-sm font-bold ${isLast ? (isDelivered ? 'text-emerald-700' : 'text-orange-600') : 'text-slate-600'}`}>{step.stage}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{new Date(step.time || step.timestamp).toLocaleString()}</p>
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

        {/* Footer: Admin Only Controls */}
        {isAdmin && (
          <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="w-full sm:w-auto flex items-center gap-3">
              <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Update Status:</label>
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
              disabled={newStatus === order.status || isUpdatingStatus}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isUpdatingStatus ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};