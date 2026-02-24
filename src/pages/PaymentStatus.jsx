import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { orderService } from '../api/service/orderService';

export const PaymentStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // States: 'polling', 'success', 'failed', 'timeout'
  const [status, setStatus] = useState('polling'); 

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 6; // 6 attempts * 5 seconds = 30 seconds max

    const checkStatus = async () => {
      attempts++;
      try {
        const data = await orderService.verifyPayment(orderId);
        
        if (data.paymentStatus === 'Success') {
          setStatus('success');
          return true; // Stop polling
        } else if (data.paymentStatus === 'Failed') {
          setStatus('failed');
          return true; // Stop polling
        }
      } catch (error) {
        console.error('Verification error:', error);
      }

      if (attempts >= maxAttempts) {
        setStatus('timeout');
        // Auto-redirect to dashboard after showing the timeout message for 4 seconds
        setTimeout(() => navigate('/dashboard'), 4000);
        return true; 
      }
      return false; // Continue polling
    };

    // Run immediately once, then set interval
    checkStatus().then((stop) => {
      if (!stop) {
        const interval = setInterval(async () => {
          const shouldStop = await checkStatus();
          if (shouldStop) clearInterval(interval);
        }, 5000);
        return () => clearInterval(interval);
      }
    });
  }, [orderId, navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 mt-16">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
        
        {/* POLLING STATE */}
        {status === 'polling' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <Loader2 size={60} className="text-orange-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">Verifying Payment...</h2>
            <p className="text-slate-500 mt-2">Please do not close or refresh this page. We are securely communicating with the bank.</p>
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="flex flex-col items-center">
            <CheckCircle size={80} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-800">Payment Successful!</h2>
            <p className="text-slate-500 mt-2">Your order #{orderId} has been placed successfully. A confirmation email is on its way.</p>
            <Button onClick={() => navigate('/dashboard')} variant="primary" className="mt-8 px-8 py-3">
              View Order Dashboard
            </Button>
          </motion.div>
        )}

        {/* FAILED STATE */}
        {status === 'failed' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="flex flex-col items-center">
            <XCircle size={80} className="text-red-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-800">Payment Failed</h2>
            <p className="text-slate-500 mt-2">Unfortunately, the payment for order #{orderId} was declined or cancelled.</p>
            <div className="flex gap-4 mt-8 w-full">
              <Button onClick={() => navigate('/checkout')} className="flex-1 bg-slate-200 text-slate-800">Try Again</Button>
              <Button onClick={() => navigate('/dashboard')} variant="primary" className="flex-1">Go to Dashboard</Button>
            </div>
          </motion.div>
        )}

        {/* TIMEOUT STATE */}
        {status === 'timeout' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <Clock size={70} className="text-orange-400 mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">Taking longer than usual...</h2>
            <p className="text-slate-500 mt-2">We haven't received the final status from the bank yet. Don't worry, your order is saved.</p>
            <p className="text-sm font-bold text-slate-400 mt-6">Redirecting to your dashboard...</p>
          </motion.div>
        )}

      </div>
    </div>
  );
};