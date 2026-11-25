import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { Category, Menu, CreateMenuRequest, UpdateMenuRequest, CreateCategoryRequest, ApiError } from '../types';
import { CategoryList } from '../components/menu/CategoryList';
import { MenuList } from '../components/menu/MenuList';
import { MenuForm } from '../components/menu/MenuForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast, ToastContainer } from '../components/common/Toast';

export const MenuManagementPage: React.FC = () => {
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  // Menu form
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isMenuSubmitting, setIsMenuSubmitting] = useState(false);

  // Delete modals
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '카테고리를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId]);

  const loadMenus = useCallback(async () => {
    if (!selectedCategoryId) {
      setMenus([]);
      return;
    }

    try {
      const data = await apiClient.getMenus(selectedCategoryId);
      setMenus(data);
    } catch (err) {
      toast.error('메뉴를 불러오는데 실패했습니다.');
    }
  }, [selectedCategoryId, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowCategoryModal(true);
  };

  const handleSubmitCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('카테고리명을 입력해주세요.');
      return;
    }

    setIsCategorySubmitting(true);
    try {
      if (editingCategory) {
        await apiClient.updateCategory(editingCategory.id, { name: categoryName.trim() });
        toast.success('카테고리가 수정되었습니다.');
      } else {
        const request: CreateCategoryRequest = { name: categoryName.trim() };
        await apiClient.createCategory(request);
        toast.success('카테고리가 추가되었습니다.');
      }
      loadCategories();
      setShowCategoryModal(false);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '저장에 실패했습니다.');
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteCategory(deleteCategoryId);
      toast.success('카테고리가 삭제되었습니다.');
      if (selectedCategoryId === deleteCategoryId) {
        setSelectedCategoryId(null);
      }
      loadCategories();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteCategoryId(null);
    }
  };

  // Menu handlers
  const handleAddMenu = () => {
    setEditingMenu(null);
    setShowMenuForm(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setShowMenuForm(true);
  };

  const handleSubmitMenu = async (data: CreateMenuRequest | UpdateMenuRequest) => {
    setIsMenuSubmitting(true);
    try {
      if (editingMenu) {
        await apiClient.updateMenu(editingMenu.id, data);
        toast.success('메뉴가 수정되었습니다.');
      } else {
        await apiClient.createMenu(data as CreateMenuRequest);
        toast.success('메뉴가 등록되었습니다.');
      }
      loadMenus();
      loadCategories(); // Update menu counts
      setShowMenuForm(false);
      setEditingMenu(null);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '저장에 실패했습니다.');
    } finally {
      setIsMenuSubmitting(false);
    }
  };

  const handleDeleteMenu = async () => {
    if (!deleteMenuId) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteMenu(deleteMenuId);
      toast.success('메뉴가 삭제되었습니다.');
      loadMenus();
      loadCategories();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteMenuId(null);
    }
  };

  const handleToggleAvailability = async (menuId: number) => {
    try {
      await apiClient.toggleMenuAvailability(menuId);
      loadMenus();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || '상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={loadCategories} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">메뉴 관리</h1>
          <p className="text-gray-500">카테고리와 메뉴를 관리하세요</p>
        </div>
        <button onClick={handleAddMenu} className="btn-primary" disabled={!selectedCategoryId}>
          + 메뉴 추가
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <CategoryList
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            onEdit={handleEditCategory}
            onDelete={setDeleteCategoryId}
            onAdd={handleAddCategory}
          />
        </div>

        {/* Menu Grid */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {selectedCategoryId ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {categories.find((c) => c.id === selectedCategoryId)?.name} 메뉴
                  </h2>
                </div>
                <MenuList
                  menus={menus}
                  onEdit={handleEditMenu}
                  onDelete={setDeleteMenuId}
                  onToggleAvailability={handleToggleAvailability}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>카테고리를 선택하거나 추가해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingCategory ? '카테고리 수정' : '카테고리 추가'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리명
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="예: 메인 메뉴, 사이드, 음료"
                  className="input"
                  disabled={isCategorySubmitting}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={isCategorySubmitting}
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitCategory}
                  className="flex-1 btn-primary"
                  disabled={isCategorySubmitting}
                >
                  {isCategorySubmitting ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Form Modal */}
      {showMenuForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingMenu ? '메뉴 수정' : '메뉴 추가'}
            </h2>
            <MenuForm
              menu={editingMenu || undefined}
              categories={categories}
              defaultCategoryId={selectedCategoryId || undefined}
              onSubmit={handleSubmitMenu}
              onCancel={() => {
                setShowMenuForm(false);
                setEditingMenu(null);
              }}
              isLoading={isMenuSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      <ConfirmModal
        isOpen={deleteCategoryId !== null}
        title="카테고리 삭제"
        message="이 카테고리를 삭제하시겠습니까? 카테고리에 속한 모든 메뉴도 함께 삭제됩니다."
        confirmText="삭제"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCategoryId(null)}
      />

      {/* Delete Menu Modal */}
      <ConfirmModal
        isOpen={deleteMenuId !== null}
        title="메뉴 삭제"
        message="이 메뉴를 삭제하시겠습니까?"
        confirmText="삭제"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteMenu}
        onCancel={() => setDeleteMenuId(null)}
      />

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  );
};
