import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PaymentStatus = () => {
  const { orderId } = useParams();
  
  // Read the URL parameters PhonePe sends back to determine success/failure
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code'); // PhonePe appends ?code=PAYMENT_SUCCESS

  const isSuccess = code === 'PAYMENT_SUCCESS';

  useEffect(() => {
    // Optional: Auto-close this tab after 5 seconds if it was opened via window.open
    const timer = setTimeout(() => {
      window.close();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
        
        {isSuccess ? (
          <>
            <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800">Payment Processed!</h2>
            <p className="text-slate-500 mt-4 mb-8">
              Order <strong>#{orderId}</strong> has been processed successfully. Your main window has been updated.
            </p>
          </>
        ) : (
          <>
            <XCircle size={80} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800">Payment Failed</h2>
            <p className="text-slate-500 mt-4 mb-8">
              The payment for order <strong>#{orderId}</strong> was not successful. Please return to your main window to try again.
            </p>
          </>
        )}

        <Button onClick={handleClose} variant="primary" className="w-full py-3 text-lg">
          Close This Tab
        </Button>
      </div>
    </div>
  );
};