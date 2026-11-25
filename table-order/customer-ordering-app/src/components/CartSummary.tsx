import React from 'react';

interface CartSummaryProps {
  itemCount: number;
  totalAmount: number;
  onOrder: () => void;
  isOrdering: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  itemCount,
  totalAmount,
  onOrder,
  isOrdering,
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
      data-testid="cart-summary"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">총 {itemCount}개</span>
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(totalAmount)}
          </span>
        </div>
        <button
          onClick={onOrder}
          disabled={itemCount === 0 || isOrdering}
          className="w-full btn-primary flex items-center justify-center gap-2"
          data-testid="order-button"
        >
          {isOrdering ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              주문 중...
            </>
          ) : (
            '주문하기'
          )}
        </button>
      </div>
    </div>
  );
};
