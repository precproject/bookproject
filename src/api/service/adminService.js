import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export const adminService = {
  // Get overall store statistics
  getDashboardStats: async () => {
    const response = await apiClient.get(ENDPOINTS.ADMIN_STATS);
    return response.data;
  },

  // Now accepts an object of query parameters
  getOrdersPaginated: async (params) => {
    // params = { page: 1, limit: 20, search: 'Rahul', status: 'Success', sort: 'newest' }
    const response = await apiClient.get(ENDPOINTS.ADMIN_ORDERS, { params });
    return response.data; // Expecting backend to return: { orders: [...], totalItems: 100, totalPages: 5 }
  },
  
  // Get all orders (with optional status filters)
  getAllOrders: async (status = '') => {
    const url = status ? `${ENDPOINTS.ADMIN_ORDERS}?status=${status}` : ENDPOINTS.ADMIN_ORDERS;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Update order status (e.g., 'Pending' -> 'In Progress')
  updateOrderStatus: async (orderId, newStatus) => {
    const response = await apiClient.put(ENDPOINTS.ADMIN_UPDATE_ORDER(orderId), { status: newStatus });
    return response.data;
  },

  // Update tracking information
  addTransitUpdate: async (orderId, trackingData) => {
    const response = await apiClient.post(ENDPOINTS.ADMIN_DELIVERY(orderId), trackingData);
    return response.data;
  },

  // Fetch paginated users
  getUsersPaginated: async (params) => {
    // params = { page, limit, search }
    const response = await apiClient.get(ENDPOINTS.ADMIN_USERS, { params });
    return response.data; // Expects { users: [...], totalItems, totalPages }
  },

  // Toggle User Status (Active <-> Disabled)
  toggleUserStatus: async (userId) => {
    const response = await apiClient.put(ENDPOINTS.ADMIN_TOGGLE_USER(userId));
    return response.data;
  },

  // Get orders specifically for a single user (for the modal)
  getUserOrders: async (userId) => {
    // You can hit your orders endpoint and filter by user ID
    const response = await apiClient.get(`${ENDPOINTS.ADMIN_ORDERS}?userId=${userId}`);
    return response.data; 
  },

  getReferralsPaginated: async (params) => {
    // params = { page, limit, search, sort }
    const response = await apiClient.get('/admin/referrals', { params });
    // Expects: { referrals: [], stats: { totalEarned, totalPending }, totalItems, totalPages }
    return response.data; 
  },

  createReferral: async (data) => {
    const response = await apiClient.post('/admin/referrals', data);
    return response.data;
  },

  updateReferral: async (id, data) => {
    const response = await apiClient.put(`/admin/referrals/${id}`, data);
    return response.data;
  },

  getReferralTransactions: async (id) => {
    const response = await apiClient.get(`/admin/referrals/${id}/transactions`);
    return response.data;
  },

  markTransactionPaid: async (transactionId) => {
    const response = await apiClient.put(`/admin/referrals/transactions/${transactionId}/pay`);
    return response.data;
  },

  getDiscounts: async (params) => {
    // params = { search }
    // Note: Discounts are usually a small list, so full pagination isn't strictly necessary, 
    // but passing 'search' allows the backend to filter.
    const response = await apiClient.get(ENDPOINTS.ADMIN_DISCOUNTS, { params });
    return response.data; // Expects an array of discount objects
  },

  createDiscount: async (data) => {
    const response = await apiClient.post(ENDPOINTS.ADMIN_DISCOUNTS, data);
    return response.data;
  },

  updateDiscount: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.ADMIN_DISCOUNTS}/${id}`, data);
    return response.data;
  },

  deleteDiscount: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.ADMIN_DISCOUNTS}/${id}`);
    return response.data;
  },

  getInventory: async (params) => {
    // params = { search }
    const response = await apiClient.get(ENDPOINTS.ADMIN_INVENTORY, { params });
    return response.data; // Expects an array of inventory objects
  },

  addInventory: async (data) => {
    const response = await apiClient.post(ENDPOINTS.ADMIN_INVENTORY, data);
    return response.data;
  },

  updateInventory: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.ADMIN_INVENTORY}/${id}`, data);
    return response.data;
  },

  deleteInventory: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.ADMIN_INVENTORY}/${id}`);
    return response.data;
  },

  // Fetch all configurations at once
  getConfig: async () => {
    const response = await apiClient.get('/admin/config');
    return response.data; // Expects { general: {}, payment: {}, delivery: {}, dynamic: [] }
  },

  // Update a specific configuration section (to avoid overwriting everything at once)
  updateConfig: async (section, data) => {
    // section can be 'general', 'payment', 'delivery', or 'dynamic'
    const response = await apiClient.put(`/admin/config/${section}`, data);
    return response.data;
  }
};