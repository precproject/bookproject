export const ENDPOINTS = {
  // Auth & Users
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  MY_REFERRAL: '/auth/my-referral',

  // Orders & Cart
  CHECKOUT: '/orders/checkout',
  MY_ORDERS: '/orders/myorders',
  VERIFY_PAYMENT: (orderId) => `/orders/verify-payment/${orderId}`,
  RETRY_PAYMENT: (orderId) => `/orders/retry-payment/${orderId}`,

  // Admin
  ADMIN_STATS: '/admin/dashboard/stats',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_TOGGLE_USER: (userId) => `/admin/users/${userId}/toggle-status`,
};