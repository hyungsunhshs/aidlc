import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useCart } from '../contexts/CartContext';
import apiClient from '../api/client';
import { Order, ApiError } from '../types';
import { OrderCard } from '../components/OrderCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useSession();
  const { itemCount } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getMyOrders();
      // Sort by createdAt descending (newest first)
      const sortedOrders = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 'SESSION_EXPIRED') {
        setError('세션이 만료되었습니다. 처음부터 다시 시작해주세요.');
      } else {
        setError(apiError.message || '주문 내역을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loadOrders]);

  if (!isAuthenticated) {
    return null;
  }

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  const totalOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/menu')}
              className="text-gray-600"
              data-testid="back-to-menu-button"
            >
              ← 메뉴
            </button>
            <h1 className="text-xl font-bold text-gray-800">주문 내역</h1>
            <button
              onClick={loadOrders}
              className="text-primary-600 text-sm font-medium"
              disabled={isLoading}
            >
              새로고침
            </button>
          </div>
        </div>
      </header>

      {/* Summary Banner */}
      <div className="bg-primary-500 text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-sm">
            테이블 {session?.tableNumber} · 총 {orders.length}건 주문
          </span>
          <span className="font-semibold">
            {totalOrderAmount.toLocaleString('ko-KR')}원
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadOrders} />
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              주문 내역이 없습니다
            </h2>
            <p className="text-gray-500 mb-6">
              맛있는 메뉴를 주문해보세요!
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              메뉴 보러가기
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                  접수 대기 ({pendingOrders.length})
                </h2>
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <OrderCard key={order.orderId} order={order} />
                  ))}
                </div>
              </section>
            )}

            {/* Preparing Orders */}
            {preparingOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                  조리 중 ({preparingOrders.length})
                </h2>
                <div className="space-y-4">
                  {preparingOrders.map((order) => (
                    <OrderCard key={order.orderId} order={order} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  조리 완료 ({completedOrders.length})
                </h2>
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <OrderCard key={order.orderId} order={order} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 divide-x divide-gray-200">
          <button
            onClick={() => navigate('/menu')}
            className="py-4 text-center text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            🍽️ 메뉴
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="py-4 text-center text-gray-700 font-medium hover:bg-gray-50 transition-colors relative"
          >
            🛒 장바구니
            {itemCount > 0 && (
              <span className="absolute top-3 right-1/4 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
