import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next'; 

export const PaymentStatus = () => {
  const { orderId } = useParams();
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  
  const [isPopup, setIsPopup] = useState(false);
  
  // Read the URL parameters PhonePe sends back to determine success/failure
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code'); // PhonePe appends ?code=PAYMENT_SUCCESS

  const isSuccess = code === 'PAYMENT_SUCCESS';

  useEffect(() => {
    // Check if this window was opened by another tab/window
    if (window.opener) {
      setIsPopup(true);
    }

    // Optional: Auto-close this tab after 5 seconds ONLY if it's a popup
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = () => {
    if (window.opener) {
      // It was opened in a new tab -> close it
      window.close();
    } else {
      // It was opened in the same tab -> go back in history
      // If history length is very small (e.g. user pasted the link directly), safely fallback to homepage
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
        
        {isSuccess ? (
          <>
            <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800">
              {t('paymentStatus.successTitle', 'Payment Processed!')}
            </h2>
            <p className="text-slate-500 mt-4 mb-8">
              {t('paymentStatus.successMsg1', 'Order ')}<strong>#{orderId}</strong>{t('paymentStatus.successMsg2', ' has been processed successfully. Your main window has been updated.')}
            </p>
          </>
        ) : (
          <>
            <XCircle size={80} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800">
              {t('paymentStatus.failedTitle', 'Payment Failed')}
            </h2>
            <p className="text-slate-500 mt-4 mb-8">
              {t('paymentStatus.failedMsg1', 'The payment for order ')}<strong>#{orderId}</strong>{t('paymentStatus.failedMsg2', ' was not successful. Please return to your main window to try again.')}
            </p>
          </>
        )}

        <Button onClick={handleAction} variant="primary" className="w-full py-3 text-lg">
          {/* Dynamically show "Close Tab" OR "Go Back" based on window state */}
          {isPopup ? t('paymentStatus.closeTab', 'Close This Tab') : t('paymentStatus.goBack', 'Go Back')}
        </Button>
      </div>
    </div>
  );
};