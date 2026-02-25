import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { getValidReferralCode } from '../utils/referralManager';
import { MapPin, Tag, CreditCard, ShoppingBag, Trash2, User, Loader2, CheckCircle, Clock, Plus, Home, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { orderService } from '../api/service/orderService';
import { Navbar } from '../components/sections/Navbar';

export const CheckoutPage = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useContext(AuthContext);
  const { cartItems, cartSubtotal, requiresShipping, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);

  // --- ADDRESS MANAGEMENT STATE ---
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);
  
  // --- PROMO & PRICING STATE ---
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);

  // --- PAYMENT OVERLAY STATE ---
  const [paymentOverlay, setPaymentOverlay] = useState({ active: false, status: 'waiting', orderId: null, paymentUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- PRICING CALCULATIONS ---
  const shipping = requiresShipping ? 50 : 0;
  const taxableAmount = Math.max(0, cartSubtotal - appliedDiscount);
  const taxRate = 0.05; // 5% standard GST on books/merchandise
  const taxAmount = Math.round(taxableAmount * taxRate);
  const finalTotal = taxableAmount + shipping + taxAmount;

  // --- FETCH USER ADDRESSES ---
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setIsFetchingAddresses(false);
        return;
      }
      try {
        // Create this endpoint in your backend to fetch the logged-in user's profile/addresses
        const { data } = await apiClient.get('/user/addresses'); 
        setSavedAddresses(data.addresses || []);
        
        if (data.addresses && data.addresses.length > 0) {
          setSelectedAddressIndex(0);
          setIsAddingNewAddress(false);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
        setIsAddingNewAddress(true);
      } finally {
        setIsFetchingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  // --- PROMO VALIDATION ---
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsVerifyingPromo(true);
    setPromoMessage({ text: '', type: '' });
    
    try {
      // Backend should check code validity, usage limits, and return the calculated discount
      const { data } = await apiClient.post('/discounts/validate', { code: promoCode, subtotal: cartSubtotal });
      setAppliedDiscount(data.discountAmount);
      setPromoMessage({ text: `Awesome! Saved ₹${data.discountAmount}`, type: 'success' });
    } catch (err) {
      setAppliedDiscount(0);
      setPromoMessage({ text: err.response?.data?.message || 'Invalid or expired code', type: 'error' });
    } finally {
      setIsVerifyingPromo(false);
    }
  };

  // --- CHECKOUT SUBMISSION ---
  const handleCheckout = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    // Validate Address
    let finalShippingAddress = 'Digital Delivery';
    if (requiresShipping) {
      if (isAddingNewAddress) {
        if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
          setError('Please fill in all shipping details for the new address.');
          return;
        }
        finalShippingAddress = `${newAddress.fullName}, ${newAddress.phone}, ${newAddress.street}, ${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}`;
        
        // Optional: Save this new address to the user's profile in the background
        try {
          await apiClient.post('/user/addresses', newAddress);
        } catch (e) {
          console.error("Could not save new address to profile", e);
        }
      } else {
        if (selectedAddressIndex === null || !savedAddresses[selectedAddressIndex]) {
          setError('Please select a shipping address.');
          return;
        }
        const addr = savedAddresses[selectedAddressIndex];
        finalShippingAddress = `${addr.fullName}, ${addr.phone}, ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
      }
    }

    setLoading(true);
    setError('');

    try {
      const hiddenReferral = getValidReferralCode();

      const payload = {
        orderItems: cartItems.map(item => ({ bookId: item.bookId, qty: item.qty })),
        shippingAddress: finalShippingAddress,
        priceBreakup: {
          subtotal: cartSubtotal,
          shipping: shipping,
          discountAmount: appliedDiscount,
          taxAmount: taxAmount,
          total: finalTotal
        },
        ...(appliedDiscount > 0 ? { discountCode: promoCode } : {}),
        ...(hiddenReferral ? { referralCode: hiddenReferral } : {})
      };

      const data = await orderService.checkout(payload);
      //clearCart();

      setPaymentOverlay({ active: true, status: 'waiting', orderId: data.orderId, paymentUrl: data.paymentPayload.redirectUrl });
      
      const newWindow = window.open(data.paymentPayload.redirectUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log("Popup blocked by browser. User must click fallback link.");
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize checkout. Please try again.');
      setLoading(false);
    }
  };

  // --- PAYMENT POLLING LOGIC ---
  useEffect(() => {
    if (!paymentOverlay.active || !paymentOverlay.orderId || paymentOverlay.status !== 'waiting') return;

    let attempts = 0;
    const maxAttempts = 6; 
    let pollInterval;

    const checkStatus = async () => {
      attempts++;
      try {
        const data = await orderService.verifyPayment(paymentOverlay.orderId);
        if (data.paymentStatus === 'Success') {
          setPaymentOverlay(prev => ({ ...prev, status: 'success' }));
          clearInterval(pollInterval);
          clearCart();
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

    const handleFocus = () => {
      if (!pollInterval) pollInterval = setInterval(checkStatus, 5000);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [paymentOverlay, navigate]);


  // --- EMPTY CART STATE ---
  if (cartItems.length === 0 && !paymentOverlay.active) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar theme={theme} setTheme={setTheme} />
        <div className="max-w-2xl mx-auto p-6 pt-40 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
            <ShoppingBag size={60} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Your cart is empty</h2>
            <p className="text-slate-500 mt-2 mb-8">Looks like you haven't added any books to your cart yet.</p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={() => navigate('/')} className="px-8 py-3">
                Explore the Store
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <Navbar theme={theme} setTheme={setTheme} />

      {/* Main Content */}
      <div className={`max-w-6xl mx-auto p-4 sm:p-6 pt-40 md:pt-32 transition-all duration-300 ${paymentOverlay.active ? 'blur-md pointer-events-none opacity-50' : ''}`}>
        
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-8">
          <ShoppingBag className="text-orange-600" /> Secure Checkout
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

            {/* Address Selection & Creation Section */}
            {requiresShipping && user && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                    <MapPin size={20} /> Shipping Address
                  </h2>
                  {!isAddingNewAddress && savedAddresses.length > 0 && (
                    <button 
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Plus size={16} /> New Address
                    </button>
                  )}
                </div>

                {isFetchingAddresses ? (
                  <div className="flex items-center justify-center py-6 text-slate-400">
                    <Loader2 className="animate-spin mr-2" size={20} /> Loading saved addresses...
                  </div>
                ) : (
                  <>
                    {/* Saved Addresses Grid */}
                    {!isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {savedAddresses.map((addr, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedAddressIndex(idx)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddressIndex === idx 
                                ? 'border-orange-500 bg-orange-50/50' 
                                : 'border-slate-200 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${selectedAddressIndex === idx ? 'text-orange-500' : 'text-slate-400'}`}>
                                <Home size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{addr.fullName}</p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">📞 {addr.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Address Form */}
                    {isAddingNewAddress && (
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 animate-[fadeIn_0.2s_ease-out]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" name="fullName" placeholder="Full Name" onChange={handleAddressChange} className="p-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-orange-500 shadow-sm" />
                          <input type="tel" name="phone" placeholder="Phone Number" onChange={handleAddressChange} className="p-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-orange-500 shadow-sm" />
                          <input type="text" name="street" placeholder="Street Address / Flat No" onChange={handleAddressChange} className="p-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-orange-500 shadow-sm md:col-span-2" />
                          <input type="text" name="city" placeholder="City" onChange={handleAddressChange} className="p-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-orange-500 shadow-sm" />
                          <div className="flex gap-4">
                            <input type="text" name="state" placeholder="State" onChange={handleAddressChange} className="w-1/2 p-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-orange-500 shadow-sm" />
                            <input type="text" name="pincode" placeholder="PIN Code" onChange={handleAddressChange} className="w-1/2 p-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-orange-500 shadow-sm" />
                          </div>
                        </div>
                        {savedAddresses.length > 0 && (
                          <button 
                            onClick={() => setIsAddingNewAddress(false)}
                            className="mt-4 text-sm font-bold text-slate-500 hover:text-slate-700 underline"
                          >
                            Cancel and use saved address
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Promo Code Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Tag size={20} /> Apply Promo Code</h2>
              <div className="flex gap-3">
                <input 
                  type="text" placeholder="Enter Discount Code" 
                  value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 uppercase font-mono tracking-wider"
                />
                <Button variant="secondary" onClick={handleApplyPromo} disabled={isVerifyingPromo || !promoCode} className="px-6 border border-slate-300">
                  {isVerifyingPromo ? <Loader2 size={18} className="animate-spin" /> : 'Apply'}
                </Button>
              </div>
              {promoMessage.text && (
                <div className={`mt-3 text-sm font-medium flex items-center gap-2 p-3 rounded-lg border ${promoMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {promoMessage.type === 'success' ? <CheckCircle size={16} /> : <div className="font-bold text-lg leading-none">!</div>}
                  {promoMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 h-fit lg:sticky top-28">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span> <span className="font-semibold">₹{cartSubtotal}</span>
              </div>
              
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg -mx-2 px-2">
                  <span className="flex items-center gap-1"><Tag size={14}/> Discount</span> 
                  <span className="font-bold">-₹{appliedDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100/50">
                <span>Taxes (5% GST)</span> <span className="font-semibold">₹{taxAmount}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span> <span className="font-semibold">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              
              <div className="flex justify-between text-xl font-black text-slate-900 mt-4 pt-4 border-t border-slate-200">
                <span>Total to Pay</span> <span className="text-orange-600">₹{finalTotal}</span>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mb-4 font-medium p-3 bg-red-50 border border-red-100 rounded-lg">{error}</p>}

            <Button 
              variant="primary" 
              onClick={handleCheckout} 
              disabled={loading}
              className="w-full py-4 text-lg font-bold flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30 rounded-xl"
            >
              {loading ? <><Loader2 size={20} className="animate-spin"/> Processing...</> : (
                <>{user ? <CreditCard size={20} /> : <User size={20} />} {user ? 'Proceed to Pay' : 'Login to Checkout'}</>
              )}
            </Button>
            
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <Lock size={12} /> Secure encrypted payment
            </p>
          </div>
        </div>
      </div>

      {/* PAYMENT OVERLAY (Fixed Full Screen) */}
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