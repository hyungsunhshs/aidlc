import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { Store, ApiError } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useToast, ToastContainer } from '../components/common/Toast';

export const StoreSettingsPage: React.FC = () => {
  const toast = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStore = useCallback(async () => {
    try {
      const data = await apiClient.getStore();
      setStore(data);
      setStoreName(data.name);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '매장 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      toast.error('매장명을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedStore = await apiClient.updateStore({ name: storeName.trim() });
      setStore(updatedStore);
      toast.success('매장 정보가 저장되었습니다.');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-6">
        <ErrorMessage message={error || '매장 정보를 불러올 수 없습니다.'} onRetry={loadStore} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">매장 설정</h1>
        <p className="text-gray-500">매장 정보를 관리하세요</p>
      </div>

      {/* Store Info Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">기본 정보</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매장 식별자
            </label>
            <input
              type="text"
              value={store.identifier}
              className="input bg-gray-50"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">
              매장 식별자는 변경할 수 없습니다
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매장명
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="input"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              등록일
            </label>
            <input
              type="text"
              value={new Date(store.createdAt).toLocaleDateString('ko-KR')}
              className="input bg-gray-50"
              disabled
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving || storeName === store.name}
              className="btn-primary"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Settings (placeholder for future features) */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">추가 설정</h2>
        <div className="text-center py-8 text-gray-500">
          <p>추가 설정 기능은 준비 중입니다.</p>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  );
};
