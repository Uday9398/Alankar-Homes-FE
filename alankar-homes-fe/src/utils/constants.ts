export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  ORDER_DETAILS: '/orders/:id',
  CUSTOM_ORDERS: '/custom-orders',
  NEW_CUSTOM_ORDER: '/custom-orders/new',
  CUSTOM_ORDER_DETAILS: '/custom-orders/:id',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_NEW_PRODUCT: '/admin/products/new',
  ADMIN_EDIT_PRODUCT: '/admin/products/:id/edit',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOM_ORDERS: '/admin/custom-orders',
  ADMIN_USERS: '/admin/users',
};

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  ME: '/me',
  PROFILE: '/users/profile',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  CUSTOM_REQUESTS: '/custom-requests',
  ADDRESSES: '/addresses',
  ADMIN: '/admin',
};

export const STORAGE_KEYS = {
  TOKEN: 'alankar_auth_token',
  USER: 'alankar_user',
  CART: 'alankar_cart',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  confirmed: 'bg-sky-900/40 text-sky-300 border-sky-700/50',
  shipped: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50',
  delivered: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  cancelled: 'bg-red-950/50 text-red-300 border-red-800/50',
};

export const CUSTOM_STATUS_LABELS: Record<string, string> = {
  pending: 'Request received',
  quoted: 'Price shared',
  accepted: 'Price accepted',
  in_progress: 'Being made',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const CUSTOM_STATUS_STYLES: Record<string, string> = {
  pending: ORDER_STATUS_STYLES.pending,
  quoted: 'bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-700/50',
  accepted: ORDER_STATUS_STYLES.confirmed,
  in_progress: 'bg-teal-900/40 text-teal-300 border-teal-700/50',
  shipped: ORDER_STATUS_STYLES.shipped,
  delivered: ORDER_STATUS_STYLES.delivered,
  cancelled: ORDER_STATUS_STYLES.cancelled,
};
