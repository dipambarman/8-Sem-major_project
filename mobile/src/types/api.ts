export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  userType: 'regular' | 'premium';
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  isPremium?: boolean;
  walletBalance?: number;
  totalOrders?: number;
  loyaltyPoints?: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  autoReloadEnabled: boolean;
  autoReloadThreshold: number;
  autoReloadAmount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  referenceId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
  isExpress: boolean;
}

export interface Order {
  id: string;
  userId: string;
  vendorId: string;
  orderType: 'delivery' | 'pickup' | 'dine_in';
  paymentMethod: 'wallet' | 'razorpay';
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  slotTime?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

export interface Reservation {
  id: string;
  userId: string;
  vendorId: string;
  reservationTime: string;
  partySize: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
