import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useSSE } from '../hooks/useSSE';
import { DashboardSummary, TableWithOrders, SSEEvent } from '../types';
import { OrderSummary } from '../components/dashboard/OrderSummary';
import { TableGrid } from '../components/dashboard/TableGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [tables, setTables] = useState<TableWithOrders[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [summaryData, tablesData] = await Promise.all([
        apiClient.getDashboardSummary(),
        apiClient.getTablesWithOrders(),
      ]);
      setSummary(summaryData);
      setTables(tablesData);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle SSE events for real-time updates
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === 'NEW_ORDER' || event.type === 'ORDER_UPDATED' || event.type === 'ORDER_DELETED') {
      // Mark table as having new order
      setTables((prev) =>
        prev.map((table) =>
          table.id === event.tableId
            ? { ...table, hasNewOrder: event.type === 'NEW_ORDER' }
            : table
        )
      );
      // Reload data to get updated totals
      loadData();
    } else if (event.type === 'SESSION_STARTED' || event.type === 'SESSION_ENDED') {
      loadData();
    }
  }, [loadData]);

  const { isConnected } = useSSE({
    onEvent: handleSSEEvent,
    enabled: true,
  });

  const handleTableClick = (tableId: number) => {
    // Clear new order flag when clicking
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, hasNewOrder: false } : table
      )
    );
    navigate(`/tables/${tableId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
          <p className="text-gray-500">실시간 주문 현황을 확인하세요</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? '실시간 연결됨' : '연결 끊김'}
          </span>
        </div>
      </div>

      {/* Summary */}
      {summary && <OrderSummary summary={summary} />}

      {/* Table Grid */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">테이블 현황</h2>
          <button
            onClick={loadData}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            새로고침
          </button>
        </div>
        <TableGrid tables={tables} onTableClick={handleTableClick} />
      </div>
    </div>
  );
};
