import React, { useState } from 'react';
import { CreateTableRequest, StoreTable, UpdateTableRequest } from '../../types';

interface TableFormProps {
  table?: StoreTable;
  onSubmit: (data: CreateTableRequest | UpdateTableRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TableForm: React.FC<TableFormProps> = ({
  table,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [tableNumber, setTableNumber] = useState(table?.tableNumber || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!table;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tableNumber.trim()) {
      newErrors.tableNumber = '테이블 번호를 입력해주세요';
    }

    if (!isEditing && !password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    if (password && password.length < 4) {
      newErrors.password = '비밀번호는 4자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateTableRequest | UpdateTableRequest = {
      tableNumber: tableNumber.trim(),
      ...(password && { password: password.trim() }),
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="table-form">
      <div>
        <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-2">
          테이블 번호 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="tableNumber"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="예: A1, 1번, VIP1"
          className={`input ${errors.tableNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
          disabled={isLoading}
          data-testid="table-number-input"
        />
        {errors.tableNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.tableNumber}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          테이블 비밀번호 {!isEditing && <span className="text-red-500">*</span>}
          {isEditing && <span className="text-gray-400 text-xs ml-2">(변경 시에만 입력)</span>}
        </label>
        <input
          type="text"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditing ? '변경할 비밀번호 입력' : '고객이 입력할 비밀번호'}
          className={`input ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
          disabled={isLoading}
          data-testid="table-password-input"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          고객이 테이블에서 주문을 시작할 때 사용하는 비밀번호입니다
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 btn-secondary"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn-primary"
          data-testid="table-form-submit"
        >
          {isLoading ? '저장 중...' : isEditing ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
};
