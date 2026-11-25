import React from 'react';
import { DashboardSummary } from '../../types';

interface OrderSummaryProps {
  summary: DashboardSummary;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ summary }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const stats = [
    {
      label: '전체 테이블',
      value: summary.totalTables,
      unit: '개',
      icon: '🪑',
      color: 'bg-gray-100',
    },
    {
      label: '이용중 테이블',
      value: summary.activeTables,
      unit: '개',
      icon: '👥',
      color: 'bg-green-100',
    },
    {
      label: '대기중 주문',
      value: summary.pendingOrders,
      unit: '건',
      icon: '⏳',
      color: 'bg-yellow-100',
    },
    {
      label: '준비중 주문',
      value: summary.preparingOrders,
      unit: '건',
      icon: '🍳',
      color: 'bg-blue-100',
    },
    {
      label: '오늘 주문',
      value: summary.todayOrderCount,
      unit: '건',
      icon: '📋',
      color: 'bg-purple-100',
    },
    {
      label: '오늘 매출',
      value: formatPrice(summary.todayRevenue),
      unit: '',
      icon: '💰',
      color: 'bg-primary-100',
      isLarge: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="order-summary">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`card p-4 ${stat.color}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{stat.icon}</span>
            <span className="text-sm text-gray-600">{stat.label}</span>
          </div>
          <div className={`font-bold ${stat.isLarge ? 'text-xl text-primary-600' : 'text-2xl text-gray-800'}`}>
            {stat.value}
            {stat.unit && <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
