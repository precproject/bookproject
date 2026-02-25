import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Truck, Key, Save, CheckCircle, Eye, EyeOff, 
  Globe, Mail, Phone, Store, Loader2, Settings, Plus, Trash2 
} from 'lucide-react';
import { adminService } from '../../api/service/adminService';

export const DashboardConfig = () => {
  // --- STATE MANAGEMENT ---
  const [toastMessage, setToastMessage] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  // Loading States for Saves
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [isSavingDynamic, setIsSavingDynamic] = useState(false);

  // General Config State
  const [generalConfig, setGeneralConfig] = useState({
    storeName: '',
    supportEmail: '',
    supportPhone: ''
  });

  // Payment Config State
  const [paymentConfig, setPaymentConfig] = useState({
    provider: 'PhonePe',
    merchantId: '',
    saltKey: '',
    isLiveMode: false
  });
  const [showPaymentKey, setShowPaymentKey] = useState(false);

  // Delivery Config State
  const [deliveryConfig, setDeliveryConfig] = useState({
    provider: 'Delhivery',
    apiToken: ''
  });
  const [showDeliveryKey, setShowDeliveryKey] = useState(false);

  // Dynamic Config State (Array of key-value pairs)
  const [dynamicConfig, setDynamicConfig] = useState([]);

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await adminService.getConfig();
        if (data.general) setGeneralConfig(data.general);
        if (data.payment) setPaymentConfig(data.payment);
        if (data.delivery) setDeliveryConfig(data.delivery);
        if (data.dynamic) setDynamicConfig(data.dynamic);
      } catch (error) {
        console.error("Failed to load configurations", error);
        // showToast('Failed to connect to configuration server.');
      } finally {
        setIsFetching(false);
      }
    };
    loadConfig();
  }, []);

  // --- ACTION HANDLERS ---
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      await adminService.updateConfig('general', generalConfig);
      showToast('General settings saved successfully.');
    } catch (error) {
      showToast('Failed to save general settings.');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      await adminService.updateConfig('payment', paymentConfig);
      showToast(`${paymentConfig.provider} payment configuration saved.`);
    } catch (error) {
      showToast('Failed to save payment settings.');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleSaveDelivery = async (e) => {
    e.preventDefault();
    setIsSavingDelivery(true);
    try {
      await adminService.updateConfig('delivery', deliveryConfig);
      showToast(`${deliveryConfig.provider} delivery API configuration saved.`);
    } catch (error) {
      showToast('Failed to save delivery settings.');
    } finally {
      setIsSavingDelivery(false);
    }
  };

  // --- DYNAMIC CONFIG HANDLERS ---
  const handleAddDynamicField = () => {
    setDynamicConfig([...dynamicConfig, { key: '', value: '' }]);
  };

  const handleRemoveDynamicField = (index) => {
    setDynamicConfig(dynamicConfig.filter((_, i) => i !== index));
  };

  const handleDynamicChange = (index, field, value) => {
    const newConfig = [...dynamicConfig];
    newConfig[index][field] = value;
    setDynamicConfig(newConfig);
  };

  const handleSaveDynamic = async (e) => {
    e.preventDefault();
    setIsSavingDynamic(true);
    try {
      // Clean up empty keys before saving
      const cleanedConfig = dynamicConfig.filter(item => item.key.trim() !== '');
      await adminService.updateConfig('dynamic', cleanedConfig);
      setDynamicConfig(cleanedConfig);
      showToast('Dynamic variables saved successfully.');
    } catch (error) {
      showToast('Failed to save dynamic variables.');
    } finally {
      setIsSavingDynamic(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="font-medium">Loading system configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 relative">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage store details, API keys, and custom variables.</p>
      </div>

      {/* --- GENERAL SETTINGS CONFIG --- */}
      <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">General Store Settings</h3>
            <p className="text-xs text-slate-500">Public contact info and branding</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Store Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={generalConfig.storeName} onChange={(e) => setGeneralConfig({...generalConfig, storeName: e.target.value})} required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" value={generalConfig.supportEmail} onChange={(e) => setGeneralConfig({...generalConfig, supportEmail: e.target.value})} required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Support Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={generalConfig.supportPhone} onChange={(e) => setGeneralConfig({...generalConfig, supportPhone: e.target.value})} required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSavingGeneral} className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-md disabled:opacity-70">
              {isSavingGeneral ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSavingGeneral ? 'Saving...' : 'Save General Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* --- PAYMENT GATEWAY CONFIG --- */}
      <form onSubmit={handleSavePayment} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Payment Gateway Integrations</h3>
              <p className="text-xs text-slate-500">Manage transaction credentials</p>
            </div>
          </div>

          {/* Test/Live Environment Toggle */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className={`text-xs font-bold ${!paymentConfig.isLiveMode ? 'text-amber-600' : 'text-slate-400'}`}>Test Mode</span>
            <button 
              type="button" 
              onClick={() => setPaymentConfig({...paymentConfig, isLiveMode: !paymentConfig.isLiveMode})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${paymentConfig.isLiveMode ? 'bg-emerald-500' : 'bg-amber-400'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${paymentConfig.isLiveMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-bold ${paymentConfig.isLiveMode ? 'text-emerald-600' : 'text-slate-400'}`}>Live Mode</span>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Primary Provider</label>
            <select 
              value={paymentConfig.provider}
              onChange={(e) => setPaymentConfig({...paymentConfig, provider: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            >
              <option value="PhonePe">PhonePe (UPI & Cards)</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Stripe">Stripe (International)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Merchant ID / Key ID</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" required value={paymentConfig.merchantId} onChange={(e) => setPaymentConfig({...paymentConfig, merchantId: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Salt Key / Secret Key</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type={showPaymentKey ? "text" : "password"} required value={paymentConfig.saltKey} onChange={(e) => setPaymentConfig({...paymentConfig, saltKey: e.target.value})} className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                <button type="button" onClick={() => setShowPaymentKey(!showPaymentKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPaymentKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSavingPayment} className="flex items-center gap-2 bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md disabled:opacity-70">
              {isSavingPayment ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSavingPayment ? 'Saving...' : 'Save Payment Config'}
            </button>
          </div>
        </div>
      </form>

      {/* --- DELIVERY API CONFIG --- */}
      <form onSubmit={handleSaveDelivery} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
            <Truck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Logistics Partner API</h3>
            <p className="text-xs text-slate-500">Automated shipping and tracking</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Logistics Provider</label>
            <select 
              value={deliveryConfig.provider}
              onChange={(e) => setDeliveryConfig({...deliveryConfig, provider: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            >
              <option value="Delhivery">Delhivery</option>
              <option value="Shiprocket">Shiprocket</option>
              <option value="BlueDart">BlueDart API</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">API Token / Secret</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type={showDeliveryKey ? "text" : "password"} required value={deliveryConfig.apiToken} onChange={(e) => setDeliveryConfig({...deliveryConfig, apiToken: e.target.value})} className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
              <button type="button" onClick={() => setShowDeliveryKey(!showDeliveryKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showDeliveryKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">This token allows the system to auto-generate tracking AWBs.</p>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSavingDelivery} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-70">
              {isSavingDelivery ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSavingDelivery ? 'Saving...' : 'Save Delivery Config'}
            </button>
          </div>
        </div>
      </form>

      {/* --- NEW: DYNAMIC CONFIGURATION --- */}
      <form onSubmit={handleSaveDynamic} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-700">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Dynamic Variables</h3>
              <p className="text-xs text-slate-500">Custom key-value pairs for the frontend</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleAddDynamicField}
            className="flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors border border-orange-200"
          >
            <Plus size={16} /> Add Variable
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {dynamicConfig.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No dynamic variables set. Click "Add Variable" to create one.</p>
          ) : (
            dynamicConfig.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative group">
                <div className="w-full sm:w-1/3">
                  <input 
                    type="text" 
                    placeholder="Key (e.g. maintenance_mode)" 
                    value={item.key} 
                    onChange={(e) => handleDynamicChange(index, 'key', e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                  />
                </div>
                <div className="w-full sm:flex-1">
                  <input 
                    type="text" 
                    placeholder="Value (e.g. true)" 
                    value={item.value} 
                    onChange={(e) => handleDynamicChange(index, 'value', e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveDynamicField(index)} 
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Remove Variable"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}

          <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
            <button type="submit" disabled={isSavingDynamic} className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-md disabled:opacity-70">
              {isSavingDynamic ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSavingDynamic ? 'Saving...' : 'Save Dynamic Variables'}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};