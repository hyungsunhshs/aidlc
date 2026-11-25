import React from 'react';
import { Menu } from '../types';

interface MenuCardProps {
  menu: Menu;
  onAddToCart: (menu: Menu) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ menu, onAddToCart }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div
      className="card flex flex-col"
      data-testid={`menu-card-${menu.id}`}
    >
      {menu.imageUrl ? (
        <img
          src={menu.imageUrl}
          alt={menu.name}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">🍽️</span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-1">{menu.name}</h3>
        {menu.description && (
          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{menu.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-primary-600 font-bold">{formatPrice(menu.price)}</span>
          {menu.isAvailable ? (
            <button
              onClick={() => onAddToCart(menu)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
              data-testid={`add-to-cart-${menu.id}`}
            >
              담기
            </button>
          ) : (
            <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium">
              품절
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
