import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export const orderService = {
  getMyOrders: async () => {
    const response = await apiClient.get(ENDPOINTS.MY_ORDERS);
    return response.data;
  },
  
  checkout: async (orderData) => {
    const response = await apiClient.post(ENDPOINTS.CHECKOUT, orderData);
    return response.data;
  },

  verifyPayment: async (orderId) => {
    const response = await apiClient.get(ENDPOINTS.VERIFY_PAYMENT(orderId));
    return response.data;
  },

  retryPayment: async (orderId) => {
    const response = await apiClient.get(ENDPOINTS.RETRY_PAYMENT(orderId));
    return response.data;
  }
};