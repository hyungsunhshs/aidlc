import React from 'react';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderItemProps {
  order: Order;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  onDelete: (orderId: number) => void;
}

export const OrderItem: React.FC<OrderItemProps> = ({
  order,
  onStatusChange,
  onDelete,
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const getNextStatus = (): OrderStatus | null => {
    switch (order.status) {
      case 'PENDING':
        return 'PREPARING';
      case 'PREPARING':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (): string => {
    switch (order.status) {
      case 'PENDING':
        return '준비 시작';
      case 'PREPARING':
        return '완료 처리';
      default:
        return '';
    }
  };

  const nextStatus = getNextStatus();

  return (
    <div
      className="card p-4"
      data-testid={`order-item-${order.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-800">#{order.orderNumber}</span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
        <span className="text-sm text-gray-500">{formatTime(order.createdAt)}</span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.menuName} × {item.quantity}
            </span>
            <span className="text-gray-600">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="font-bold text-primary-600 text-lg">
          {formatPrice(order.totalAmount)}
        </span>
        <div className="flex gap-2">
          {order.status !== 'COMPLETED' && (
            <button
              onClick={() => onDelete(order.id)}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              data-testid={`delete-order-${order.id}`}
            >
              삭제
            </button>
          )}
          {nextStatus && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              className="px-4 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              data-testid={`change-status-${order.id}`}
            >
              {getNextStatusLabel()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
