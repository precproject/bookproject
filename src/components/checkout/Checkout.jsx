import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowLeft, ShoppingBag, MapPin, 
  CreditCard, CheckCircle2, ShieldCheck, Smartphone
} from 'lucide-react';
import { Button } from '../ui/Button';

// You can use your actual book cover image here
import bookCoverImg from '../../assets/cover.png'; 

export const Checkout = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [address, setAddress] = useState({
    name: '', phone: '', pincode: '', street: '', city: 'Pune', state: 'Maharashtra'
  });

  // Pricing
  const price = 350;
  const shipping = 50;
  const total = price + shipping;

  // Handle Payment Simulation
  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate a 2-second payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4); // Go to success step
    }, 2000);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="w-full h-full max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-2xl md:h-auto md:min-h-[600px] md:rounded-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-4">
            {step > 1 && step < 4 && (
              <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              {step === 1 && "Order Summary"}
              {step === 2 && "Delivery Address"}
              {step === 3 && "Payment"}
              {step === 4 && "Order Confirmed"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar (Hidden on Success step) */}
        {step < 4 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between relative">
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
            
            {[
              { num: 1, icon: ShoppingBag, label: "Cart" },
              { num: 2, icon: MapPin, label: "Address" },
              { num: 3, icon: CreditCard, label: "Payment" }
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  step >= s.num 
                    ? 'bg-orange-600 border-orange-600 text-white' 
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-xs font-medium ${step >= s.num ? 'text-orange-600 dark:text-orange-500' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-900/50">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ORDER SUMMARY */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex gap-6 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <img src={bookCoverImg} alt="Book" className="w-24 h-36 object-cover rounded-lg shadow-md" />
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Hardcopy</span>
                    <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">चिंतामुक्ती (Chintamukti)</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Author: Santosh Kulkarni</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-4">₹{price}</p>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Price Details</h4>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Book Price</span>
                    <span>₹{price}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Delivery Charges</span>
                    <span>₹{shipping}</span>
                  </div>
                  <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-2" />
                  <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                    <span>Total Amount</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                
                <Button variant="primary" className="w-full text-lg py-4" onClick={nextStep}>
                  Proceed to Address
                </Button>
              </motion.div>
            )}

            {/* STEP 2: DELIVERY ADDRESS */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input type="text" placeholder="e.g. Rahul Patil" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
                    <input type="tel" placeholder="+91" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Detailed Address (House No, Building, Street)</label>
                    <textarea rows="3" placeholder="Enter your full address here..." className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pincode</label>
                    <input type="text" placeholder="e.g. 411004" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                    <input type="text" defaultValue="Pune" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="primary" className="w-full text-lg py-4" onClick={nextStep}>
                    Proceed to Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT (PHONEPE) */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                
                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 py-3 rounded-lg">
                  <ShieldCheck size={20} />
                  <span className="font-medium text-sm">100% Secure Payments</span>
                </div>

                <div className="bg-white dark:bg-slate-800 border-2 border-[#5f259f] rounded-2xl overflow-hidden shadow-md relative">
                   {/* PhonePe Header */}
                   <div className="bg-[#5f259f] text-white p-4 flex items-center gap-3">
                     <Smartphone size={24} />
                     <span className="font-bold text-lg tracking-wide">PhonePe</span>
                   </div>
                   
                   <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-4">
                     <p className="text-slate-600 dark:text-slate-300">Pay securely using your PhonePe app.</p>
                     <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₹{total}</h2>
                     
                     {/* Fake UPI Input */}
                     <div className="w-full max-w-sm pt-4">
                        <label className="text-sm text-slate-500 text-left block mb-2">Enter UPI ID (e.g., number@ybl)</label>
                        <input type="text" placeholder="yournumber@ybl" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5f259f] outline-none transition-all text-center" />
                     </div>
                   </div>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="w-full bg-[#5f259f] hover:bg-[#4a1c7d] text-white font-bold text-lg py-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#5f259f]/30"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    "Pay ₹" + total
                  )}
                </button>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-10 space-y-6">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle2 size={50} />
                </motion.div>
                
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Order Confirmed!</h2>
                <p className="text-slate-600 dark:text-slate-300 max-w-md">
                  Thank you for your purchase. Your book <span className="font-bold">चिंतामुक्ती (Chintamukti)</span> is being packed and will be shipped soon.
                </p>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm mt-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Order ID</div>
                  <div className="font-mono font-bold text-lg text-slate-900 dark:text-white tracking-wider">#BK-{Math.floor(100000 + Math.random() * 900000)}</div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Estimated Delivery</div>
                  <div className="font-bold text-slate-900 dark:text-white">3-5 Business Days</div>
                </div>

                <Button variant="primary" className="w-full max-w-sm mt-6" onClick={onClose}>
                  Return to Home
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};