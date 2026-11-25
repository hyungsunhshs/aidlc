import React from 'react';
import { Menu } from '../types';
import { MenuCard } from './MenuCard';

interface MenuGridProps {
  menus: Menu[];
  onAddToCart: (menu: Menu) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ menus, onAddToCart }) => {
  if (menus.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500" data-testid="menu-grid-empty">
        이 카테고리에 메뉴가 없습니다
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-4"
      data-testid="menu-grid"
    >
      {menus.map((menu) => (
        <MenuCard key={menu.id} menu={menu} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};
