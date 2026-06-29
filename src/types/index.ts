// Типы CRM — полное соответствие prisma/schema.prisma

// ========================
// ENUMS
// ========================

export type CrmRole = 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'LOGIST';

export type OrderStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'SHIPPED'
  | 'DONE'
  | 'CANCELED';

export type ProductType = 'SIMPLE' | 'CONFIGURATOR' | 'REQUEST_QUOTE';

export type PriceType = 'FIXED' | 'QUOTE';

export type FileCategory =
  | 'AVATAR'
  | 'PRODUCT_IMAGE'
  | 'CATEGORY_IMAGE'
  | 'ORDER_DOCUMENT'
  | 'QUOTE_ATTACHMENT'
  | 'BRANDING';

// ========================
// FILE / S3
// ========================

export interface UploadedFile {
  id: string;
  bucketKey: string;
  url: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  fileName: string;

  thumbnailKey?: string;
  cardKey?: string;
  heroKey?: string;

  thumbnailUrl?: string;
  cardUrl?: string;
  heroUrl?: string;

  originalName?: string;
  originalMimeType?: string;
  originalSizeBytes?: number;
  width?: number;
  height?: number;

  createdAt: string;
}

// ========================
// CRM — СОТРУДНИКИ КОМПАНИИ
// ========================

export interface CrmUser {
  id: string;
  email: string;
  name?: string | null;
  role: CrmRole;
  avatar?: UploadedFile | null;
  avatarId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmLoginResponse {
  ok: boolean;
  token?: string;
  user?: CrmUser;
}

// ========================
// MARKET — КЛИЕНТЫ (B2B)
// ========================

export interface MarketUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  avatar?: UploadedFile | null;
  createdAt: string;
  updatedAt: string;
}

// ========================
// CATALOG
// ========================

export interface Category {
  id: string;
  name: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  image?: UploadedFile | null;
  imageId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Characteristic {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: ProductType;
  priceType: PriceType;
  price: number | null;
  characteristics: Characteristic[] | null;
  article: string | null;
  isActive: boolean;
  categoryId: string;
  category: Category;
  images: UploadedFile[];
  attributes: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ========================
// ORDERS (B2B)
// ========================

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
  marketUserId: string;
  marketUser?: MarketUser;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  documents?: UploadedFile[];
  createdAt: string;
  updatedAt: string;
}

// ========================
// QUOTES / КП
// ========================

export interface QuoteRequest {
  id: string;
  marketUserId: string;
  marketUser?: MarketUser;
  productId?: string | null;
  product?: Product | null;
  message?: string | null;
  status: string;
  payload?: Record<string, unknown> | null;
  attachments?: UploadedFile[];
  createdAt: string;
}

// ========================
// CALLBACK
// ========================

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  comment?: string | null;
  status: string;
  createdAt: string;
}

// ========================
// VISITS & EVENTS (аналитика)
// ========================

export type EventType = 'CLICK' | 'QUOTE' | 'ORDER' | 'VIEW';

export interface AppEvent {
  id: string;
  type: EventType;
  path?: string | null;
  productId?: string | null;
  marketUserId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface EventStats {
  total: number;
  byType: { type: string; _count: number }[];
}

// ========================
// ACTIVITY LOG (CRM)
// ========================

export interface ActivityLog {
  id: string;
  crmUserId?: string | null;
  action: string;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

// ========================
// API RESPONSE WRAPPERS
// ========================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ========================
// DASHBOARD
// ========================

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalQuoteRequests: number;
  totalCallbacks: number;
  ordersByStatus: { status: OrderStatus; _count: number }[];
  recentOrders: Order[];
  recentEvents: AppEvent[];
  recentQuoteRequests: QuoteRequest[];
}
