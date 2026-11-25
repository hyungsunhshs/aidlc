import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useCart } from '../contexts/CartContext';
import apiClient from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ApiError } from '../types';

export const StartSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSession } = useSession();
  const { clearCart } = useCart();

  // Extract store and table from URL params (e.g., ?store=abc123&table=A1)
  const storeIdentifier = searchParams.get('store') || '';
  const tableNumber = searchParams.get('table') || '';

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeIdentifier || !tableNumber) {
      setError('매장 정보가 올바르지 않습니다. QR 코드를 다시 스캔해주세요.');
      return;
    }

    if (!password.trim()) {
      setError('테이블 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const session = await apiClient.startSession({
        storeIdentifier,
        tableNumber,
        password: password.trim(),
      });
      
      // Clear any existing cart from previous session
      clearCart();
      
      // Set the new session
      setSession(session);
      
      // Navigate to menu page
      navigate('/menu');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 'TABLE_NOT_FOUND') {
        setError('테이블 정보를 찾을 수 없습니다. QR 코드를 다시 확인해주세요.');
      } else if (apiError.code === 'INVALID_PASSWORD') {
        setError('비밀번호가 올바르지 않습니다. 테이블에 비치된 비밀번호를 확인해주세요.');
      } else if (apiError.code === 'STORE_NOT_FOUND') {
        setError('매장 정보를 찾을 수 없습니다.');
      } else {
        setError(apiError.message || '세션 시작에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if no store or table in URL
  if (!storeIdentifier || !tableNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            QR 코드를 스캔해주세요
          </h1>
          <p className="text-gray-600">
            테이블에 비치된 QR 코드를 스캔하시면
            <br />
            주문을 시작할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🍽️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              주문을 시작합니다
            </h1>
            <p className="text-gray-600">
              테이블 <span className="font-semibold text-primary-600">{tableNumber}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                테이블 비밀번호
              </label>
              <input
                type="text"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="테이블에 비치된 비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                disabled={isLoading}
                autoComplete="off"
                data-testid="password-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-500 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              data-testid="start-session-button"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  시작 중...
                </span>
              ) : (
                '주문 시작하기'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            비밀번호는 테이블에 비치된 안내문을 확인해주세요
          </p>
        </div>
      </div>
    </div>
  );
};
