import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next'; 

export const PaymentStatus = () => {
  const { orderId } = useParams();
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  
  // Initialize synchronously to avoid double-renders
  const [isPopup] = useState(!!window.opener);
  
  // Read the URL parameters PhonePe sends back to determine success/failure
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code'); 

  const isSuccess = code === 'PAYMENT_SUCCESS';

  useEffect(() => {
    // If it's a popup, notify the parent window of the result instantly
    if (isPopup) {
      window.opener.postMessage({
        type: 'PAYMENT_CALLBACK',
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        orderId: orderId
      }, window.location.origin);
    }

    // Auto-close this tab after 5 seconds ONLY if it's a popup
    const timer = setTimeout(() => {
      if (isPopup) {
        window.close();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isPopup, isSuccess, orderId]);

  const handleAction = () => {
    if (isPopup) {
      window.close();
    } else {
      // Avoid navigate(-1) due to unpredictable gateway redirect chains.
      // Send them to a safe, deterministic route.
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center">
        
        {isSuccess ? (
          <>
            <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              {t('paymentStatus.successTitle', 'Payment Processed!')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8">
              {t('paymentStatus.successMsg1', 'Order ')}
              <strong className="text-slate-700 dark:text-slate-300">#{orderId}</strong>
              {t('paymentStatus.successMsg2', ' has been processed successfully. Your main window has been updated.')}
            </p>
          </>
        ) : (
          <>
            <XCircle size={80} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              {t('paymentStatus.failedTitle', 'Payment Failed')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8">
              {t('paymentStatus.failedMsg1', 'The payment for order ')}
              <strong className="text-slate-700 dark:text-slate-300">#{orderId}</strong>
              {t('paymentStatus.failedMsg2', ' was not successful. Please return to your main window to try again.')}
            </p>
          </>
        )}

        <Button onClick={handleAction} variant="primary" className="w-full py-3 text-lg">
          {isPopup ? t('paymentStatus.closeTab', 'Close This Tab') : t('paymentStatus.goBack', 'Go to Dashboard')}
        </Button>
      </div>
    </div>
  );
};