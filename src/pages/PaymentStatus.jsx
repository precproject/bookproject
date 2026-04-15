import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next'; 
import { orderService } from '../api/service/orderService'; 

export const PaymentStatus = () => {
  const { orderId } = useParams();
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  
  const [isPopup] = useState(!!window.opener);
  
  // UI States: 'verifying', 'success', 'failed', 'timeout'
  const [status, setStatus] = useState('verifying');
  
  // 3 Minute Countdown (180 seconds)
  const [timeLeft, setTimeLeft] = useState(180);
  const isPolling = useRef(false); // Prevents overlapping API calls

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (status !== 'verifying') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('timeout');
          notifyParent('TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // --- POLLING LOGIC ---
  useEffect(() => {
    let isMounted = true;
    let pollInterval;

    const checkStatusSecurely = async () => {
      if (status !== 'verifying' || isPolling.current) return;
      isPolling.current = true;

      try {
        // Force the backend to check the exact status with PhonePe
        const data = await orderService.verifyPayment(orderId);
        const paymentCode = data.code || data.paymentStatus;
        
        if (paymentCode === 'COMPLETED' || paymentCode === 'PAYMENT_SUCCESS' || paymentCode === 'Success') {
          if (isMounted) setStatus('success');
          notifyParent('SUCCESS');
        } else if (paymentCode === 'FAILED' || paymentCode === 'PAYMENT_ERROR' || paymentCode === 'Failed') {
          if (isMounted) setStatus('failed');
          notifyParent('FAILED');
        }
        // If it's still PENDING, we do nothing and let the next poll cycle handle it.

      } catch (error) {
        console.error("Secure payment verification failed:", error);
        // We don't automatically fail on a single network error, we keep trying until timeout
      } finally {
        isPolling.current = false;
      }
    };

    if (status === 'verifying') {
      // Check immediately, then every 4 seconds
      checkStatusSecurely();
      pollInterval = setInterval(checkStatusSecurely, 4000);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId, status]);

  // --- AUTO-CLOSE POPUP ---
  useEffect(() => {
    if (isPopup && status !== 'verifying') {
      const closeTimer = setTimeout(() => window.close(), 5000);
      return () => clearTimeout(closeTimer);
    }
  }, [isPopup, status]);

  // --- HELPER FUNCTION ---
  const notifyParent = (finalStatus) => {
    if (isPopup && window.opener) {
      window.opener.postMessage({
        type: 'PAYMENT_CALLBACK',
        status: finalStatus,
        orderId: orderId
      }, window.location.origin);
    }
  };

  const handleAction = () => {
    if (isPopup) {
      window.close();
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center">
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-8 animate-[fadeIn_0.3s_ease-out]">
            <Loader2 size={60} className="text-orange-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {t('paymentStatus.verifyingTitle', 'Verifying Payment')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 mb-6 leading-relaxed">
              {t('paymentStatus.verifyingMsg', 'Please do not press back or close this window. We are securely waiting for bank confirmation.')}
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-mono text-xl font-bold py-2 px-6 rounded-xl border border-orange-100 dark:border-orange-800">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-[scaleIn_0.3s_ease-out]">
            <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              {t('paymentStatus.successTitle', 'Payment Successful!')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8">
              {t('paymentStatus.successMsg1', 'Order ')}
              <strong className="text-slate-700 dark:text-slate-300">#{orderId}</strong>
              {t('paymentStatus.successMsg2', ' has been processed. You can now close this window.')}
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="animate-[scaleIn_0.3s_ease-out]">
            <XCircle size={80} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              {t('paymentStatus.failedTitle', 'Payment Failed')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8">
              {t('paymentStatus.failedMsg1', 'The payment for order ')}
              <strong className="text-slate-700 dark:text-slate-300">#{orderId}</strong>
              {t('paymentStatus.failedMsg2', ' was declined by the bank. Please try again.')}
            </p>
          </div>
        )}

        {status === 'timeout' && (
          <div className="animate-[scaleIn_0.3s_ease-out]">
            <Clock size={80} className="text-amber-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {t('paymentStatus.timeoutTitle', 'Taking Longer Than Usual')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8 leading-relaxed">
              {t('paymentStatus.timeoutMsg', 'We haven\'t received confirmation from the bank yet. If money was deducted, it is safe and your order will be updated automatically in a few minutes.')}
            </p>
          </div>
        )}

        {status !== 'verifying' && (
          <Button onClick={handleAction} variant="primary" className="w-full py-3 text-lg">
            {isPopup ? t('paymentStatus.closeTab', 'Close This Window') : t('paymentStatus.goBack', 'Go to Dashboard')}
          </Button>
        )}
      </div>
    </div>
  );
};