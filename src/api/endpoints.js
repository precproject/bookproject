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
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_UPDATE_ORDER: (orderId) => `/admin/orders/${orderId}/status`,
  ADMIN_DELIVERY: (orderId) => `/admin/orders/${orderId}/transit`,
  ADMIN_USERS: '/admin/users',
  ADMIN_DISCOUNTS: '/admin/discounts',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_REFERRALS: '/admin/referrals',
  ADMIN_TOGGLE_USER: (userId) => `/admin/users/${userId}/toggle-status`,
};