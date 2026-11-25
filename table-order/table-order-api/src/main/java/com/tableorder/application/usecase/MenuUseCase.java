package com.tableorder.application.usecase;

import com.tableorder.application.dto.menu.*;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.ErrorCode;
import com.tableorder.domain.model.Category;
import com.tableorder.domain.model.Menu;
import com.tableorder.domain.model.Store;
import com.tableorder.domain.repository.CategoryRepository;
import com.tableorder.domain.repository.MenuRepository;
import com.tableorder.domain.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuUseCase {
    
    private final CategoryRepository categoryRepository;
    private final MenuRepository menuRepository;
    private final StoreRepository storeRepository;
    
    // === Category Operations ===
    
    public List<CategoryResponse> getCategories(Long storeId) {
        List<Category> categories = categoryRepository.findByStoreIdOrderByDisplayOrderAsc(storeId);
        return CategoryResponse.fromList(categories);
    }
    
    @Transactional
    public CategoryResponse createCategory(Long storeId, CreateCategoryRequest request) {
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
        
        Integer displayOrder = request.displayOrder();
        if (displayOrder == null) {
            displayOrder = categoryRepository.findMaxDisplayOrderByStoreId(storeId).orElse(0) + 1;
        }
        
        Category category = Category.builder()
            .store(store)
            .name(request.name())
            .displayOrder(displayOrder)
            .build();
        
        category = categoryRepository.save(category);
        log.info("Category created: categoryId={}, storeId={}", category.getId(), storeId);
        
        return CategoryResponse.from(category);
    }
    
    @Transactional
    public CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest request, Long storeId) {
        Category category = categoryRepository.findByIdWithStore(categoryId)
            .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        
        validateStoreAccess(category.getStore().getId(), storeId);
        
        category.update(request.name(), request.displayOrder());
        log.info("Category updated: categoryId={}", categoryId);
        
        return CategoryResponse.from(category);
    }
    
    @Transactional
    public void deleteCategory(Long categoryId, Long storeId) {
        Category category = categoryRepository.findByIdWithStore(categoryId)
            .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        
        validateStoreAccess(category.getStore().getId(), storeId);
        
        // Cascade delete - 하위 메뉴도 함께 삭제
        categoryRepository.delete(category);
        log.info("Category deleted (cascade): categoryId={}", categoryId);
    }
    
    // === Menu Operations ===
    
    public List<MenuResponse> getMenusByCategory(Long categoryId) {
        List<Menu> menus = menuRepository.findByCategoryIdAndNotDeleted(categoryId);
        return MenuResponse.fromList(menus);
    }
    
    public List<MenuResponse> getAvailableMenusByCategory(Long categoryId) {
        List<Menu> menus = menuRepository.findByCategoryIdAvailable(categoryId);
        return MenuResponse.fromList(menus);
    }
    
    public MenuDetailResponse getMenuDetail(Long menuId) {
        Menu menu = menuRepository.findByIdWithCategoryAndStore(menuId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        
        return MenuDetailResponse.from(menu);
    }
    
    public List<MenuResponse> getMenusByStore(Long storeId) {
        List<Menu> menus = menuRepository.findByStoreIdNotDeleted(storeId);
        return MenuResponse.fromList(menus);
    }
    
    @Transactional
    public MenuResponse createMenu(Long storeId, CreateMenuRequest request) {
        Category category = categoryRepository.findByIdWithStore(request.categoryId())
            .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        
        validateStoreAccess(category.getStore().getId(), storeId);
        
        Integer displayOrder = request.displayOrder();
        if (displayOrder == null) {
            displayOrder = menuRepository.findMaxDisplayOrderByCategoryId(request.categoryId()).orElse(0) + 1;
        }
        
        Menu menu = Menu.builder()
            .category(category)
            .name(request.name())
            .price(request.price())
            .description(request.description())
            .imageUrl(request.imageUrl())
            .displayOrder(displayOrder)
            .build();
        
        menu = menuRepository.save(menu);
        log.info("Menu created: menuId={}, categoryId={}", menu.getId(), request.categoryId());
        
        return MenuResponse.from(menu);
    }
    
    @Transactional
    public MenuResponse updateMenu(Long menuId, UpdateMenuRequest request, Long storeId) {
        Menu menu = menuRepository.findByIdWithCategoryAndStore(menuId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        
        validateStoreAccess(menu.getCategory().getStore().getId(), storeId);
        
        menu.update(
            request.name(),
            request.price(),
            request.description(),
            request.imageUrl(),
            request.displayOrder(),
            request.isAvailable()
        );
        
        log.info("Menu updated: menuId={}", menuId);
        return MenuResponse.from(menu);
    }
    
    @Transactional
    public void deleteMenu(Long menuId, Long storeId) {
        Menu menu = menuRepository.findByIdWithCategoryAndStore(menuId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        
        validateStoreAccess(menu.getCategory().getStore().getId(), storeId);
        
        // Soft delete
        menu.delete();
        log.info("Menu soft deleted: menuId={}", menuId);
    }
    
    @Transactional
    public void updateMenuDisplayOrder(UpdateMenuDisplayOrderRequest request, Long storeId) {
        for (UpdateMenuDisplayOrderRequest.MenuDisplayOrder order : request.menus()) {
            Menu menu = menuRepository.findById(order.menuId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
            
            menu.updateDisplayOrder(order.displayOrder());
        }
        log.info("Menu display order updated: count={}", request.menus().size());
    }
    
    private void validateStoreAccess(Long resourceStoreId, Long requestStoreId) {
        if (!resourceStoreId.equals(requestStoreId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}
