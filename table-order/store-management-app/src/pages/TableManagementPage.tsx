import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { StoreTable, CreateTableRequest, UpdateTableRequest, ApiError } from '../types';
import { TableForm } from '../components/table/TableForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast, ToastContainer } from '../components/common/Toast';

export const TableManagementPage: React.FC = () => {
  const toast = useToast();

  const [tables, setTables] = useState<StoreTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<StoreTable | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteTableId, setDeleteTableId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTables = useCallback(async () => {
    try {
      const data = await apiClient.getTables();
      setTables(data);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '테이블 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleSubmit = async (data: CreateTableRequest | UpdateTableRequest) => {
    setIsSubmitting(true);
    try {
      if (editingTable) {
        await apiClient.updateTable(editingTable.id, data);
        toast.success('테이블이 수정되었습니다.');
      } else {
        await apiClient.createTable(data as CreateTableRequest);
        toast.success('테이블이 등록되었습니다.');
      }
      loadTables();
      setShowForm(false);
      setEditingTable(null);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTableId) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteTable(deleteTableId);
      toast.success('테이블이 삭제되었습니다.');
      loadTables();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteTableId(null);
    }
  };

  const openAddForm = () => {
    setEditingTable(null);
    setShowForm(true);
  };

  const openEditForm = (table: StoreTable) => {
    setEditingTable(table);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTable(null);
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
        <ErrorMessage message={error} onRetry={loadTables} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">테이블 관리</h1>
          <p className="text-gray-500">매장의 테이블을 관리하세요</p>
        </div>
        <button onClick={openAddForm} className="btn-primary">
          + 테이블 추가
        </button>
      </div>

      {/* Table List */}
      <div className="card">
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🪑</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">등록된 테이블이 없습니다</h3>
            <p className="text-gray-500 mb-4">새 테이블을 추가해보세요.</p>
            <button onClick={openAddForm} className="btn-primary">
              + 테이블 추가
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">테이블 번호</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">등록일</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{table.tableNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          table.currentSessionId
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {table.currentSessionId ? '이용중' : '비어있음'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(table.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditForm(table)}
                        className="text-sm text-gray-600 hover:text-gray-800 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteTableId(table.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                        disabled={table.currentSessionId !== null}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingTable ? '테이블 수정' : '테이블 추가'}
            </h2>
            <TableForm
              table={editingTable || undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteTableId !== null}
        title="테이블 삭제"
        message="이 테이블을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTableId(null)}
      />

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  );
};
