import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { getValidReferralCode } from '../utils/referralManager'; // Req 1: Hidden referral
import { MapPin, Tag, CreditCard, ShoppingBag, Trash2, User, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { orderService } from '../api/service/orderService';
import { Navbar } from '../components/sections/Navbar';

// Note: If your App passes theme/setTheme, include them in props
export const CheckoutPage = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useContext(AuthContext);
  const { cartItems, cartSubtotal, requiresShipping, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);

  // Req 3: Structured Address
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
  
  // Req 4: Promo Logic (No referral dropdown)
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);

  // Req 5: Payment Overlay State
  const [paymentOverlay, setPaymentOverlay] = useState({ active: false, status: 'waiting', orderId: null, paymentUrl: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = requiresShipping ? 50 : 0;
  const total = Math.max(0, cartSubtotal + shipping - appliedDiscount);

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  // Req 4: Live Promo Validation
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsVerifyingPromo(true);
    setPromoMessage({ text: '', type: '' });
    
    try {
      const { data } = await apiClient.post(ENDPOINTS.VALIDATE_PROMO, { code: promoCode, subtotal: cartSubtotal });
      setAppliedDiscount(data.discountAmount);
      setPromoMessage({ text: `Saved ₹${data.discountAmount}!`, type: 'success' });
    } catch (err) {
      setAppliedDiscount(0);
      setPromoMessage({ text: err.response?.data?.message || 'Invalid code', type: 'error' });
    } finally {
      setIsVerifyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (requiresShipping && (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode)) {
      setError('Please fill in all shipping details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedAddress = requiresShipping 
        ? `${address.fullName}, ${address.phone}, ${address.street}, ${address.city}, ${address.state} - ${address.pincode}`
        : 'Digital Delivery';

      // Req 1: Grab hidden referral code from local storage
      const hiddenReferral = getValidReferralCode();

      const payload = {
        orderItems: cartItems.map(item => ({ bookId: item.bookId, qty: item.qty })),
        shippingAddress: formattedAddress,
        ...(appliedDiscount > 0 ? { discountCode: promoCode } : {}),
        ...(hiddenReferral ? { referralCode: hiddenReferral } : {}) // Injected silently
      };

      const data = await orderService.checkout(payload);
      clearCart();

      // Req 5: Trigger Overlay and attempt New Tab
      setPaymentOverlay({ active: true, status: 'waiting', orderId: data.orderId, paymentUrl: data.paymentPayload.redirectUrl });
      
      const newWindow = window.open(data.paymentPayload.redirectUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log("Popup blocked by browser. User must click fallback link.");
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize checkout.');
      setLoading(false);
    }
  };

  // Req 5: Polling Logic
  useEffect(() => {
    if (!paymentOverlay.active || !paymentOverlay.orderId || paymentOverlay.status !== 'waiting') return;

    let attempts = 0;
    const maxAttempts = 6; // 6 attempts * 5s = 30 seconds
    let pollInterval;

    const checkStatus = async () => {
      attempts++;
      try {
        const data = await orderService.verifyPayment(paymentOverlay.orderId);
        if (data.paymentStatus === 'Success') {
          setPaymentOverlay(prev => ({ ...prev, status: 'success' }));
          clearInterval(pollInterval);
          setTimeout(() => navigate('/dashboard'), 3000);
        } else if (data.paymentStatus === 'Failed') {
          setPaymentOverlay(prev => ({ ...prev, status: 'failed' }));
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setPaymentOverlay(prev => ({ ...prev, status: 'timeout' }));
        setTimeout(() => navigate('/dashboard'), 5000);
      }
    };

    // Start polling when window regains focus
    const handleFocus = () => {
      if (!pollInterval) pollInterval = setInterval(checkStatus, 5000);
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [paymentOverlay, navigate]);


  // Req 6: Empty Cart
  if (cartItems.length === 0 && !paymentOverlay.active) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar theme={theme} setTheme={setTheme} />
        <div className="max-w-2xl mx-auto p-6 pt-40 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
            <ShoppingBag size={60} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Your cart is empty</h2>
            <p className="text-slate-500 mt-2 mb-8">Looks like you haven't added any books to your cart yet.</p>
            <Button variant="primary" onClick={() => navigate('/')} className="px-8 py-3">
              Explore the Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <Navbar theme={theme} setTheme={setTheme} />

      {/* Main Content (Blurred if payment overlay is active) */}
      <div className={`max-w-6xl mx-auto p-4 sm:p-6 pt-32 transition-all duration-300 ${paymentOverlay.active ? 'blur-md pointer-events-none opacity-50' : ''}`}>
        
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-8">
          <ShoppingBag className="text-orange-600" /> Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form & Cart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Cart Items */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4 text-slate-700">Review Items</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.bookId} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <h3 className="font-bold text-slate-800">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.type} Edition - ₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.bookId, item.qty - 1)} className="w-8 h-8 rounded bg-white shadow-sm text-slate-600 font-bold hover:text-orange-600 transition">-</button>
                        <span className="w-6 text-center font-semibold text-slate-800">{item.qty}</span>
                        <button onClick={() => updateQuantity(item.bookId, item.qty + 1)} className="w-8 h-8 rounded bg-white shadow-sm text-slate-600 font-bold hover:text-orange-600 transition">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.bookId)} className="text-red-400 hover:text-red-600 transition p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Section */}
            {requiresShipping && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><MapPin size={20} /> Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="fullName" placeholder="Full Name" onChange={handleAddressChange} className="p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500" />
                  <input type="tel" name="phone" placeholder="Phone Number" onChange={handleAddressChange} className="p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500" />
                  <input type="text" name="street" placeholder="Street Address / Flat No" onChange={handleAddressChange} className="p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 md:col-span-2" />
                  <input type="text" name="city" placeholder="City" onChange={handleAddressChange} className="p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500" />
                  <div className="flex gap-4">
                    <input type="text" name="state" placeholder="State" onChange={handleAddressChange} className="w-1/2 p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500" />
                    <input type="text" name="pincode" placeholder="PIN Code" onChange={handleAddressChange} className="w-1/2 p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Promo Code Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Tag size={20} /> Apply Promo Code</h2>
              <div className="flex gap-3">
                <input 
                  type="text" placeholder="Enter Discount Code" 
                  value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                />
                <Button variant="secondary" onClick={handleApplyPromo} disabled={isVerifyingPromo} className="px-6 border border-slate-300">
                  {isVerifyingPromo ? 'Checking...' : 'Apply'}
                </Button>
              </div>
              {promoMessage.text && (
                <p className={`mt-3 text-sm font-medium ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {promoMessage.text}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 h-fit lg:sticky top-28">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span> <span className="font-semibold">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span> <span className="font-semibold">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount applied</span> <span className="font-semibold">-₹{appliedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black text-slate-900 mt-4 pt-4 border-t border-slate-200">
                <span>Total to Pay</span> <span className="text-orange-600">₹{total}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4 font-medium p-3 bg-red-50 rounded-lg">{error}</p>}

            <Button 
              variant="primary" 
              onClick={handleCheckout} 
              disabled={loading}
              className="w-full py-4 text-lg font-bold flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30 rounded-xl"
            >
              {loading ? 'Processing...' : (
                <>{user ? <CreditCard size={20} /> : <User size={20} />} {user ? 'Proceed to Pay' : 'Login to Checkout'}</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Req 5: PAYMENT OVERLAY (Fixed Full Screen) */}
      {paymentOverlay.active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl relative">
            
            {paymentOverlay.status === 'waiting' && (
              <>
                <Loader2 size={60} className="text-orange-500 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800">Complete your payment</h2>
                <p className="text-slate-500 mt-3 mb-6">
                  Please complete the payment in the new tab. <br/>
                  <strong>Do not close this window.</strong> We are waiting for the bank's confirmation.
                </p>
                <a href={paymentOverlay.paymentUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-orange-600 underline hover:text-orange-700">
                  Click here if the payment tab didn't open automatically
                </a>
              </>
            )}

            {paymentOverlay.status === 'success' && (
              <>
                <CheckCircle size={70} className="text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-800">Payment Successful!</h2>
                <p className="text-slate-500 mt-2">Redirecting to your dashboard...</p>
              </>
            )}

            {paymentOverlay.status === 'failed' && (
              <>
                <div className="text-red-500 text-6xl mx-auto mb-6">⚠️</div>
                <h2 className="text-3xl font-bold text-slate-800">Payment Failed</h2>
                <p className="text-slate-500 mt-2 mb-6">The payment was declined or cancelled.</p>
                <Button onClick={() => setPaymentOverlay({ active: false })} className="w-full bg-slate-200 text-slate-800 hover:bg-slate-300">
                  Return to Checkout
                </Button>
              </>
            )}

            {paymentOverlay.status === 'timeout' && (
              <>
                <Clock size={70} className="text-orange-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800">Taking longer than usual...</h2>
                <p className="text-slate-500 mt-2 mb-2">We haven't received the final status from the bank yet.</p>
                <p className="text-sm font-bold text-slate-800 mb-6">Please check your order status again in a few minutes.</p>
                <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};