export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    REFRESH: '/api/auth/refresh',
  },
  WALLET: {
    GET: '/api/wallet',
    TOPUP: '/api/wallet/topup',
    TRANSACTIONS: '/api/wallet/transactions',
    AUTO_RELOAD: '/api/wallet/auto-reload',
  },
  ORDERS: {
    CREATE: '/api/orders',
    GET: '/api/orders',
    GET_BY_ID: '/api/orders/:id',
    CANCEL: '/api/orders/:id/cancel',
  },
  MENU: {
    GET: '/api/menu',
    SEARCH: '/api/menu/search',
    FEATURED: '/api/menu/featured',
  },
};

export const WALLET_TIERS = {
  STARTER: {
    amount: 199,
    bonus: 15,
    benefits: ['1 express slot', '₹15 bonus'],
  },
  PLUS: {
    amount: 399,
    bonus: 35,
    benefits: ['2 express slots', '₹35 bonus', '1 free add-on'],
  },
  POWER: {
    amount: 699,
    bonus: 70,
    benefits: ['4 express slots', '₹70 bonus', '1 free delivery/month'],
  },
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
