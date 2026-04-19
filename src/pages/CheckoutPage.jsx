import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ConfigContext } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext'; 
import apiClient from '../api/client';
import { getValidReferralCode } from '../utils/referralManager';
import { MapPin, Tag, CreditCard, ShoppingBag, Trash2, User, Loader2, CheckCircle, Clock, Plus, Home, Lock, Truck, Banknote } from 'lucide-react';
import { orderService } from '../api/service/orderService';
import { Navbar } from '../components/sections/Navbar';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next'; 

export const CheckoutPage = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation(); 
  const { showToast } = useToast(); 

  const { user, openAuthModal } = useContext(AuthContext);
  const { cartItems, cartSubtotal, requiresShipping, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { config } = useContext(ConfigContext);

  // --- ADDRESS MANAGEMENT STATE ---
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);
  
  // --- PROMO & PRICING STATE ---
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);

  // --- NEW: PAYMENT METHOD STATE ---
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // 'ONLINE' or 'COD'

  // --- PAYMENT OVERLAY STATE ---
  const [paymentOverlay, setPaymentOverlay] = useState({ active: false, status: 'waiting', orderId: null, paymentUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- CONFIG EXTRACTION ---
  const taxRate = config?.taxConfig?.isGstEnabled ? (config?.taxConfig?.gstPercentage || 18) : 18;
  const baseShippingCharge = config?.delivery?.shippingCharge ?? 50;
  const isCodEnabled = config?.payment?.isCodEnabled ?? true;
  const codCharge = config?.payment?.codCharge || 0;

  // --- PRICING CALCULATIONS ---
  const shipping = requiresShipping ? baseShippingCharge : 0;
  const taxableAmount = Math.max(0, cartSubtotal - appliedDiscount);
  const taxAmount = Math.round(taxableAmount * (taxRate / 100));
  
  // Add COD Fee ONLY if COD is selected and shipping is required
  const appliedCodFee = (paymentMethod === 'COD' && requiresShipping) ? codCharge : 0;
  const finalTotal = taxableAmount + shipping + taxAmount + appliedCodFee;

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!user) {
        setIsFetchingAddresses(false);
        return;
      }
      try {
        const { data } = await apiClient.get('/user/addresses'); 
        setSavedAddresses(data.addresses || []);
        if (data.addresses && data.addresses.length > 0) {
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
    fetchUserAddresses();
  }, [user]);

  // --- ADDRESS FORM HANDLERS ---
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6); 
    setNewAddress(prev => ({ ...prev, pincode: val }));

    if (val.length === 6) {
      setIsFetchingLocation(true);
      setAddressError('');
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setNewAddress(prev => ({ ...prev, city: postOffice.District, state: postOffice.State }));
        } else {
          setAddressError(t('checkout.invalidPincode', 'Invalid Pincode. Could not fetch city/state.'));
        }
      } catch (err) {
        console.error("Pincode fetch error:", err);
      } finally {
        setIsFetchingLocation(false);
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setAddressError(t('checkout.errorFillDetails', 'Please fill in all the details before saving.'));
      return;
    }

    setIsSavingAddress(true);
    setAddressError('');

    try {
      const { data } = await apiClient.post('/user/addresses', newAddress);
      setSavedAddresses(data.addresses);
      setSelectedAddressIndex(0); 
      setIsAddingNewAddress(false);
      setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
      showToast(t('alerts.addressSaved', 'Address saved successfully.'), 'success');
    } catch (err) {
      setAddressError(t('checkout.errorSaveAddress', 'Failed to save address. Please try again.'));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (e, addressId, index) => {
    e.stopPropagation(); 
    if (!window.confirm(t('checkout.confirmDeleteAddress', "Are you sure you want to remove this address?"))) return;

    try {
      const { data } = await apiClient.delete(`/user/addresses/${addressId || index}`);
      setSavedAddresses(data.addresses);
      if (selectedAddressIndex === index) setSelectedAddressIndex(null);
      if (data.addresses.length === 0) setIsAddingNewAddress(true);
      showToast(t('alerts.success', 'Success!'), 'success');
    } catch (err) {
      showToast(t('alerts.addressDeleteFailed', "Failed to remove address."), 'error');
    }
  };
  
  // --- PROMO VALIDATION ---
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsVerifyingPromo(true);
    setPromoMessage({ text: '', type: '' });
    
    try {
      const { data } = await apiClient.post('/discounts/validate', { code: promoCode, subtotal: cartSubtotal });
      setAppliedDiscount(data.discountAmount);
      setPromoMessage({ text: `${t('checkout.savedAmount', 'Awesome! Saved ₹')}${data.discountAmount}`, type: 'success' });
    } catch (err) {
      setAppliedDiscount(0);
      setPromoMessage({ text: err.response?.data?.message || t('checkout.invalidPromo', 'Invalid or expired code'), type: 'error' });
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

    if (isAddingNewAddress && requiresShipping) {
      setError(t('checkout.errorSaveFirst', "Please save your delivery address first by clicking the 'Save & Select' button."));
      return;
    }

    let finalShippingAddress = undefined; 

    if (requiresShipping) {
      if (selectedAddressIndex === null || !savedAddresses[selectedAddressIndex]) {
        setError(t('checkout.errorSelectAddress', "Please select a delivery address."));
        return;
      }
      
      const addr = savedAddresses[selectedAddressIndex];
      finalShippingAddress = {
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode
      };
    }

    setLoading(true);
    setError('');

    try {
      const hiddenReferral = getValidReferralCode();
      const payload = {
        orderItems: cartItems.map(item => ({ bookId: item.bookId, qty: item.qty })),
        shippingAddress: finalShippingAddress,
        paymentMethod: paymentMethod, // <-- Send COD or ONLINE to backend
        ...(appliedDiscount > 0 ? { discountCode: promoCode } : {}),
        ...(hiddenReferral ? { referralCode: hiddenReferral } : {})
      };

      const data = await orderService.checkout(payload);

      // --- HANDLE COD SUCCESS IMMEDIATELY ---
      if (data.isCOD) {
        setPaymentOverlay({ active: true, status: 'success', orderId: data.orderId });
        clearCart();
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      // --- HANDLE ONLINE PAYMENT ---
      setPaymentOverlay({ active: true, status: 'waiting', orderId: data.orderId, paymentUrl: data.paymentPayload.redirectUrl });
      window.location.href = data.paymentPayload.redirectUrl;

    } catch (err) {
      setError(err.response?.data?.message || t('checkout.errorInitCheckout', 'Failed to start checkout. Please try again.'));
      setLoading(false);
    }
  };

  // --- MISSING FIX: POSTMESSAGE LISTENER ---
  // Replaces the old inefficient polling loop. Listens instantly to the popup window.
  useEffect(() => {
    const handlePaymentMessage = (event) => {
      // Security Check: Only accept messages from your own domain
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'PAYMENT_CALLBACK') {
        if (event.data.status === 'SUCCESS') {
          setPaymentOverlay(prev => ({ ...prev, status: 'success' }));
          clearCart();
          setTimeout(() => navigate('/dashboard'), 3000);
        } else if (event.data.status === 'FAILED') {
          setPaymentOverlay(prev => ({ ...prev, status: 'failed' }));
          setLoading(false);
        } else if (event.data.status === 'TIMEOUT') {
          setPaymentOverlay(prev => ({ ...prev, status: 'timeout' }));
          clearCart(); // Safe to clear, order exists as pending
          setTimeout(() => navigate('/dashboard'), 5000);
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, [navigate, clearCart]);


  // --- EMPTY CART STATE ---
  if (cartItems.length === 0 && !paymentOverlay.active) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar theme={theme} setTheme={toggleTheme} />
        <div className="max-w-2xl mx-auto p-6 pt-40 text-center">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <ShoppingBag size={60} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('checkout.emptyCartTitle', 'Your cart is empty')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">{t('checkout.emptyCartDesc', "Looks like you haven't added any books to your cart yet.")}</p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={() => navigate('/store')} className="px-8 py-3">{t('checkout.exploreStore', 'Explore the Store')}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      {/* Main Content */}
      <div className={`max-w-6xl mx-auto p-4 sm:p-6 pt-40 md:pt-32 transition-all duration-300 ${paymentOverlay.active ? 'blur-md pointer-events-none opacity-50' : ''}`}>
        
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
          <ShoppingBag className="text-orange-600 dark:text-orange-500" /> {t('checkout.secureCheckout', 'Secure Checkout')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form & Cart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Cart Items */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <h2 className="text-lg font-bold mb-4 text-slate-700 dark:text-slate-200">{t('checkout.reviewItems', 'Review Items')}</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.bookId} className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.type} {t('checkout.edition', 'Edition')} - ₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.bookId, item.qty - 1)} className="w-8 h-8 rounded bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-200 font-bold hover:text-orange-600 dark:hover:text-orange-400 transition">-</button>
                        <span className="w-6 text-center font-semibold text-slate-800 dark:text-white">{item.qty}</span>
                        <button onClick={() => updateQuantity(item.bookId, item.qty + 1)} className="w-8 h-8 rounded bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-200 font-bold hover:text-orange-600 dark:hover:text-orange-400 transition">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.bookId)} className="text-red-400 hover:text-red-600 dark:hover:text-red-400 transition p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Selection & Creation Section */}
            {requiresShipping && user && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <MapPin size={20} /> {t('checkout.shippingAddress', 'Delivery Address')}
                  </h2>
                  {!isAddingNewAddress && savedAddresses.length > 0 && (
                    <button 
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-sm font-bold text-orange-600 dark:text-orange-500 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Plus size={16} /> {t('checkout.addNewAddress', 'Add New Address')}
                    </button>
                  )}
                </div>

                {isFetchingAddresses ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 dark:text-slate-500">
                    <Loader2 className="animate-spin mr-2" size={20} /> {t('checkout.loadingAddresses', 'Loading addresses...')}
                  </div>
                ) : (
                  <>
                    {/* Saved Addresses Grid */}
                    {!isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {savedAddresses.map((addr, idx) => (
                          <div 
                            key={addr._id || idx} 
                            onClick={() => setSelectedAddressIndex(idx)}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddressIndex === idx 
                                ? 'border-orange-500 bg-orange-50/50 dark:border-orange-500 dark:bg-orange-900/20' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500'
                            }`}
                          >
                            <button 
                              onClick={(e) => handleDeleteAddress(e, addr._id, idx)}
                              className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title={t('checkout.deleteAddress', 'Delete Address')}
                            >
                              <Trash2 size={16} />
                            </button>

                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${selectedAddressIndex === idx ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                <Home size={18} />
                              </div>
                              <div className="pr-6">
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{addr.fullName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">📞 {addr.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Address Form */}
                    {isAddingNewAddress && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 animate-[fadeIn_0.2s_ease-out]">
                        
                        {addressError && (
                          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800/50">
                            {addressError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          <input type="text" name="fullName" value={newAddress.fullName} placeholder={t('checkout.fullName', 'Full Name')} onChange={handleAddressChange} className="p-3 bg-white dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:border-orange-500 shadow-sm" />
                          <input type="tel" name="phone" value={newAddress.phone} placeholder={t('checkout.phone', 'Phone Number')} onChange={handleAddressChange} className="p-3 bg-white dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:border-orange-500 shadow-sm" />
                          
                          <input type="text" name="street" value={newAddress.street} placeholder={t('checkout.street', 'Street Address / Flat No')} onChange={handleAddressChange} className="p-3 bg-white dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:border-orange-500 shadow-sm md:col-span-2" />
                          
                          <div className="relative">
                            <input type="text" name="pincode" value={newAddress.pincode} placeholder={t('checkout.pincode', 'PIN Code')} onChange={handlePincodeChange} maxLength={6} className="w-full p-3 bg-white dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:border-orange-500 shadow-sm" />
                            {isFetchingLocation && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-orange-500" />}
                          </div>

                          <div className="flex gap-4">
                            <input type="text" name="city" value={newAddress.city} placeholder={t('checkout.city', 'City')} onChange={handleAddressChange} className="w-1/2 p-3 bg-white dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:border-orange-500 shadow-sm" />
                            <input type="text" name="state" value={newAddress.state} placeholder={t('checkout.state', 'State')} onChange={handleAddressChange} className="w-1/2 p-3 bg-white dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:border-orange-500 shadow-sm" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={handleSaveAddress}
                            disabled={isSavingAddress}
                            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                          >
                            {isSavingAddress ? <Loader2 size={18} className="animate-spin" /> : null}
                            {isSavingAddress ? t('checkout.saving', 'Saving...') : t('checkout.saveSelectAddress', 'Save & Select Address')}
                          </button>
                          
                          {savedAddresses.length > 0 && (
                            <button 
                              onClick={() => {
                                setIsAddingNewAddress(false);
                                setAddressError('');
                              }}
                              className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                              {t('checkout.cancel', 'Cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Promo Code Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200"><Tag size={20} /> {t('checkout.applyPromo', 'Apply Promo Code')}</h2>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                    type="text" placeholder={t('checkout.enterPromo', 'Enter Discount Code')} 
                    value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 uppercase font-mono tracking-wider"
                  />
                </div>
                <Button variant="secondary" onClick={handleApplyPromo} disabled={isVerifyingPromo || !promoCode} className="px-6 border border-slate-300 dark:border-slate-600">
                  {isVerifyingPromo ? <Loader2 size={18} className="animate-spin" /> : t('checkout.apply', 'Apply')}
                </Button>
              </div>
              {promoMessage.text && (
                <div className={`mt-3 text-sm font-medium flex items-center gap-2 p-3 rounded-lg border ${promoMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}>
                  {promoMessage.type === 'success' ? <CheckCircle size={16} /> : <div className="font-bold text-lg leading-none">!</div>}
                  {promoMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="space-y-6 lg:sticky top-28 h-fit">
            
            {/* --- NEW: PAYMENT METHOD SELECTION --- */}
            {requiresShipping && isCodEnabled && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">{t('checkout.paymentMethod', 'Payment Method')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                      paymentMethod === 'ONLINE' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-inner' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-500'
                    }`}
                  >
                    <CreditCard size={28} className={paymentMethod === 'ONLINE' ? 'text-orange-500' : ''} />
                    <span className="text-sm font-bold">{t('checkout.payOnline', 'Pay Online')}</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                      paymentMethod === 'COD' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-inner' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-500'
                    }`}
                  >
                    <Banknote size={28} className={paymentMethod === 'COD' ? 'text-orange-500' : ''} />
                    <span className="text-sm font-bold">{t('checkout.cod', 'Cash on Delivery')}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
              <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">{t('checkout.orderSummary', 'Order Summary')}</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>{t('checkout.subtotal', 'Subtotal')}</span> <span className="font-semibold">₹{cartSubtotal}</span>
                </div>
                
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg -mx-2 px-2">
                    <span className="flex items-center gap-1"><Tag size={14}/> {t('checkout.discount', 'Discount')}</span> 
                    <span className="font-bold">-₹{appliedDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
                  <span>{t('checkout.taxes', 'Taxes')} ({taxRate}% {t('checkout.gst', 'GST')})</span> <span className="font-semibold">₹{taxAmount}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>{t('checkout.shipping', 'Shipping')}</span> <span className="font-semibold">{shipping === 0 ? t('checkout.free', 'Free') : `₹${shipping}`}</span>
                </div>

                {/* --- NEW: COD FEE DISPLAY --- */}
                {paymentMethod === 'COD' && requiresShipping && codCharge > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg -mx-2 px-2">
                    <span className="flex items-center gap-1"><Truck size={14}/> {t('checkout.codFee', 'COD Fee')}</span> 
                    <span className="font-bold">+₹{codCharge}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xl font-black text-slate-900 dark:text-white mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span>{t('checkout.totalToPay', 'Total to Pay')}</span> <span className="text-orange-600 dark:text-orange-500">₹{finalTotal}</span>
                </div>
              </div>

              {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4 font-medium p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">{error}</p>}

              <Button 
                variant="primary" 
                onClick={handleCheckout} 
                disabled={loading || (requiresShipping && isAddingNewAddress)}
                className="w-full py-4 text-lg font-bold flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30 rounded-xl"
              >
                {loading ? <><Loader2 size={20} className="animate-spin"/> {t('checkout.processing', 'Processing...')}</> : (
                  <>
                    {user ? (paymentMethod === 'COD' ? <CheckCircle size={20} /> : <CreditCard size={20} />) : <User size={20} />} 
                    {user ? (paymentMethod === 'COD' ? t('checkout.confirmOrder', 'Confirm Order') : t('checkout.proceedToPay', 'Proceed to Pay')) : t('checkout.loginToCheckout', 'Login to Checkout')}
                  </>
                )}
              </Button>
              
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1">
                {paymentMethod === 'ONLINE' ? <><Lock size={12} /> {t('checkout.securePayment', 'Secure encrypted payment')}</> : <><Truck size={12} /> {t('checkout.payOnDelivery', 'Pay cash when your order arrives')}</>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT OVERLAY (Fixed Full Screen) */}
      {paymentOverlay.active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-[scaleIn_0.2s_ease-out]">
            
            {paymentOverlay.status === 'waiting' && (
              <>
                <Loader2 size={60} className="text-orange-500 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('checkout.paymentWaiting', 'Complete your payment')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-3 mb-6">
                  {t('checkout.paymentWaitingDesc1', 'Please complete the payment in the new tab.')} <br/>
                  <strong>{t('checkout.paymentWaitingDesc2', 'Do not close this window. We are waiting for the bank confirmation.')}</strong>
                </p>
                <a href={paymentOverlay.paymentUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-orange-600 dark:text-orange-500 underline hover:text-orange-700 dark:hover:text-orange-400">
                  {t('checkout.paymentLink', "Click here if the payment tab didn't open")}
                </a>
              </>
            )}

            {paymentOverlay.status === 'success' && (
              <>
                <CheckCircle size={70} className="text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t('checkout.paymentSuccess', 'Order Successful!')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">{t('checkout.redirecting', 'Redirecting to your dashboard...')}</p>
              </>
            )}

            {paymentOverlay.status === 'failed' && (
              <>
                <div className="text-red-500 text-6xl mx-auto mb-6">⚠️</div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t('checkout.paymentFailed', 'Payment Failed')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">{t('checkout.paymentDeclined', 'The payment was declined or cancelled.')}</p>
                <Button onClick={() => setPaymentOverlay({ active: false })} className="w-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700">
                  {t('checkout.returnToCheckout', 'Return to Checkout')}
                </Button>
              </>
            )}

            {paymentOverlay.status === 'timeout' && (
              <>
                <Clock size={70} className="text-orange-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('checkout.paymentTimeout', 'Taking longer than usual...')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-2">{t('checkout.timeoutDesc1', 'We haven\'t received the final status from the bank yet.')}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-6">{t('checkout.timeoutDesc2', 'Please check your order status again in a few minutes.')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('checkout.redirecting', 'Redirecting to your dashboard...')}</p>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};