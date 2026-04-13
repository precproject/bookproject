import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowLeft, ShoppingBag, MapPin, 
  CreditCard, CheckCircle2, ShieldCheck, 
  Smartphone, UserCircle, Mail, Lock, Tag, Loader2, Home, Plus,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/Button';

// Contexts & API
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import apiClient from '../../api/client';
import { getValidReferralCode } from '../../utils/referralManager';
import { orderService } from '../../api/service/orderService';

export const Checkout = ({ isOpen, onClose }) => {
  const { cartItems, cartSubtotal, requiresShipping, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { user, login } = useContext(AuthContext);

  // --- DYNAMIC PRICING FROM CONFIG ---
  const { config } = useConfig();
  const gstPercentage = config?.taxConfig?.isGstEnabled ? (config?.taxConfig?.gstPercentage || 5) : 0;
  const configShippingCharge = config?.delivery?.shippingCharge || 50;

  // --- NAVIGATION STATE ---
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // --- STEP 2: AUTH STATE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- STEP 3: ADDRESS STATE ---
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0); 
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // --- PROMO STATE ---
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);

  // --- PAYMENT OVERLAY STATE ---
  const [paymentOverlay, setPaymentOverlay] = useState({ active: false, status: 'waiting', orderId: null });

  // --- PRICING CALCULATIONS ---
  const shipping = requiresShipping && cartSubtotal > 0 ? configShippingCharge : 0;
  const taxableAmount = Math.max(0, cartSubtotal - appliedDiscount);
  const taxAmount = Math.round(taxableAmount * (gstPercentage / 100));
  const finalTotal = Math.round(taxableAmount + shipping + taxAmount);

  // --- EFFECTS ---

  // Auto-skip Auth step if user logs in
  useEffect(() => {
    if (user && step === 2) {
      setStep(3);
    }
  }, [user, step]);

  // Fetch Addresses when reaching Step 3
  useEffect(() => {
    if (step === 3 && user && requiresShipping) {
      fetchAddresses();
    } else if (step === 3 && !requiresShipping) {
      // Skip address if digital only
      setStep(4);
    }
  }, [step, user, requiresShipping]);

  const fetchAddresses = async () => {
    setIsFetchingAddresses(true);
    try {
      const { data } = await apiClient.get('/user/addresses');
      setSavedAddresses(data.addresses || []);
      if (data.addresses?.length > 0) {
        setSelectedAddressIndex(0);
        setIsAddingNewAddress(false);
      } else {
        setIsAddingNewAddress(true);
      }
    } catch (err) {
      setIsAddingNewAddress(true);
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  // --- HANDLERS ---

  const handleProceedFromCart = () => {
    if (cartItems.length === 0) return;
    if (user) setStep(requiresShipping ? 3 : 4);
    else setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  // Auto Pincode Fetcher
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6); 
    setNewAddress(prev => ({ ...prev, pincode: val }));

    if (val.length === 6) {
      setIsFetchingLocation(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setNewAddress(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (err) {
        console.error("Pincode fetch error:", err);
      } finally {
        setIsFetchingLocation(false);
      }
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsVerifyingPromo(true);
    setPromoMessage({ text: '', type: '' });
    
    try {
      const { data } = await apiClient.post('/discounts/validate', { code: promoCode, subtotal: cartSubtotal });
      setAppliedDiscount(data.discountAmount);
      setPromoMessage({ text: `Saved ₹${data.discountAmount}!`, type: 'success' });
    } catch (err) {
      setAppliedDiscount(0);
      setPromoMessage({ text: err.response?.data?.message || 'Invalid code', type: 'error' });
    } finally {
      setIsVerifyingPromo(false);
    }
  };

  const handleProceedToPayment = async () => {
    setError('');
    if (requiresShipping && isAddingNewAddress) {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        setError('Please fill in all shipping details.');
        return;
      }
      try {
        await apiClient.post('/user/addresses', newAddress);
        await fetchAddresses(); // Refresh addresses so selection works properly
      } catch (e) {
        setError("Could not save address. Please try again.");
        return;
      }
    }
    setStep(4);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    // Open the window IMMEDIATELY on click to bypass popup blockers
    const paymentWindow = window.open('', '_blank');
    if (paymentWindow) {
      paymentWindow.document.write('<div style="font-family:sans-serif; text-align:center; padding-top:50px;"><h2>Securely connecting to payment gateway... Please wait.</h2></div>');
    }

    let finalShippingAddress = undefined;

    if (requiresShipping) {
      if (isAddingNewAddress) {
        finalShippingAddress = { ...newAddress };
      } else {
        const addr = savedAddresses[selectedAddressIndex || 0];
        finalShippingAddress = {
          fullName: addr.fullName,
          phone: addr.phone,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode
        };
      }
    }

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
      
      // Update the safely opened window with the actual payment URL
      if (paymentWindow) {
        paymentWindow.location.href = data.paymentPayload.redirectUrl;
      } else {
        alert("Payment popup blocked! Please disable your popup blocker and try again.");
      }
      
      setPaymentOverlay({ active: true, status: 'waiting', orderId: data.orderId });

    } catch (err) {
      if (paymentWindow) paymentWindow.close(); // Close the blank window if API fails
      setError(err.response?.data?.message || 'Failed to initialize checkout.');
      setIsProcessing(false);
    }
  };

  // --- 1. INSTANT POPUP CALLBACK LISTENER (postMessage) ---
  useEffect(() => {
    const handlePaymentMessage = (event) => {
      // Security check: Only trust messages from your own website origin
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'PAYMENT_CALLBACK') {
        if (event.data.status === 'SUCCESS') {
          setPaymentOverlay(prev => ({ ...prev, status: 'success' }));
          setIsProcessing(false);
          clearCart();
          setStep(5); // Move to Success Screen
        } else {
          setPaymentOverlay(prev => ({ ...prev, status: 'failed' }));
          setIsProcessing(false);
          setError("Payment failed or was cancelled. Your cart has been saved.");
          
          setTimeout(() => {
             setPaymentOverlay({ active: false, status: 'waiting', orderId: null });
          }, 3000);
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, [clearCart]);

  // --- 2. BACKGROUND POLLING FAILSAFE ---
  useEffect(() => {
    if (!paymentOverlay.active || paymentOverlay.status !== 'waiting') return;

    let pollInterval = setInterval(async () => {
      try {
        const data = await orderService.verifyPayment(paymentOverlay.orderId);
        if (data.paymentStatus === 'Success') {
          setPaymentOverlay(prev => ({ ...prev, status: 'success' }));
          clearInterval(pollInterval);
          setIsProcessing(false);
          clearCart();
          setStep(5); 
        } else if (data.paymentStatus === 'Failed') {
          setPaymentOverlay(prev => ({ ...prev, status: 'failed' }));
          clearInterval(pollInterval);
          setIsProcessing(false);
          setError("Payment failed or was cancelled. Your cart has been saved.");

          setTimeout(() => {
             setPaymentOverlay({ active: false, status: 'waiting', orderId: null });
          }, 3000);
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [paymentOverlay, clearCart]);

  const handleBack = () => {
    setError('');
    if (step === 3 && user) setStep(1); 
    else if (step === 4 && !requiresShipping) setStep(1);
    else setStep(prev => prev - 1);
  };

  if (!isOpen) return null;

  const visualSteps = user 
    ? [ { num: 1, icon: ShoppingBag, label: "Cart" }, { num: 3, icon: MapPin, label: "Address" }, { num: 4, icon: CreditCard, label: "Payment" } ]
    : [ { num: 1, icon: ShoppingBag, label: "Cart" }, { num: 2, icon: UserCircle, label: "Account" }, { num: 3, icon: MapPin, label: "Address" }, { num: 4, icon: CreditCard, label: "Payment" } ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full h-full max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-2xl md:h-[90vh] md:max-h-[800px] md:rounded-2xl flex flex-col overflow-hidden relative">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {step > 1 && step < 5 && !paymentOverlay.active && (
              <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              {step === 1 && "Order Summary"}
              {step === 2 && "Account Sign In"}
              {step === 3 && "Delivery Address"}
              {step === 4 && "Secure Payment"}
              {step === 5 && "Order Confirmed"}
            </h2>
          </div>
          {step < 5 && !paymentOverlay.active && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-red-500">
              <X size={24} />
            </button>
          )}
        </div>

        {/* --- PROGRESS BAR --- */}
        {step < 5 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between relative shrink-0">
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
            {visualSteps.map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 dark:bg-transparent px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  step >= s.num ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-xs font-medium ${step >= s.num ? 'text-orange-600 dark:text-orange-500' : 'text-slate-500'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- DYNAMIC STEP CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-900/50">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CART & PROMO */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-xl mx-auto">
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    <ShoppingBag size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.bookId} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 block">{item.type}</span>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2">{item.name}</h3>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                                <button onClick={() => updateQuantity(item.bookId, item.qty - 1)} className="w-6 h-6 rounded bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-white font-bold hover:text-orange-600 transition">-</button>
                                <span className="w-4 text-center text-sm font-semibold text-slate-800 dark:text-white">{item.qty}</span>
                                <button onClick={() => updateQuantity(item.bookId, item.qty + 1)} className="w-6 h-6 rounded bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-white font-bold hover:text-orange-600 transition">+</button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col justify-between items-end">
                            <p className="font-bold text-slate-900 dark:text-white">₹{item.price * item.qty}</p>
                            <button onClick={() => removeFromCart(item.bookId)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Promo Section */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="text" placeholder="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 uppercase text-sm font-mono" />
                        </div>
                        <Button variant="secondary" onClick={handleApplyPromo} disabled={isVerifyingPromo || !promoCode} className="px-4 text-sm">
                          {isVerifyingPromo ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {promoMessage.text && (
                        <p className={`mt-2 text-xs font-bold ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{promoMessage.text}</p>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
                      {appliedDiscount > 0 && <div className="flex justify-between text-green-600 font-medium text-sm"><span>Discount</span><span>-₹{appliedDiscount}</span></div>}
                      
                      {gstPercentage > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm"><span>Tax ({gstPercentage}% GST)</span><span>₹{taxAmount}</span></div>
                      )}

                      <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm"><span>Delivery</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                      <div className="h-px w-full bg-slate-100 dark:bg-slate-700 my-2" />
                      <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white"><span>Total</span><span className="text-orange-600">₹{finalTotal}</span></div>
                    </div>
                    
                    <Button variant="primary" className="w-full text-lg py-4" onClick={handleProceedFromCart}>
                      {user ? "Proceed to Address" : "Secure Checkout"}
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 2: AUTHENTICATION */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center justify-center h-full max-w-sm mx-auto py-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-6"><UserCircle size={32} /></div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2 text-center">Login to Checkout</h3>
                <p className="text-slate-600 dark:text-slate-400 text-center mb-8 text-sm">Sign in to save your order details securely.</p>

                {error && <div className="w-full p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">{error}</div>}

                <form onSubmit={handleLogin} className="w-full space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                  </div>
                  <Button variant="primary" type="submit" className="w-full py-3.5" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sign In & Continue"}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: DELIVERY ADDRESS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 max-w-xl mx-auto">
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">{error}</div>}

                {isFetchingAddresses ? (
                  <div className="py-10 text-center text-slate-500 flex flex-col items-center"><Loader2 size={30} className="animate-spin mb-3 text-orange-500"/> Loading addresses...</div>
                ) : (
                  <>
                    {!isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        {savedAddresses.map((addr, idx) => (
                          <div key={addr._id || idx} onClick={() => setSelectedAddressIndex(idx)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}>
                            <div className="flex items-start gap-3">
                              <Home size={18} className={`mt-0.5 ${selectedAddressIndex === idx ? 'text-orange-500' : 'text-slate-400'}`} />
                              <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{addr.fullName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">📞 {addr.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!isAddingNewAddress && savedAddresses.length > 0) ? (
                      <button onClick={() => setIsAddingNewAddress(true)} className="text-sm font-bold text-orange-600 flex items-center gap-1 mb-4"><Plus size={16}/> Add New Address</button>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="fullName" placeholder="Full Name" onChange={handleAddressChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                        <input type="tel" name="phone" placeholder="Mobile Number" onChange={handleAddressChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                        <input type="text" name="street" placeholder="Street Address / Flat No" onChange={handleAddressChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm md:col-span-2" />
                        
                        <div className="relative">
                          <input type="text" name="pincode" placeholder="PIN Code" value={newAddress.pincode} onChange={handlePincodeChange} maxLength={6} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                          {isFetchingLocation && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-orange-500" />}
                        </div>

                        <input type="text" name="city" placeholder="City" value={newAddress.city} onChange={handleAddressChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                        <input type="text" name="state" placeholder="State" value={newAddress.state} onChange={handleAddressChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                      </div>
                    )}
                    
                    {isAddingNewAddress && savedAddresses.length > 0 && (
                      <button onClick={() => setIsAddingNewAddress(false)} className="text-sm font-bold text-slate-500 mt-4 block">Cancel new address</button>
                    )}

                    <div className="pt-4">
                      <Button variant="primary" className="w-full text-lg py-4" onClick={handleProceedToPayment}>
                        Confirm Delivery Details
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 4: PAYMENT (PHONEPE) */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-md mx-auto">
                
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">{error}</div>}

                {paymentOverlay.active ? (
                   <div className="text-center py-10 space-y-4">
                     <Loader2 size={50} className="animate-spin text-orange-500 mx-auto" />
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">Awaiting Payment</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400">Please complete the payment in the new tab that just opened.</p>
                   </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 py-3 rounded-lg">
                      <ShieldCheck size={20} />
                      <span className="font-medium text-sm">100% Secure Encrypted Payment</span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border-2 border-[#5f259f] rounded-2xl overflow-hidden shadow-md relative">
                      <div className="bg-[#5f259f] text-white p-4 flex items-center gap-3">
                        <Smartphone size={24} />
                        <span className="font-bold text-lg tracking-wide">PhonePe Gateway</span>
                      </div>
                      
                      <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-4">
                        <p className="text-slate-600 dark:text-slate-300 text-sm">You will be redirected to the secure portal.</p>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white">₹{finalTotal}</h2>
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment} 
                      disabled={isProcessing}
                      className="w-full bg-[#5f259f] hover:bg-[#4a1c7d] text-white font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[#5f259f]/30"
                    >
                      {isProcessing ? <Loader2 size={20} className="animate-spin"/> : `Pay ₹${finalTotal} Now`}
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 5: SUCCESS CONFIRMATION */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6 space-y-6 max-w-md mx-auto">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={40} />
                </motion.div>
                
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Order Confirmed!</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Thank you for your purchase! A confirmation has been sent to your email.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full mt-4 text-left">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</div>
                  <div className="font-mono font-bold text-lg text-slate-900 dark:text-white mb-4">#{paymentOverlay.orderId}</div>
                  
                  {requiresShipping && (
                    <>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Delivery</div>
                      <div className="font-bold text-slate-900 dark:text-white">3-5 Business Days</div>
                    </>
                  )}
                </div>

                <Button variant="primary" className="w-full mt-4 py-3.5" onClick={() => { onClose(); window.location.href='/dashboard'; }}>
                  View My Orders
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};