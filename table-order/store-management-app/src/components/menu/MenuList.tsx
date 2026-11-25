import React from 'react';
import { Menu } from '../../types';
import { MenuCard } from './MenuCard';

interface MenuListProps {
  menus: Menu[];
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: number) => void;
  onToggleAvailability: (menuId: number) => void;
}

export const MenuList: React.FC<MenuListProps> = ({
  menus,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  if (menus.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">🍽️</div>
        <p>이 카테고리에 메뉴가 없습니다</p>
        <p className="text-sm mt-1">새 메뉴를 추가해보세요</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      data-testid="menu-list"
    >
      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onEdit={() => onEdit(menu)}
          onDelete={() => onDelete(menu.id)}
          onToggleAvailability={() => onToggleAvailability(menu.id)}
        />
      ))}
    </div>
  );
};
