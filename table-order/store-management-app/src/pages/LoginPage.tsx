import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ApiError } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [storeIdentifier, setStoreIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeIdentifier.trim() || !username.trim() || !password.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await login({
        storeIdentifier: storeIdentifier.trim(),
        username: username.trim(),
        password: password.trim(),
      });
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 'INVALID_CREDENTIALS') {
        setError('매장 정보 또는 로그인 정보가 올바르지 않습니다.');
      } else if (apiError.code === 'ACCOUNT_LOCKED') {
        setError('계정이 잠겼습니다. 15분 후에 다시 시도해주세요.');
      } else {
        setError(apiError.message || '로그인에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏪</div>
            <h1 className="text-2xl font-bold text-gray-800">매장 관리자 로그인</h1>
            <p className="text-gray-500 mt-2">테이블오더 관리 시스템</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="storeIdentifier" className="block text-sm font-medium text-gray-700 mb-2">
                매장 식별자
              </label>
              <input
                type="text"
                id="storeIdentifier"
                value={storeIdentifier}
                onChange={(e) => setStoreIdentifier(e.target.value)}
                placeholder="매장 식별자를 입력하세요"
                className="input"
                disabled={isLoading}
                autoComplete="organization"
                data-testid="store-identifier-input"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용자명을 입력하세요"
                className="input"
                disabled={isLoading}
                autoComplete="username"
                data-testid="username-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="input"
                disabled={isLoading}
                autoComplete="current-password"
                data-testid="password-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-500 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              data-testid="login-button"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            로그인 정보가 기억나지 않으시면
            <br />
            시스템 관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};
