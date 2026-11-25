import React from 'react';
import { CartItem as CartItemType } from '../types';
import { QuantityControl } from './QuantityControl';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
      data-testid={`cart-item-${item.menuId}`}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.menuName}
          className="w-20 h-20 object-cover rounded-lg"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold">{item.menuName}</h3>
        <p className="text-primary-600 font-medium mt-1">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="삭제"
          data-testid={`remove-cart-item-${item.menuId}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <QuantityControl
          quantity={item.quantity}
          onIncrease={() => onUpdateQuantity(item.quantity + 1)}
          onDecrease={() => onUpdateQuantity(item.quantity - 1)}
        />
      </div>
    </div>
  );
};
