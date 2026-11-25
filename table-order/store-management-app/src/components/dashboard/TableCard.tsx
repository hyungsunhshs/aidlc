import React from 'react';
import { TableWithOrders } from '../../types';

interface TableCardProps {
  table: TableWithOrders;
  onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const isActive = table.currentSessionId !== null;

  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left w-full hover:shadow-md transition-shadow ${
        table.hasNewOrder ? 'ring-2 ring-primary-500 animate-pulse' : ''
      }`}
      data-testid={`table-card-${table.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">
          테이블 {table.tableNumber}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isActive ? '이용중' : '비어있음'}
        </span>
      </div>

      {isActive ? (
        <>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">주문 수</span>
              <span className="font-medium">{table.orderCount}건</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">총 금액</span>
              <span className="font-bold text-primary-600">
                {formatPrice(table.totalOrderAmount)}
              </span>
            </div>
            {table.latestOrderTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">최근 주문</span>
                <span className="text-gray-700">{formatTime(table.latestOrderTime)}</span>
              </div>
            )}
          </div>
          {table.hasNewOrder && (
            <div className="mt-3 py-2 bg-primary-50 text-primary-600 text-sm font-medium text-center rounded-lg">
              🔔 새 주문 있음
            </div>
          )}
        </>
      ) : (
        <div className="py-4 text-center text-gray-400 text-sm">
          고객 대기 중
        </div>
      )}
    </button>
  );
};
