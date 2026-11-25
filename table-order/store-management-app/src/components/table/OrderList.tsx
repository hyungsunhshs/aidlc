import React from 'react';
import { Order, OrderStatus } from '../../types';
import { OrderItem } from './OrderItem';

interface OrderListProps {
  orders: Order[];
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  onDelete: (orderId: number) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onStatusChange,
  onDelete,
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">📋</div>
        <p>주문 내역이 없습니다</p>
      </div>
    );
  }

  // Group orders by status
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  return (
    <div className="space-y-6" data-testid="order-list">
      {pendingOrders.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            대기중 ({pendingOrders.length})
          </h3>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}

      {preparingOrders.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            준비중 ({preparingOrders.length})
          </h3>
          <div className="space-y-3">
            {preparingOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}

      {completedOrders.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            완료 ({completedOrders.length})
          </h3>
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
