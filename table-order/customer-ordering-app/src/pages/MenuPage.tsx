import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useCart } from '../contexts/CartContext';
import apiClient from '../api/client';
import { Category, Menu, ApiError } from '../types';
import { CategoryTabs } from '../components/CategoryTabs';
import { MenuGrid } from '../components/MenuGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useSession();
  const { addItem, itemCount } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiClient.getCategories();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || '카테고리를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  // Load menus when category changes
  useEffect(() => {
    const loadMenus = async () => {
      if (!selectedCategoryId) return;

      setIsLoadingMenus(true);
      setError(null);

      try {
        const data = await apiClient.getMenusByCategory(selectedCategoryId);
        setMenus(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || '메뉴를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingMenus(false);
      }
    };

    loadMenus();
  }, [selectedCategoryId]);

  const handleCategoryChange = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleAddToCart = useCallback((menu: Menu) => {
    addItem(menu);
  }, [addItem]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">메뉴</h1>
              <p className="text-sm text-gray-500">
                테이블 {session?.tableNumber}
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-primary-600 font-medium"
              data-testid="view-orders-button"
            >
              주문내역
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        {!isLoadingCategories && categories.length > 0 && (
          <div className="px-4 pb-3">
            <CategoryTabs
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={handleCategoryChange}
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoadingCategories ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500">등록된 메뉴가 없습니다.</p>
          </div>
        ) : isLoadingMenus ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <MenuGrid
            menus={menus}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      {/* Cart Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-4 bg-primary-500 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 transition-colors relative"
            data-testid="go-to-cart-button"
          >
            장바구니 보기
            {itemCount > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-primary-500 px-3 py-1 rounded-full text-sm font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
