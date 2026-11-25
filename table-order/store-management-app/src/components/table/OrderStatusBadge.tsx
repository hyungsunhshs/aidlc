import React from 'react';
import { OrderStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const statusConfig = {
    PENDING: {
      label: '대기중',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      icon: '⏳',
    },
    PREPARING: {
      label: '준비중',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      icon: '🍳',
    },
    COMPLETED: {
      label: '완료',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      icon: '✓',
    },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClass}`}
      data-testid={`order-status-${status.toLowerCase()}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};
