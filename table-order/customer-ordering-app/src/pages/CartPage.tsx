import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useCart } from '../contexts/CartContext';
import apiClient from '../api/client';
import { CartItem } from '../components/CartItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ApiError, CreateOrderResponse } from '../types';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useSession();
  const { items, totalAmount, clearCart, updateQuantity, removeItem } = useCart();

  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<CreateOrderResponse | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleOrder = async () => {
    if (items.length === 0) return;

    setIsOrdering(true);
    setError(null);

    try {
      const response = await apiClient.createOrder({
        items: items.map((item) => ({
          menuId: item.menuId,
          quantity: item.quantity,
        })),
      });

      setOrderResult(response);
      clearCart();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 'SESSION_EXPIRED') {
        setError('세션이 만료되었습니다. 처음부터 다시 시작해주세요.');
      } else if (apiError.code === 'MENU_NOT_AVAILABLE') {
        setError('일부 메뉴가 품절되었습니다. 장바구니를 확인해주세요.');
      } else if (apiError.code === 'INVALID_ORDER') {
        setError('주문 정보가 올바르지 않습니다.');
      } else {
        setError(apiError.message || '주문에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsOrdering(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  // Order success modal
  if (orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            주문이 완료되었습니다!
          </h2>
          <p className="text-gray-600 mb-6">
            주문번호: <span className="font-bold text-primary-600">{orderResult.orderNumber}</span>
          </p>
          <p className="text-sm text-gray-500 mb-8">
            조리가 완료되면 알려드리겠습니다.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              data-testid="view-order-status-button"
            >
              주문 현황 보기
            </button>
            <button
              onClick={() => {
                setOrderResult(null);
                navigate('/menu');
              }}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              추가 주문하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/menu')}
              className="text-gray-600"
              data-testid="back-to-menu-button"
            >
              ← 메뉴로 돌아가기
            </button>
            <h1 className="text-xl font-bold text-gray-800">장바구니</h1>
            <span className="text-sm text-gray-500">
              테이블 {session?.tableNumber}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              장바구니가 비어있습니다
            </h2>
            <p className="text-gray-500 mb-6">
              맛있는 메뉴를 담아보세요!
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              메뉴 보러가기
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">
                  담은 메뉴 ({items.length})
                </h2>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-sm text-red-500 hover:text-red-600"
                  data-testid="clear-cart-button"
                >
                  전체 삭제
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <CartItem
                    key={item.menuId}
                    item={item}
                    onUpdateQuantity={(quantity) => updateQuantity(item.menuId, quantity)}
                    onRemove={() => removeItem(item.menuId)}
                  />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 {items.length}개</span>
                <span className="text-xl font-bold text-primary-600">
                  {totalAmount.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Order Button */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleOrder}
              disabled={isOrdering}
              className="w-full py-4 bg-primary-500 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              data-testid="place-order-button"
            >
              {isOrdering ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  주문 중...
                </span>
              ) : (
                `${totalAmount.toLocaleString('ko-KR')}원 주문하기`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              장바구니를 비우시겠습니까?
            </h3>
            <p className="text-gray-500 mb-6">
              담은 모든 메뉴가 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                data-testid="confirm-clear-cart-button"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
