// Auth Types
export interface LoginRequest {
  storeIdentifier: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  admin: AdminInfo;
}

export interface AdminInfo {
  id: number;
  username: string;
  storeId: number;
  storeName: string;
}

// Store Types
export interface Store {
  id: number;
  identifier: string;
  name: string;
  createdAt: string;
}

// Table Types
export interface StoreTable {
  id: number;
  tableNumber: string;
  currentSessionId: number | null;
  createdAt: string;
}

export interface TableWithOrders extends StoreTable {
  totalOrderAmount: number;
  orderCount: number;
  latestOrderTime: string | null;
  hasNewOrder: boolean;
}

export interface CreateTableRequest {
  tableNumber: string;
  password: string;
}

export interface UpdateTableRequest {
  tableNumber?: string;
  password?: string;
}

// Session Types
export interface TableSession {
  id: number;
  tableId: number;
  tableNumber: string;
  status: 'ACTIVE' | 'EXPIRED';
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  menuCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  displayOrder?: number;
}

// Menu Types
export interface Menu {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isAvailable: boolean;
}

export interface CreateMenuRequest {
  categoryId: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface UpdateMenuRequest {
  categoryId?: number;
  name?: string;
  price?: number;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder?: number;
  isAvailable?: boolean;
}

// Order Types
export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

export interface OrderItem {
  id: number;
  menuId: number | null;
  menuName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  tableNumber: string;
  sessionId: number;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// Order History Types
export interface OrderHistory {
  id: number;
  orderNumber: string;
  tableNumber: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  completedAt: string | null;
}

// Dashboard Types
export interface DashboardSummary {
  totalTables: number;
  activeTables: number;
  pendingOrders: number;
  preparingOrders: number;
  todayRevenue: number;
  todayOrderCount: number;
}

// SSE Event Types
export interface SSEOrderEvent {
  type: 'NEW_ORDER' | 'ORDER_UPDATED' | 'ORDER_DELETED';
  tableId: number;
  tableNumber: string;
  order: Order;
}

export interface SSESessionEvent {
  type: 'SESSION_STARTED' | 'SESSION_ENDED';
  tableId: number;
  tableNumber: string;
  sessionId: number;
}

export type SSEEvent = SSEOrderEvent | SSESessionEvent;

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}

// Pagination Types
export interface PageRequest {
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
