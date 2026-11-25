# Component Methods

## Overview
각 컴포넌트의 메서드 시그니처를 정의합니다.
상세 비즈니스 규칙은 Functional Design (CONSTRUCTION Phase)에서 정의됩니다.

---

## 1. Backend - Presentation Layer

### 1.1 Customer Module Controllers

#### SessionController
```java
@RestController
@RequestMapping("/api/customer/sessions")
public interface SessionController {
    
    // 테이블 세션 시작
    @PostMapping
    ResponseEntity<SessionResponse> startSession(
        @RequestBody StartSessionRequest request
    );
    
    // 현재 세션 조회
    @GetMapping("/current")
    ResponseEntity<SessionResponse> getCurrentSession(
        @RequestParam Long tableId
    );
}
```

#### MenuController
```java
@RestController
@RequestMapping("/api/customer/menus")
public interface MenuController {
    
    // 카테고리 목록 조회
    @GetMapping("/categories")
    ResponseEntity<List<CategoryResponse>> getCategories(
        @RequestParam Long storeId
    );
    
    // 카테고리별 메뉴 조회
    @GetMapping
    ResponseEntity<List<MenuResponse>> getMenus(
        @RequestParam Long storeId,
        @RequestParam(required = false) Long categoryId
    );
    
    // 메뉴 상세 조회
    @GetMapping("/{menuId}")
    ResponseEntity<MenuResponse> getMenu(
        @PathVariable Long menuId
    );
}
```

#### OrderController
```java
@RestController
@RequestMapping("/api/customer/orders")
public interface OrderController {
    
    // 주문 생성
    @PostMapping
    ResponseEntity<OrderResponse> createOrder(
        @RequestBody CreateOrderRequest request
    );
    
    // 현재 세션 주문 목록 조회
    @GetMapping
    ResponseEntity<List<OrderResponse>> getSessionOrders(
        @RequestParam Long sessionId
    );
    
    // 주문 상세 조회
    @GetMapping("/{orderId}")
    ResponseEntity<OrderResponse> getOrder(
        @PathVariable Long orderId
    );
}
```

### 1.2 Admin Module Controllers

#### AuthController
```java
@RestController
@RequestMapping("/api/admin/auth")
public interface AuthController {
    
    // 로그인
    @PostMapping("/login")
    ResponseEntity<LoginResponse> login(
        @RequestBody LoginRequest request
    );
    
    // 로그아웃
    @PostMapping("/logout")
    ResponseEntity<Void> logout();
    
    // 토큰 갱신
    @PostMapping("/refresh")
    ResponseEntity<TokenResponse> refreshToken(
        @RequestBody RefreshTokenRequest request
    );
}
```

#### DashboardController
```java
@RestController
@RequestMapping("/api/admin/dashboard")
public interface DashboardController {
    
    // 대시보드 통계 조회
    @GetMapping("/stats")
    ResponseEntity<DashboardStatsResponse> getStats(
        @RequestParam Long storeId
    );
    
    // 테이블별 현황 조회
    @GetMapping("/tables")
    ResponseEntity<List<TableStatusResponse>> getTableStatuses(
        @RequestParam Long storeId
    );
}
```

#### OrderManagementController
```java
@RestController
@RequestMapping("/api/admin/orders")
public interface OrderManagementController {
    
    // 매장 전체 주문 조회
    @GetMapping
    ResponseEntity<List<OrderResponse>> getOrders(
        @RequestParam Long storeId,
        @RequestParam(required = false) OrderStatus status
    );
    
    // 테이블별 주문 조회
    @GetMapping("/tables/{tableId}")
    ResponseEntity<List<OrderResponse>> getTableOrders(
        @PathVariable Long tableId
    );
    
    // 주문 상태 변경
    @PatchMapping("/{orderId}/status")
    ResponseEntity<OrderResponse> updateOrderStatus(
        @PathVariable Long orderId,
        @RequestBody UpdateOrderStatusRequest request
    );
    
    // 주문 삭제
    @DeleteMapping("/{orderId}")
    ResponseEntity<Void> deleteOrder(
        @PathVariable Long orderId
    );
}
```

#### TableManagementController
```java
@RestController
@RequestMapping("/api/admin/tables")
public interface TableManagementController {
    
    // 테이블 목록 조회
    @GetMapping
    ResponseEntity<List<TableResponse>> getTables(
        @RequestParam Long storeId
    );
    
    // 테이블 등록
    @PostMapping
    ResponseEntity<TableResponse> createTable(
        @RequestBody CreateTableRequest request
    );
    
    // 테이블 초기 설정 (태블릿용)
    @PostMapping("/{tableId}/setup")
    ResponseEntity<TableSetupResponse> setupTable(
        @PathVariable Long tableId,
        @RequestBody TableSetupRequest request
    );
    
    // 테이블 이용 완료
    @PostMapping("/{tableId}/complete")
    ResponseEntity<Void> completeTableSession(
        @PathVariable Long tableId
    );
    
    // 테이블 과거 주문 내역 조회
    @GetMapping("/{tableId}/history")
    ResponseEntity<List<OrderHistoryResponse>> getTableHistory(
        @PathVariable Long tableId,
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    );
}
```

#### MenuManagementController
```java
@RestController
@RequestMapping("/api/admin/menus")
public interface MenuManagementController {
    
    // 메뉴 목록 조회 (관리자용)
    @GetMapping
    ResponseEntity<List<MenuResponse>> getMenus(
        @RequestParam Long storeId,
        @RequestParam(required = false) Long categoryId
    );
    
    // 메뉴 등록
    @PostMapping
    ResponseEntity<MenuResponse> createMenu(
        @RequestBody CreateMenuRequest request
    );
    
    // 메뉴 수정
    @PutMapping("/{menuId}")
    ResponseEntity<MenuResponse> updateMenu(
        @PathVariable Long menuId,
        @RequestBody UpdateMenuRequest request
    );
    
    // 메뉴 삭제
    @DeleteMapping("/{menuId}")
    ResponseEntity<Void> deleteMenu(
        @PathVariable Long menuId
    );
    
    // 메뉴 순서 변경
    @PatchMapping("/order")
    ResponseEntity<Void> updateMenuOrder(
        @RequestBody UpdateMenuOrderRequest request
    );
    
    // 카테고리 CRUD
    @GetMapping("/categories")
    ResponseEntity<List<CategoryResponse>> getCategories(
        @RequestParam Long storeId
    );
    
    @PostMapping("/categories")
    ResponseEntity<CategoryResponse> createCategory(
        @RequestBody CreateCategoryRequest request
    );
    
    @PutMapping("/categories/{categoryId}")
    ResponseEntity<CategoryResponse> updateCategory(
        @PathVariable Long categoryId,
        @RequestBody UpdateCategoryRequest request
    );
    
    @DeleteMapping("/categories/{categoryId}")
    ResponseEntity<Void> deleteCategory(
        @PathVariable Long categoryId
    );
}
```

#### StoreController
```java
@RestController
@RequestMapping("/api/admin/stores")
public interface StoreController {
    
    // 매장 정보 조회
    @GetMapping("/{storeId}")
    ResponseEntity<StoreResponse> getStore(
        @PathVariable Long storeId
    );
    
    // 매장 등록
    @PostMapping
    ResponseEntity<StoreResponse> createStore(
        @RequestBody CreateStoreRequest request
    );
    
    // 매장 정보 수정
    @PutMapping("/{storeId}")
    ResponseEntity<StoreResponse> updateStore(
        @PathVariable Long storeId,
        @RequestBody UpdateStoreRequest request
    );
}
```

#### SseController
```java
@RestController
@RequestMapping("/api/admin/sse")
public interface SseController {
    
    // SSE 스트림 구독
    @GetMapping(value = "/orders", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter subscribeOrders(
        @RequestParam Long storeId
    );
}
```

---

## 2. Backend - Application Layer (Use Cases)

### 2.1 SessionUseCase
```java
public interface SessionUseCase {
    
    // 세션 시작
    TableSession startSession(Long tableId);
    
    // 현재 활성 세션 조회
    Optional<TableSession> getCurrentSession(Long tableId);
    
    // 세션 종료 (이용 완료)
    void endSession(Long sessionId);
}
```

### 2.2 MenuUseCase
```java
public interface MenuUseCase {
    
    // 카테고리 목록 조회
    List<Category> getCategories(Long storeId);
    
    // 메뉴 목록 조회
    List<Menu> getMenus(Long storeId, Long categoryId);
    
    // 메뉴 상세 조회
    Menu getMenu(Long menuId);
    
    // 메뉴 등록
    Menu createMenu(CreateMenuCommand command);
    
    // 메뉴 수정
    Menu updateMenu(Long menuId, UpdateMenuCommand command);
    
    // 메뉴 삭제
    void deleteMenu(Long menuId);
    
    // 메뉴 순서 변경
    void updateMenuOrder(List<MenuOrderCommand> commands);
}
```

### 2.3 OrderUseCase
```java
public interface OrderUseCase {
    
    // 주문 생성
    Order createOrder(CreateOrderCommand command);
    
    // 세션별 주문 조회
    List<Order> getSessionOrders(Long sessionId);
    
    // 테이블별 현재 주문 조회
    List<Order> getTableCurrentOrders(Long tableId);
    
    // 주문 상태 변경
    Order updateOrderStatus(Long orderId, OrderStatus status);
    
    // 주문 삭제
    void deleteOrder(Long orderId);
    
    // 테이블 총 주문액 계산
    BigDecimal calculateTableTotal(Long tableId, Long sessionId);
}
```

### 2.4 TableUseCase
```java
public interface TableUseCase {
    
    // 테이블 목록 조회
    List<Table> getTables(Long storeId);
    
    // 테이블 등록
    Table createTable(CreateTableCommand command);
    
    // 테이블 설정
    Table setupTable(Long tableId, TableSetupCommand command);
    
    // 테이블 이용 완료
    void completeTableSession(Long tableId);
    
    // 테이블 과거 주문 이력 조회
    List<OrderHistory> getTableHistory(Long tableId, LocalDate startDate, LocalDate endDate);
}
```

### 2.5 StoreUseCase
```java
public interface StoreUseCase {
    
    // 매장 조회
    Store getStore(Long storeId);
    
    // 매장 등록
    Store createStore(CreateStoreCommand command);
    
    // 매장 수정
    Store updateStore(Long storeId, UpdateStoreCommand command);
}
```

### 2.6 AdminAuthUseCase
```java
public interface AdminAuthUseCase {
    
    // 로그인
    AuthResult login(String storeIdentifier, String username, String password);
    
    // 토큰 검증
    Admin validateToken(String token);
    
    // 토큰 갱신
    AuthResult refreshToken(String refreshToken);
    
    // 로그인 시도 기록 (브루트포스 방지)
    void recordLoginAttempt(String storeIdentifier, String username, boolean success);
    
    // 계정 잠금 확인
    boolean isAccountLocked(String storeIdentifier, String username);
}
```

### 2.7 OrderNotificationUseCase
```java
public interface OrderNotificationUseCase {
    
    // 새 주문 알림 발송
    void notifyNewOrder(Order order);
    
    // 주문 상태 변경 알림
    void notifyOrderStatusChange(Order order);
    
    // SSE 구독 등록
    SseEmitter subscribe(Long storeId);
    
    // SSE 구독 해제
    void unsubscribe(Long storeId, SseEmitter emitter);
}
```

---

## 3. Backend - Domain Layer (Repository Interfaces)

### 3.1 Repository Interfaces
```java
public interface StoreRepository {
    Optional<Store> findById(Long id);
    Optional<Store> findByIdentifier(String identifier);
    Store save(Store store);
}

public interface TableRepository {
    Optional<Table> findById(Long id);
    List<Table> findByStoreId(Long storeId);
    Table save(Table table);
}

public interface TableSessionRepository {
    Optional<TableSession> findById(Long id);
    Optional<TableSession> findActiveByTableId(Long tableId);
    List<TableSession> findByTableIdAndStatus(Long tableId, SessionStatus status);
    TableSession save(TableSession session);
}

public interface CategoryRepository {
    Optional<Category> findById(Long id);
    List<Category> findByStoreIdOrderByDisplayOrder(Long storeId);
    Category save(Category category);
    void deleteById(Long id);
}

public interface MenuRepository {
    Optional<Menu> findById(Long id);
    List<Menu> findByStoreId(Long storeId);
    List<Menu> findByCategoryIdOrderByDisplayOrder(Long categoryId);
    Menu save(Menu menu);
    void deleteById(Long id);
}

public interface OrderRepository {
    Optional<Order> findById(Long id);
    List<Order> findBySessionId(Long sessionId);
    List<Order> findByTableIdAndSessionId(Long tableId, Long sessionId);
    List<Order> findByStoreIdAndStatus(Long storeId, OrderStatus status);
    Order save(Order order);
    void deleteById(Long id);
}

public interface OrderHistoryRepository {
    List<OrderHistory> findByTableIdAndCompletedAtBetween(
        Long tableId, LocalDateTime start, LocalDateTime end
    );
    OrderHistory save(OrderHistory history);
}

public interface AdminRepository {
    Optional<Admin> findById(Long id);
    Optional<Admin> findByStoreIdAndUsername(Long storeId, String username);
    Admin save(Admin admin);
}
```

---

## 4. Frontend - Custom Hooks

### 4.1 Customer App Hooks
```typescript
// useSession.ts
interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  startSession: (tableId: number) => Promise<void>;
  error: Error | null;
}

// useMenu.ts
interface UseMenuReturn {
  categories: Category[];
  menus: Menu[];
  selectedCategory: number | null;
  setSelectedCategory: (id: number | null) => void;
  isLoading: boolean;
}

// useCart.ts
interface UseCartReturn {
  items: CartItem[];
  addItem: (menu: Menu) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

// useOrders.ts
interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  createOrder: (items: CartItem[]) => Promise<Order>;
  refetch: () => void;
}
```

### 4.2 Admin App Hooks
```typescript
// useAuth.ts
interface UseAuthReturn {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: Error | null;
}

// useSSE.ts
interface UseSSEReturn {
  isConnected: boolean;
  lastEvent: OrderEvent | null;
  connect: (storeId: number) => void;
  disconnect: () => void;
}

// useDashboard.ts
interface UseDashboardReturn {
  stats: DashboardStats;
  tableStatuses: TableStatus[];
  isLoading: boolean;
  refetch: () => void;
}

// useOrderManagement.ts
interface UseOrderManagementReturn {
  orders: Order[];
  updateStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: number) => Promise<void>;
  isLoading: boolean;
}

// useMenuManagement.ts
interface UseMenuManagementReturn {
  menus: Menu[];
  categories: Category[];
  createMenu: (menu: CreateMenuInput) => Promise<void>;
  updateMenu: (id: number, menu: UpdateMenuInput) => Promise<void>;
  deleteMenu: (id: number) => Promise<void>;
  updateMenuOrder: (orders: MenuOrder[]) => Promise<void>;
  isLoading: boolean;
}
```

---

## 5. DTO/Request/Response Types

### 5.1 Common Types
```typescript
// Enums
enum OrderStatus {
  WAITING = 'WAITING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED'
}

enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

// Common Response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

### 5.2 Request/Response Examples
```typescript
// Session
interface StartSessionRequest {
  tableId: number;
}

interface SessionResponse {
  id: number;
  tableId: number;
  startedAt: string;
  status: SessionStatus;
}

// Order
interface CreateOrderRequest {
  sessionId: number;
  items: OrderItemRequest[];
}

interface OrderItemRequest {
  menuId: number;
  quantity: number;
}

interface OrderResponse {
  id: number;
  orderNumber: string;
  sessionId: number;
  items: OrderItemResponse[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

// Menu
interface CreateMenuRequest {
  storeId: number;
  categoryId: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface MenuResponse {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  displayOrder: number;
}
```
