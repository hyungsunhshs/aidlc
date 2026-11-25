// Session Types
export interface StartSessionRequest {
  storeIdentifier: string;
  tableNumber: string;
  password: string;
}

export interface StartSessionResponse {
  sessionId: number;
  tableNumber: string;
  sessionToken: string;
  expiresAt: string;
}

// Menu Types
export interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isAvailable: boolean;
}

export interface MenuDetail extends Menu {
  categoryId: number;
  categoryName: string;
}

// Cart Types
export interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

// Order Types
export interface OrderItemRequest {
  menuId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
}

export interface CreateOrderResponse {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  menuId: number | null;
  menuName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  orderNumber: string;
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}
