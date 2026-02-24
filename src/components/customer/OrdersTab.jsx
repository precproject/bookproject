import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { downloadInvoice } from '../../utils/generateInvoice'; // The script we created earlier

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (orderId) => {
    try {
      const { data } = await apiClient.get(`/orders/retry-payment/${orderId}`);
      if (data.paymentPayload && data.paymentPayload.redirectUrl) {
        // Redirect to PhonePe
        window.location.href = data.paymentPayload.redirectUrl;
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to initiate payment retry.');
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (orders.length === 0) return <div>You haven't placed any orders yet.</div>;

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order._id} className="border rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4">
          
          {/* Left: Details */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-800">Order #{order.orderId}</h3>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                order.status === 'Success' ? 'bg-green-100 text-green-800' :
                order.status === 'Pending Payment' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
              }`}>
                {order.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-700">Items:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {order.items.map(item => (
                  <li key={item._id}>{item.name} (x{item.qty})</li>
                ))}
              </ul>
            </div>

            {order.shipping.trackingId && (
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
                <span className="font-semibold">Tracking ({order.shipping.partner}): </span> 
                {order.shipping.trackingId}
                <br/>
                <span className="text-xs">Latest Update: {order.transitHistory[order.transitHistory.length - 1]?.stage}</span>
              </div>
            )}
          </div>

          {/* Right: Actions & Totals */}
          <div className="md:w-64 bg-gray-50 p-4 rounded flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-sm mb-1 text-gray-600">
                <span>Subtotal:</span> <span>₹{order.priceBreakup.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm mb-1 text-gray-600">
                <span>Shipping:</span> <span>₹{order.priceBreakup.shipping}</span>
              </div>
              {order.priceBreakup.discountAmount < 0 && (
                <div className="flex justify-between text-sm mb-2 text-green-600">
                  <span>Discount:</span> <span>₹{order.priceBreakup.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span> <span>₹{order.priceBreakup.total}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {order.status === 'Pending Payment' ? (
                <button 
                  onClick={() => handleRetryPayment(order.orderId)}
                  className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition font-medium"
                >
                  Pay Now
                </button>
              ) : order.payment.status === 'Success' ? (
                <button 
                  onClick={() => downloadInvoice(order)}
                  className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition font-medium text-sm flex justify-center items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Invoice
                </button>
              ) : null}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default OrdersTab;