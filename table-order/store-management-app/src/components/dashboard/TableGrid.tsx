import React from 'react';
import { TableWithOrders } from '../../types';
import { TableCard } from './TableCard';

interface TableGridProps {
  tables: TableWithOrders[];
  onTableClick: (tableId: number) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({ tables, onTableClick }) => {
  if (tables.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🪑</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">등록된 테이블이 없습니다</h3>
        <p className="text-gray-500">테이블 관리에서 테이블을 추가해주세요.</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      data-testid="table-grid"
    >
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onTableClick(table.id)}
        />
      ))}
    </div>
  );
};
