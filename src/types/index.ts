// Типы данных, соответствующие API BROX

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: 'SIMPLE' | 'CONFIGURATOR' | 'REQUEST_QUOTE';
  price: number | null;
  isActive: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  attributes: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'SHIPPED'
  | 'DONE'
  | 'CANCELED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  type: string;
  path: string | null;
  productId: string | null;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface EventStats {
  total: number;
  byType: { type: string; _count: number }[];
}

export interface LoginResponse {
  ok: boolean;
  token?: string;
  user?: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  ordersByStatus: { status: OrderStatus; _count: number }[];
  recentOrders: Order[];
  recentEvents: Event[];
}