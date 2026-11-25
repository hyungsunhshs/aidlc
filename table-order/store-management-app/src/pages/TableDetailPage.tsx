import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { StoreTable, Order, OrderStatus, OrderHistory, ApiError } from '../types';
import { OrderList } from '../components/table/OrderList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast, ToastContainer } from '../components/common/Toast';

export const TableDetailPage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [table, setTable] = useState<StoreTable | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    if (!tableId) return;

    try {
      const [tableData, ordersData] = await Promise.all([
        apiClient.getTable(Number(tableId)),
        apiClient.getTableOrders(Number(tableId)),
      ]);
      setTable(tableData);
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [tableId]);

  const loadHistory = useCallback(async () => {
    if (!tableId) return;

    try {
      const historyData = await apiClient.getTableOrderHistory(Number(tableId));
      setHistory(historyData);
    } catch (err) {
      toast.error('주문 이력을 불러오는데 실패했습니다.');
    }
  }, [tableId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'history' && history.length === 0) {
      loadHistory();
    }
  }, [activeTab, history.length, loadHistory]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      await apiClient.updateOrderStatus(orderId, { status });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      toast.success('주문 상태가 변경되었습니다.');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;

    setIsProcessing(true);
    try {
      await apiClient.deleteOrder(deleteOrderId);
      setOrders((prev) => prev.filter((order) => order.id !== deleteOrderId));
      toast.success('주문이 삭제되었습니다.');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '주문 삭제에 실패했습니다.');
    } finally {
      setIsProcessing(false);
      setDeleteOrderId(null);
    }
  };

  const handleEndSession = async () => {
    if (!tableId) return;

    setIsProcessing(true);
    try {
      await apiClient.endTableSession(Number(tableId));
      toast.success('테이블 이용이 완료되었습니다.');
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '이용 완료 처리에 실패했습니다.');
    } finally {
      setIsProcessing(false);
      setShowEndSessionModal(false);
    }
  };

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="p-6">
        <ErrorMessage message={error || '테이블을 찾을 수 없습니다.'} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 돌아가기
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              테이블 {table.tableNumber}
            </h1>
            <p className="text-gray-500">
              {table.currentSessionId ? '이용중' : '비어있음'}
            </p>
          </div>
        </div>
        {table.currentSessionId && (
          <button
            onClick={() => setShowEndSessionModal(true)}
            className="btn-danger"
          >
            이용 완료
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">총 주문 수</p>
            <p className="text-2xl font-bold text-gray-800">{orders.length}건</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">대기중</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === 'PENDING').length}건
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">준비중</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.status === 'PREPARING').length}건
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">총 금액</p>
            <p className="text-2xl font-bold text-primary-600">
              {totalAmount.toLocaleString('ko-KR')}원
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'current'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              현재 주문
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'history'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              과거 내역
            </button>
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'current' ? (
            <OrderList
              orders={orders}
              onStatusChange={handleStatusChange}
              onDelete={(id) => setDeleteOrderId(id)}
            />
          ) : (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  과거 주문 내역이 없습니다
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="card p-4 bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">#{item.orderNumber}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.items.map((i) => i.menuName).join(', ')}
                    </div>
                    <div className="mt-2 text-right font-bold text-primary-600">
                      {item.totalAmount.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Order Modal */}
      <ConfirmModal
        isOpen={deleteOrderId !== null}
        title="주문 삭제"
        message="이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        confirmVariant="danger"
        isLoading={isProcessing}
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteOrderId(null)}
      />

      {/* End Session Modal */}
      <ConfirmModal
        isOpen={showEndSessionModal}
        title="이용 완료"
        message="테이블 이용을 완료하시겠습니까? 현재 세션의 주문이 과거 이력으로 이동되고 테이블이 초기화됩니다."
        confirmText="이용 완료"
        confirmVariant="danger"
        isLoading={isProcessing}
        onConfirm={handleEndSession}
        onCancel={() => setShowEndSessionModal(false)}
      />

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  );
};
