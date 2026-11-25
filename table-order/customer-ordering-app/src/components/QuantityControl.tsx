import React from 'react';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
}) => {
  return (
    <div className="flex items-center gap-3" data-testid="quantity-control">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="quantity-decrease-button"
        aria-label="수량 감소"
      >
        <span className="text-xl font-medium">−</span>
      </button>
      <span
        className="w-8 text-center font-semibold text-lg"
        data-testid="quantity-value"
      >
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="quantity-increase-button"
        aria-label="수량 증가"
      >
        <span className="text-xl font-medium">+</span>
      </button>
    </div>
  );
};
