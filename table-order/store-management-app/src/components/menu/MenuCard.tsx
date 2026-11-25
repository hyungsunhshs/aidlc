import React from 'react';
import { Menu } from '../../types';

interface MenuCardProps {
  menu: Menu;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div
      className={`card overflow-hidden ${!menu.isAvailable ? 'opacity-60' : ''}`}
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
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800">{menu.name}</h3>
          <button
            onClick={onToggleAvailability}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              menu.isAvailable
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
            data-testid={`toggle-availability-${menu.id}`}
          >
            {menu.isAvailable ? '판매중' : '품절'}
          </button>
        </div>
        <p className="text-primary-600 font-bold mb-2">{formatPrice(menu.price)}</p>
        {menu.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{menu.description}</p>
        )}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            data-testid={`edit-menu-${menu.id}`}
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            data-testid={`delete-menu-${menu.id}`}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};
