export interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  productCount?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  categoryId: number | null;
  category: Pick<Category, 'id' | 'name'> | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
}

export interface ShippingDetails {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  notes?: string;
}

// The six delivery fields shared by orders, custom requests and saved addresses
export type AddressFields = Omit<ShippingDetails, 'notes'>;

export interface AddressInput extends AddressFields {
  label: string;
  isDefault?: boolean;
}

export interface Address extends AddressInput {
  id: number;
  isDefault: boolean;
  updatedAt: string;
}

export interface Order extends ShippingDetails {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: 'cod';
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: { id: number; name: string; email: string; phone?: string };
}

export type CustomRequestStatus =
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface CustomRequestInput extends Omit<ShippingDetails, 'notes'> {
  title: string;
  description: string;
  images: string[];
  quantity: number;
  budget: number | null;
  neededBy: string | null;
}

export interface CustomRequest extends CustomRequestInput {
  id: number;
  status: CustomRequestStatus;
  quotedPrice: number | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; name: string; email: string; phone?: string };
}

export interface CustomRequestUpdate {
  status?: CustomRequestStatus;
  quotedPrice?: number;
  adminNote?: string;
}

export interface Profile {
  user: { id: number; name: string; email: string; phone: string; role: UserRole; createdAt: string };
  stats: { orderCount: number; totalSpent: number; customRequestCount: number; wishlistCount: number };
  lastAddress: Omit<ShippingDetails, 'notes'> | null;
  recentOrders: Order[];
  recentCustomRequests: CustomRequest[];
}

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
  revenue: number;
  lowStockProducts: Pick<Product, 'id' | 'name' | 'stock' | 'images'>[];
  recentOrders: Order[];
}

export interface ProductFilters {
  search?: string;
  category?: number | string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  mrp: number | null;
  stock: number;
  images: string[];
  categoryId: number | null;
  isFeatured: boolean;
  isActive: boolean;
}

export interface CategoryInput {
  name: string;
  description: string;
}

export type UserRole = 'customer' | 'admin';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface UsersSummary {
  totalUsers: number;
  admins: number;
  customers: number;
  newThisMonth: number;
}
