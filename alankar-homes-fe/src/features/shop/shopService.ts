import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import type {
  Address,
  AddressInput,
  AdminUser,
  Category,
  CategoryInput,
  CustomRequest,
  CustomRequestInput,
  CustomRequestStatus,
  CustomRequestUpdate,
  DashboardStats,
  Order,
  OrderStatus,
  Pagination,
  Profile,
  Product,
  ProductFilters,
  ProductInput,
  ShippingDetails,
  UserRole,
  UsersSummary,
} from './shopTypes';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const unwrap = async <T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
  const response = await request;
  return response.data.data;
};

// Storefront
export const fetchProducts = (filters: ProductFilters = {}) =>
  unwrap<{ products: Product[]; pagination: Pagination }>(api.get(API_ENDPOINTS.PRODUCTS, { params: filters }));

export const fetchProduct = (id: number | string) =>
  unwrap<Product>(api.get(`${API_ENDPOINTS.PRODUCTS}/${id}`));

export const fetchCategories = () => unwrap<Category[]>(api.get(API_ENDPOINTS.CATEGORIES));

// Customer orders
export const placeOrder = (payload: ShippingDetails & { items: { productId: number; quantity: number }[] }) =>
  unwrap<Order>(api.post(API_ENDPOINTS.ORDERS, payload));

export const fetchMyOrders = () => unwrap<Order[]>(api.get(`${API_ENDPOINTS.ORDERS}/my`));

export const fetchOrder = (id: number | string) => unwrap<Order>(api.get(`${API_ENDPOINTS.ORDERS}/${id}`));

export const cancelOrder = (id: number) => unwrap<Order>(api.post(`${API_ENDPOINTS.ORDERS}/${id}/cancel`));

// Profile
export const fetchProfile = () => unwrap<Profile>(api.get(API_ENDPOINTS.PROFILE));

export const updateProfile = (data: { name: string; phone: string }) =>
  api.put<{ message: string; data: Profile['user'] }>(API_ENDPOINTS.PROFILE, data).then((response) => response.data);

export const changePassword = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
  api.put<{ message: string }>(`${API_ENDPOINTS.PROFILE}/password`, data).then((response) => response.data);

// Saved addresses
export const fetchAddresses = () => unwrap<Address[]>(api.get(API_ENDPOINTS.ADDRESSES));

export const createAddress = (data: AddressInput) => unwrap<Address>(api.post(API_ENDPOINTS.ADDRESSES, data));

export const updateAddress = (id: number, data: AddressInput) =>
  unwrap<Address>(api.put(`${API_ENDPOINTS.ADDRESSES}/${id}`, data));

export const setDefaultAddress = (id: number) => unwrap<Address>(api.post(`${API_ENDPOINTS.ADDRESSES}/${id}/default`));

export const deleteAddress = (id: number) => api.delete(`${API_ENDPOINTS.ADDRESSES}/${id}`);

// Wishlist
export const fetchWishlist = () => unwrap<Product[]>(api.get(API_ENDPOINTS.WISHLIST));

export const addToWishlistApi = (productId: number) => api.post(`${API_ENDPOINTS.WISHLIST}/${productId}`);

export const removeFromWishlistApi = (productId: number) => api.delete(`${API_ENDPOINTS.WISHLIST}/${productId}`);

// Custom (made-to-order) requests
export const uploadReferenceImages = (files: File[]) => postImages(`${API_ENDPOINTS.CUSTOM_REQUESTS}/uploads`, files);

export const submitCustomRequest = (data: CustomRequestInput) =>
  unwrap<CustomRequest>(api.post(API_ENDPOINTS.CUSTOM_REQUESTS, data));

export const fetchMyCustomRequests = () => unwrap<CustomRequest[]>(api.get(`${API_ENDPOINTS.CUSTOM_REQUESTS}/my`));

export const fetchCustomRequest = (id: number | string) =>
  unwrap<CustomRequest>(api.get(`${API_ENDPOINTS.CUSTOM_REQUESTS}/${id}`));

export const acceptCustomQuote = (id: number) =>
  unwrap<CustomRequest>(api.post(`${API_ENDPOINTS.CUSTOM_REQUESTS}/${id}/accept`));

export const cancelCustomRequest = (id: number) =>
  unwrap<CustomRequest>(api.post(`${API_ENDPOINTS.CUSTOM_REQUESTS}/${id}/cancel`));

// Admin
export const fetchStats = () => unwrap<DashboardStats>(api.get(`${API_ENDPOINTS.ADMIN}/stats`));

export const adminFetchProducts = (filters: ProductFilters = {}) =>
  unwrap<{ products: Product[]; pagination: Pagination }>(api.get(`${API_ENDPOINTS.ADMIN}/products`, { params: filters }));

export const adminFetchProduct = (id: number | string) =>
  unwrap<Product>(api.get(`${API_ENDPOINTS.ADMIN}/products/${id}`));

export const createProduct = (data: ProductInput) =>
  unwrap<Product>(api.post(`${API_ENDPOINTS.ADMIN}/products`, data));

export const updateProduct = (id: number, data: Partial<ProductInput>) =>
  unwrap<Product>(api.put(`${API_ENDPOINTS.ADMIN}/products/${id}`, data));

export const deleteProduct = (id: number) => api.delete(`${API_ENDPOINTS.ADMIN}/products/${id}`);

const postImages = (url: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  // Overrides the client's JSON default, which would make axios serialise the FormData as JSON
  return unwrap<string[]>(api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
};

export const uploadImages = (files: File[]) => postImages(`${API_ENDPOINTS.ADMIN}/uploads`, files);

export const createCategory = (data: CategoryInput) =>
  unwrap<Category>(api.post(`${API_ENDPOINTS.ADMIN}/categories`, data));

export const updateCategory = (id: number, data: CategoryInput) =>
  unwrap<Category>(api.put(`${API_ENDPOINTS.ADMIN}/categories/${id}`, data));

export const deleteCategory = (id: number) => api.delete(`${API_ENDPOINTS.ADMIN}/categories/${id}`);

export const adminFetchOrders = (params: { status?: OrderStatus | ''; page?: number } = {}) =>
  unwrap<{ orders: Order[]; pagination: Pagination }>(api.get(`${API_ENDPOINTS.ADMIN}/orders`, { params }));

export const updateOrderStatus = (id: number, status: OrderStatus) =>
  unwrap<Order>(api.patch(`${API_ENDPOINTS.ADMIN}/orders/${id}/status`, { status }));

export const adminFetchUsers = (params: { search?: string; role?: UserRole | ''; page?: number } = {}) =>
  unwrap<{ users: AdminUser[]; summary: UsersSummary; pagination: Pagination }>(
    api.get(`${API_ENDPOINTS.ADMIN}/users`, { params })
  );

export const updateUserRole = (id: number, role: UserRole) =>
  api.patch<{ message: string; data: Pick<AdminUser, 'id' | 'role'> }>(`${API_ENDPOINTS.ADMIN}/users/${id}/role`, { role })
    .then((response) => response.data);

export const adminFetchCustomRequests = (params: { status?: CustomRequestStatus | ''; page?: number } = {}) =>
  unwrap<{ requests: CustomRequest[]; pagination: Pagination }>(api.get(`${API_ENDPOINTS.ADMIN}/custom-requests`, { params }));

export const adminUpdateCustomRequest = (id: number, data: CustomRequestUpdate) =>
  unwrap<CustomRequest>(api.patch(`${API_ENDPOINTS.ADMIN}/custom-requests/${id}`, data));
