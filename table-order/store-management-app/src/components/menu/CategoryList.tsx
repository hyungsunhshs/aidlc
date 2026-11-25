import React from 'react';
import { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (categoryId: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  onAdd: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}) => {
  return (
    <div className="card" data-testid="category-list">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">카테고리</h3>
        <button
          onClick={onAdd}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          data-testid="add-category-button"
        >
          + 추가
        </button>
      </div>
      <div className="p-2">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            등록된 카테고리가 없습니다
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => onSelect(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedId === category.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  data-testid={`category-item-${category.id}`}
                >
                  <span className="font-medium truncate">{category.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {category.menuCount}개
                  </span>
                </button>
                {selectedId === category.id && (
                  <div className="flex gap-2 px-3 py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(category);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(category.id);
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
