import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  StartSessionRequest,
  StartSessionResponse,
  Category,
  Menu,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  ApiError,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private sessionToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.sessionToken) {
        config.headers.Authorization = `Bearer ${this.sessionToken}`;
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
        return Promise.reject(apiError);
      }
    );
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  // Session API
  async startSession(request: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await this.client.post<StartSessionResponse>(
      '/customer/sessions',
      request
    );
    this.setSessionToken(response.data.sessionToken);
    return response.data;
  }

  // Menu API
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>('/customer/categories');
    return response.data;
  }

  async getMenusByCategory(categoryId: number): Promise<Menu[]> {
    const response = await this.client.get<Menu[]>(
      `/customer/categories/${categoryId}/menus`
    );
    return response.data;
  }

  // Order API
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await this.client.post<CreateOrderResponse>(
      '/customer/orders',
      request
    );
    return response.data;
  }

  async getMyOrders(): Promise<Order[]> {
    const response = await this.client.get<Order[]>('/customer/orders');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
