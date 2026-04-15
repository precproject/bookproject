import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Truck, Key, Save, CheckCircle, Eye, EyeOff, 
  Globe, Mail, Phone, Store, Loader2, LayoutTemplate, 
  ShoppingCart, Receipt, MapPin, Hash, Package, Link as LinkIcon,
  Facebook, Twitter, Instagram, Linkedin, Youtube
} from 'lucide-react';
import { adminService } from '../../api/service/adminService';
import { useToast } from '../../context/ToastContext';

// ============================================================================
// REUSABLE UI SUB-COMPONENTS
// ============================================================================

const ConfigSection = ({ title, subtitle, icon: Icon, iconColor, btnColor, onSave, isSaving, children, headerRight }) => (
  <form onSubmit={onSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {headerRight}
    </div>
    <div className="p-6">
      {children}
      <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
        <button type="submit" disabled={isSaving} className={`flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-70 ${btnColor}`}>
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  </form>
);

const InputField = ({ label, icon: Icon, type = "text", isSecret = false, ...props }) => {
  const [show, setShow] = useState(false);
  const inputType = isSecret && !show ? "password" : type;

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />}
        <input 
          type={inputType} 
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${isSecret ? 'pr-12' : 'pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all`} 
          {...props} 
        />
        {isSecret && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

const ToggleSwitch = ({ label, checked, onChange, activeColor = "bg-emerald-500" }) => (
  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${checked ? activeColor : 'bg-slate-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

// ============================================================================
// MAIN DASHBOARD CONFIG COMPONENT
// ============================================================================

export const DashboardConfig = () => {
  const [isFetching, setIsFetching] = useState(true);
  const [savingSection, setSavingSection] = useState(null);

  const { showToast } = useToast(); // 2. Destructure showToast

  const [config, setConfig] = useState({
    general: { storeName: '', supportEmail: '', supportPhone: '', businessAddress: '' },
    sections: { hero: true, features: true, chapters: true, author: true, reviews: true, blog: true, footer: true },
    shoppingRules: { isPrebookActive: true, referralBasedShoppingOnly: true, currency: 'INR', currencySymbol: '₹' },
    taxConfig: { isGstEnabled: true, gstPercentage: 0, hsnCode: '4901' },
    payment: { provider: 'PhonePe', merchantId: '', saltKey: '', saltIndex: 1, isLiveMode: false },
    delivery: { 
      provider: 'Delhivery', apiToken: '', pickupPincode: '', isLiveMode: false, shippingCharge: 50,
      pickupLocationName: '', originPincode: '', originCity: '', originState: '', defaultWeightGrams: 500,
      returnAddress: { name: '', address: '', pincode: '', city: '', state: '' }
    },
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
    emailAlerts: { welcome: true, orderPlaced: true, paymentSuccess: true, orderDispatched: true, orderDelivered: true, paymentReminder: true },
    uiConfig: { showRecentOrdersPopup: true }
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await adminService.getConfig();
        setConfig(prev => ({
          ...prev,
          ...data,
          general: { ...prev.general, ...data.general },
          sections: { ...prev.sections, ...data.sections },
          shoppingRules: { ...prev.shoppingRules, ...data.shoppingRules },
          taxConfig: { ...prev.taxConfig, ...data.taxConfig },
          payment: { ...prev.payment, ...data.payment },
          delivery: { 
            ...prev.delivery, 
            ...data.delivery,
            returnAddress: { ...prev.delivery.returnAddress, ...(data.delivery?.returnAddress || {}) }
          },
          socialLinks: { ...prev.socialLinks, ...data.socialLinks },
          emailAlerts: { ...prev.emailAlerts, ...data.emailAlerts },
          uiConfig: { ...prev.uiConfig, ...data.uiConfig }
        }));
      } catch (error) {
        showToast('Failed to connect to configuration server.');
      } finally {
        setIsFetching(false);
      }
    };
    loadConfig();
  }, []);

  const handleUpdate = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: { 
        ...prev[section], 
        // Allow functional updates for deeply nested objects (like returnAddress)
        [field]: typeof value === 'function' ? value(prev[section][field]) : value 
      }
    }));
  };

  const handleSave = async (e, sectionKey, successMsg) => {
    e.preventDefault();
    setSavingSection(sectionKey);
    try {
      await adminService.updateConfig(sectionKey, { [sectionKey]: config[sectionKey] });
      showToast(successMsg);
    } catch (error) {
      showToast(`Failed to save ${sectionKey} settings.`);
    } finally {
      setSavingSection(null);
    }
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
    <div className="max-w-5xl mx-auto space-y-6 pb-10 relative">
      
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage global settings, API integrations, and feature flags.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN */}
        {/* ================================================================= */}
        <div className="space-y-6">
          
          <ConfigSection 
            title="General Store Settings" subtitle="Public contact info and branding"
            icon={Globe} iconColor="bg-purple-100 text-purple-700" btnColor="bg-purple-700 hover:bg-purple-800"
            isSaving={savingSection === 'general'} onSave={(e) => handleSave(e, 'general', 'General settings saved.')}
          >
            <div className="space-y-4">
              {/* CRITICAL FIX: Added || '' to prevent React Uncontrolled Component Warnings */}
              <InputField label="Store Name" icon={Store} value={config.general.storeName || ''} onChange={e => handleUpdate('general', 'storeName', e.target.value)} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Support Email" icon={Mail} type="email" value={config.general.supportEmail || ''} onChange={e => handleUpdate('general', 'supportEmail', e.target.value)} required />
                <InputField label="Support Phone" icon={Phone} value={config.general.supportPhone || ''} onChange={e => handleUpdate('general', 'supportPhone', e.target.value)} required />
              </div>
              <InputField label="Business Address" icon={MapPin} value={config.general.businessAddress || ''} onChange={e => handleUpdate('general', 'businessAddress', e.target.value)} />
            </div>
          </ConfigSection>

          <ConfigSection 
            title="Sales & Funnel Rules" subtitle="Control how users buy your products"
            icon={ShoppingCart} iconColor="bg-rose-100 text-rose-700" btnColor="bg-rose-600 hover:bg-rose-700"
            isSaving={savingSection === 'shoppingRules'} onSave={(e) => handleSave(e, 'shoppingRules', 'Shopping rules updated.')}
          >
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                <ToggleSwitch 
                  label="Enable 'Pre-book' Lead Capture Phase" 
                  checked={config.shoppingRules.isPrebookActive} 
                  onChange={() => handleUpdate('shoppingRules', 'isPrebookActive', !config.shoppingRules.isPrebookActive)} 
                  activeColor="bg-orange-500" 
                />
                <p className="text-xs text-orange-700 mt-2 font-medium">Turn this OFF on launch day to replace the Pre-book button with 'Add to Cart'.</p>
              </div>

              <ToggleSwitch 
                label="Require Referral Code to Buy" 
                checked={config.shoppingRules.referralBasedShoppingOnly} 
                onChange={() => handleUpdate('shoppingRules', 'referralBasedShoppingOnly', !config.shoppingRules.referralBasedShoppingOnly)} 
                activeColor="bg-rose-500" 
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Currency Code" value={config.shoppingRules.currency || ''} onChange={e => handleUpdate('shoppingRules', 'currency', e.target.value)} />
                <InputField label="Currency Symbol" value={config.shoppingRules.currencySymbol || ''} onChange={e => handleUpdate('shoppingRules', 'currencySymbol', e.target.value)} />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection 
            title="Payment Gateway" subtitle="Manage transaction credentials"
            icon={CreditCard} iconColor="bg-emerald-100 text-emerald-700" btnColor="bg-emerald-700 hover:bg-emerald-800"
            isSaving={savingSection === 'payment'} onSave={(e) => handleSave(e, 'payment', 'Payment settings saved.')}
            headerRight={
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <span className={`text-xs font-bold ${!config.payment.isLiveMode ? 'text-amber-600' : 'text-slate-400'}`}>Test</span>
                <button type="button" onClick={() => handleUpdate('payment', 'isLiveMode', !config.payment.isLiveMode)} className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors duration-300 ${config.payment.isLiveMode ? 'bg-emerald-500' : 'bg-amber-400'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${config.payment.isLiveMode ? 'translate-x-6' : 'translate-x-1.5'}`} />
                </button>
                <span className={`text-xs font-bold ${config.payment.isLiveMode ? 'text-emerald-600' : 'text-slate-400'}`}>Live</span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Provider</label>
                <select value={config.payment.provider || 'PhonePe'} onChange={e => handleUpdate('payment', 'provider', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="PhonePe">PhonePe (UPI & Cards)</option>
                  <option value="Razorpay">Razorpay</option>
                </select>
              </div>
              <InputField label="Merchant ID" icon={Key} value={config.payment.merchantId || ''} onChange={e => handleUpdate('payment', 'merchantId', e.target.value)} />
              <InputField label="Salt Key / Secret" icon={Key} isSecret={true} value={config.payment.saltKey || ''} onChange={e => handleUpdate('payment', 'saltKey', e.target.value)} />
              <InputField label="Salt Index" icon={Hash} type="number" value={config.payment.saltIndex || 1} onChange={e => handleUpdate('payment', 'saltIndex', e.target.value)} />
            </div>
          </ConfigSection>

          <ConfigSection 
            title="Automated Emails" subtitle="Turn specific customer email alerts on or off"
            icon={Mail} iconColor="bg-sky-100 text-sky-700" btnColor="bg-sky-600 hover:bg-sky-700"
            isSaving={savingSection === 'emailAlerts'} onSave={(e) => handleSave(e, 'emailAlerts', 'Email settings saved.')}
          >
            <div className="flex flex-col gap-3">
              {[
                { key: 'welcome', label: 'Welcome Email', desc: 'Sent when a user registers or pre-books.' },
                { key: 'orderPlaced', label: 'Order Placed', desc: 'Sent before payment is completed.' },
                { key: 'paymentSuccess', label: 'Payment Success', desc: 'Sent with receipt after payment.' },
                { key: 'orderDispatched', label: 'Order Dispatched', desc: 'Sent with Delhivery tracking ID.' },
                { key: 'orderDelivered', label: 'Order Delivered', desc: 'Sent to ask for a review.' }
              ].map((alert) => (
                <div key={alert.key} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{alert.label}</p>
                    <p className="text-xs text-slate-500">{alert.desc}</p>
                  </div>
                  <button type="button" onClick={() => handleUpdate('emailAlerts', alert.key, !config.emailAlerts[alert.key])} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${config.emailAlerts[alert.key] ? 'bg-sky-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.emailAlerts[alert.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </ConfigSection>

        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN */}
        {/* ================================================================= */}
        <div className="space-y-6">

          <ConfigSection 
            title="Landing Page Sections" subtitle="Hide or show specific blocks"
            icon={LayoutTemplate} iconColor="bg-indigo-100 text-indigo-700" btnColor="bg-indigo-600 hover:bg-indigo-700"
            isSaving={savingSection === 'sections'} onSave={(e) => handleSave(e, 'sections', 'Section visibility updated.')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(config.sections).map(key => (
                <ToggleSwitch 
                  key={key} 
                  label={key.charAt(0).toUpperCase() + key.slice(1)} 
                  checked={config.sections[key]} 
                  onChange={() => handleUpdate('sections', key, !config.sections[key])} 
                  activeColor="bg-indigo-500" 
                />
              ))}
            </div>
          </ConfigSection>

          <ConfigSection 
            title="Tax Settings (GST)" subtitle="Configure pricing and compliance"
            icon={Receipt} iconColor="bg-orange-100 text-orange-700" btnColor="bg-orange-600 hover:bg-orange-700"
            isSaving={savingSection === 'taxConfig'} onSave={(e) => handleSave(e, 'taxConfig', 'Tax configuration updated.')}
          >
            <div className="space-y-4">
              <ToggleSwitch 
                label="Enable GST Calculations" 
                checked={config.taxConfig.isGstEnabled} 
                onChange={() => handleUpdate('taxConfig', 'isGstEnabled', !config.taxConfig.isGstEnabled)} 
                activeColor="bg-orange-500" 
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="GST %" type="number" value={config.taxConfig.gstPercentage || 0} onChange={e => handleUpdate('taxConfig', 'gstPercentage', Number(e.target.value))} disabled={!config.taxConfig.isGstEnabled} />
                <InputField label="HSN Code" value={config.taxConfig.hsnCode || ''} onChange={e => handleUpdate('taxConfig', 'hsnCode', e.target.value)} />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection 
            title="Logistics & Delivery" subtitle="Automated shipping via Delhivery"
            icon={Truck} iconColor="bg-blue-100 text-blue-700" btnColor="bg-blue-600 hover:bg-blue-700"
            isSaving={savingSection === 'delivery'} onSave={(e) => handleSave(e, 'delivery', 'Delivery config saved.')}
            headerRight={
               <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                 <span className={`text-xs font-bold ${!config.delivery.isLiveMode ? 'text-amber-600' : 'text-slate-400'}`}>Test</span>
                 <button type="button" onClick={() => handleUpdate('delivery', 'isLiveMode', !config.delivery.isLiveMode)} className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors duration-300 ${config.delivery.isLiveMode ? 'bg-blue-500' : 'bg-amber-400'}`}>
                   <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${config.delivery.isLiveMode ? 'translate-x-6' : 'translate-x-1.5'}`} />
                 </button>
                 <span className={`text-xs font-bold ${config.delivery.isLiveMode ? 'text-blue-600' : 'text-slate-400'}`}>Live</span>
               </div>
            }
          >
            <div className="space-y-6">
              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">API Credentials</h4>
                <InputField label="Delhivery API Token" icon={Key} isSecret={true} value={config.delivery.apiToken || ''} onChange={e => handleUpdate('delivery', 'apiToken', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Flat Ship Charge (₹)" type="number" value={config.delivery.shippingCharge ?? 50} onChange={e => handleUpdate('delivery', 'shippingCharge', Number(e.target.value))} />
                  <InputField label="Default Weight (g)" type="number" value={config.delivery.defaultWeightGrams ?? 500} onChange={e => handleUpdate('delivery', 'defaultWeightGrams', Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Warehouse Details</h4>
                <InputField label="Registered Pickup Location Name" icon={Package} value={config.delivery.pickupLocationName || ''} onChange={e => handleUpdate('delivery', 'pickupLocationName', e.target.value)} placeholder="e.g., Mumbai_Warehouse" />
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="Pincode" value={config.delivery.originPincode || ''} onChange={e => handleUpdate('delivery', 'originPincode', e.target.value)} />
                  <InputField label="City" value={config.delivery.originCity || ''} onChange={e => handleUpdate('delivery', 'originCity', e.target.value)} />
                  <InputField label="State" value={config.delivery.originState || ''} onChange={e => handleUpdate('delivery', 'originState', e.target.value)} />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Return Address (RTO)</h4>
                {/* CRITICAL FIX: Safe nested functional state update */}
                <InputField label="Return Contact Name" value={config.delivery.returnAddress?.name || ''} onChange={e => handleUpdate('delivery', 'returnAddress', (prev) => ({ ...prev, name: e.target.value }))} />
                <InputField label="Full Street Address" value={config.delivery.returnAddress?.address || ''} onChange={e => handleUpdate('delivery', 'returnAddress', (prev) => ({ ...prev, address: e.target.value }))} />
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="Pincode" value={config.delivery.returnAddress?.pincode || ''} onChange={e => handleUpdate('delivery', 'returnAddress', (prev) => ({ ...prev, pincode: e.target.value }))} />
                  <InputField label="City" value={config.delivery.returnAddress?.city || ''} onChange={e => handleUpdate('delivery', 'returnAddress', (prev) => ({ ...prev, city: e.target.value }))} />
                  <InputField label="State" value={config.delivery.returnAddress?.state || ''} onChange={e => handleUpdate('delivery', 'returnAddress', (prev) => ({ ...prev, state: e.target.value }))} />
                </div>
              </div>
            </div>
          </ConfigSection>

          {/* CRITICAL FIX: THE MISSING SOCIAL LINKS SECTION */}
          <ConfigSection 
            title="Social Media Links" subtitle="Connect your footer to your socials"
            icon={LinkIcon} iconColor="bg-fuchsia-100 text-fuchsia-700" btnColor="bg-fuchsia-600 hover:bg-fuchsia-700"
            isSaving={savingSection === 'socialLinks'} onSave={(e) => handleSave(e, 'socialLinks', 'Social links updated.')}
          >
            <div className="space-y-4">
              <InputField label="Facebook URL" icon={Facebook} value={config.socialLinks.facebook || ''} onChange={e => handleUpdate('socialLinks', 'facebook', e.target.value)} placeholder="https://facebook.com/..." />
              <InputField label="Twitter (X) URL" icon={Twitter} value={config.socialLinks.twitter || ''} onChange={e => handleUpdate('socialLinks', 'twitter', e.target.value)} placeholder="https://twitter.com/..." />
              <InputField label="Instagram URL" icon={Instagram} value={config.socialLinks.instagram || ''} onChange={e => handleUpdate('socialLinks', 'instagram', e.target.value)} placeholder="https://instagram.com/..." />
              <InputField label="LinkedIn URL" icon={Linkedin} value={config.socialLinks.linkedin || ''} onChange={e => handleUpdate('socialLinks', 'linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
              <InputField label="YouTube URL" icon={Youtube} value={config.socialLinks.youtube || ''} onChange={e => handleUpdate('socialLinks', 'youtube', e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </ConfigSection>

        </div>
      </div>
    </div>
  );
};