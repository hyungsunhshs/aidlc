import React from 'react';
import { Order } from '../types';

interface OrderCardProps {
  order: Order;
}

const statusLabels: Record<Order['status'], { text: string; color: string }> = {
  PENDING: { text: '접수 대기', color: 'bg-yellow-100 text-yellow-800' },
  PREPARING: { text: '준비 중', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { text: '완료', color: 'bg-green-100 text-green-800' },
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const status = statusLabels[order.status];

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-4"
      data-testid={`order-card-${order.orderId}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-sm text-gray-500">주문번호</span>
          <p className="font-mono font-semibold">{order.orderNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>
      <div className="border-t border-gray-100 pt-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span className="text-gray-700">
              {item.menuName} × {item.quantity}
            </span>
            <span className="text-gray-900">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
        <span className="text-sm text-gray-500">{formatTime(order.createdAt)}</span>
        <span className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</span>
      </div>
    </div>
  );
};
