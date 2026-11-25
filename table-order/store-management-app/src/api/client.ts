import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  StoreTable,
  TableWithOrders,
  CreateTableRequest,
  UpdateTableRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Menu,
  CreateMenuRequest,
  UpdateMenuRequest,
  Order,
  UpdateOrderStatusRequest,
  OrderHistory,
  DashboardSummary,
  ApiError,
  Store,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const apiError = error.response?.data || {
          code: 'UNKNOWN_ERROR',
          message: '알 수 없는 오류가 발생했습니다.',
          timestamp: new Date().toISOString(),
        };

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }

        return Promise.reject(apiError);
      }
    );
  }

  setToken(token: string | null) {
    this.accessToken = token;
  }

  clearToken() {
    this.accessToken = null;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  // ==================== Auth API ====================

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/admin/auth/login', request);
    this.setToken(response.data.accessToken);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/admin/auth/logout');
    this.clearToken();
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/admin/auth/refresh');
    this.setToken(response.data.accessToken);
    return response.data;
  }

  // ==================== Store API ====================

  async getStore(): Promise<Store> {
    const response = await this.client.get<Store>('/admin/store');
    return response.data;
  }

  async updateStore(data: Partial<Store>): Promise<Store> {
    const response = await this.client.put<Store>('/admin/store', data);
    return response.data;
  }

  // ==================== Dashboard API ====================

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await this.client.get<DashboardSummary>('/admin/dashboard/summary');
    return response.data;
  }

  async getTablesWithOrders(): Promise<TableWithOrders[]> {
    const response = await this.client.get<TableWithOrders[]>('/admin/dashboard/tables');
    return response.data;
  }

  // ==================== Table API ====================

  async getTables(): Promise<StoreTable[]> {
    const response = await this.client.get<StoreTable[]>('/admin/tables');
    return response.data;
  }

  async getTable(tableId: number): Promise<StoreTable> {
    const response = await this.client.get<StoreTable>(`/admin/tables/${tableId}`);
    return response.data;
  }

  async createTable(request: CreateTableRequest): Promise<StoreTable> {
    const response = await this.client.post<StoreTable>('/admin/tables', request);
    return response.data;
  }

  async updateTable(tableId: number, request: UpdateTableRequest): Promise<StoreTable> {
    const response = await this.client.put<StoreTable>(`/admin/tables/${tableId}`, request);
    return response.data;
  }

  async deleteTable(tableId: number): Promise<void> {
    await this.client.delete(`/admin/tables/${tableId}`);
  }

  async endTableSession(tableId: number): Promise<void> {
    await this.client.post(`/admin/tables/${tableId}/end-session`);
  }

  // ==================== Order API ====================

  async getTableOrders(tableId: number): Promise<Order[]> {
    const response = await this.client.get<Order[]>(`/admin/tables/${tableId}/orders`);
    return response.data;
  }

  async updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Promise<Order> {
    const response = await this.client.put<Order>(`/admin/orders/${orderId}/status`, request);
    return response.data;
  }

  async deleteOrder(orderId: number): Promise<void> {
    await this.client.delete(`/admin/orders/${orderId}`);
  }

  async getTableOrderHistory(
    tableId: number,
    startDate?: string,
    endDate?: string
  ): Promise<OrderHistory[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await this.client.get<OrderHistory[]>(
      `/admin/tables/${tableId}/orders/history?${params.toString()}`
    );
    return response.data;
  }

  // ==================== Category API ====================

  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>('/admin/categories');
    return response.data;
  }

  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const response = await this.client.post<Category>('/admin/categories', request);
    return response.data;
  }

  async updateCategory(categoryId: number, request: UpdateCategoryRequest): Promise<Category> {
    const response = await this.client.put<Category>(`/admin/categories/${categoryId}`, request);
    return response.data;
  }

  async deleteCategory(categoryId: number): Promise<void> {
    await this.client.delete(`/admin/categories/${categoryId}`);
  }

  async reorderCategories(categoryIds: number[]): Promise<void> {
    await this.client.put('/admin/categories/reorder', { categoryIds });
  }

  // ==================== Menu API ====================

  async getMenus(categoryId?: number): Promise<Menu[]> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await this.client.get<Menu[]>(`/admin/menus${params}`);
    return response.data;
  }

  async getMenu(menuId: number): Promise<Menu> {
    const response = await this.client.get<Menu>(`/admin/menus/${menuId}`);
    return response.data;
  }

  async createMenu(request: CreateMenuRequest): Promise<Menu> {
    const response = await this.client.post<Menu>('/admin/menus', request);
    return response.data;
  }

  async updateMenu(menuId: number, request: UpdateMenuRequest): Promise<Menu> {
    const response = await this.client.put<Menu>(`/admin/menus/${menuId}`, request);
    return response.data;
  }

  async deleteMenu(menuId: number): Promise<void> {
    await this.client.delete(`/admin/menus/${menuId}`);
  }

  async reorderMenus(categoryId: number, menuIds: number[]): Promise<void> {
    await this.client.put(`/admin/categories/${categoryId}/menus/reorder`, { menuIds });
  }

  async toggleMenuAvailability(menuId: number): Promise<Menu> {
    const response = await this.client.post<Menu>(`/admin/menus/${menuId}/toggle-availability`);
    return response.data;
  }

  // ==================== SSE Connection ====================

  getSSEUrl(): string {
    return `${API_BASE_URL}/admin/sse/orders?token=${this.accessToken}`;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
