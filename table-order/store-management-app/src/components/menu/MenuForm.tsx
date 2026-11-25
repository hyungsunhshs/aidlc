import React, { useState } from 'react';
import { Category, CreateMenuRequest, Menu, UpdateMenuRequest } from '../../types';

interface MenuFormProps {
  menu?: Menu;
  categories: Category[];
  defaultCategoryId?: number;
  onSubmit: (data: CreateMenuRequest | UpdateMenuRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MenuForm: React.FC<MenuFormProps> = ({
  menu,
  categories,
  defaultCategoryId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [name, setName] = useState(menu?.name || '');
  const [price, setPrice] = useState(menu?.price?.toString() || '');
  const [description, setDescription] = useState(menu?.description || '');
  const [imageUrl, setImageUrl] = useState(menu?.imageUrl || '');
  const [categoryId, setCategoryId] = useState(menu?.categoryId || defaultCategoryId || categories[0]?.id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!menu;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '메뉴명을 입력해주세요';
    }

    if (!price.trim()) {
      newErrors.price = '가격을 입력해주세요';
    } else {
      const priceNum = parseInt(price, 10);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = '유효한 가격을 입력해주세요';
      }
    }

    if (!categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateMenuRequest | UpdateMenuRequest = {
      categoryId,
      name: name.trim(),
      price: parseInt(price, 10),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="menu-form">
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className={`input ${errors.categoryId ? 'border-red-500' : ''}`}
          disabled={isLoading}
          data-testid="menu-category-select"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          메뉴명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 김치찌개"
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          disabled={isLoading}
          data-testid="menu-name-input"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          가격 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="10000"
            min="1"
            className={`input pr-12 ${errors.price ? 'border-red-500' : ''}`}
            disabled={isLoading}
            data-testid="menu-price-input"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-500">{errors.price}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="메뉴에 대한 설명을 입력하세요"
          rows={3}
          className="input resize-none"
          disabled={isLoading}
          data-testid="menu-description-input"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
          이미지 URL
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="input"
          disabled={isLoading}
          data-testid="menu-image-input"
        />
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="미리보기"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 btn-secondary"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn-primary"
          data-testid="menu-form-submit"
        >
          {isLoading ? '저장 중...' : isEditing ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
};
