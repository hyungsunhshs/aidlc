import React from 'react';
import { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (categoryId: number) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      data-testid="category-tabs"
    >
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
            selectedId === category.id
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid={`category-tab-${category.id}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
