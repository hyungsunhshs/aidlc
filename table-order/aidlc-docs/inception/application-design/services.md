# Services Definition

## Overview
서비스 레이어 정의 및 오케스트레이션 패턴을 설명합니다.
트랜잭션은 Application Layer (Use Case)에서 관리됩니다.

---

## 1. Service Architecture

### 1.1 Service Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│         (Controllers - HTTP Request/Response Handling)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│                     (Use Cases / Services)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  @Transactional                                           │  │
│  │  - 비즈니스 유스케이스 조율                               │  │
│  │  - 여러 도메인 서비스 호출                                │  │
│  │  - 트랜잭션 경계 설정                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Layer                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Domain Services                                          │  │
│  │  - 단일 도메인 로직                                       │  │
│  │  - 비즈니스 규칙 검증                                     │  │
│  │  - 엔티티 상태 변경                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Entities                                                 │  │
│  │  - 비즈니스 데이터 및 불변 규칙                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                         │
│         (Repository Implementations, External Services)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Application Services (Use Cases)

### 2.1 SessionUseCaseImpl

**책임**: 테이블 세션 생명주기 관리

```java
@Service
@Transactional
public class SessionUseCaseImpl implements SessionUseCase {
    
    private final TableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    
    // 세션 시작
    // 1. 테이블 존재 확인
    // 2. 기존 활성 세션 없는지 확인
    // 3. 새 세션 생성 및 저장
    public TableSession startSession(Long tableId);
    
    // 현재 활성 세션 조회
    public Optional<TableSession> getCurrentSession(Long tableId);
    
    // 세션 종료
    // 1. 세션 상태를 COMPLETED로 변경
    // 2. 종료 시각 기록
    public void endSession(Long sessionId);
}
```

### 2.2 MenuUseCaseImpl

**책임**: 메뉴 조회 및 관리

```java
@Service
@Transactional
public class MenuUseCaseImpl implements MenuUseCase {
    
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    
    // 카테고리 목록 조회 (정렬 순서 적용)
    @Transactional(readOnly = true)
    public List<Category> getCategories(Long storeId);
    
    // 메뉴 목록 조회 (카테고리 필터, 정렬 순서 적용)
    @Transactional(readOnly = true)
    public List<Menu> getMenus(Long storeId, Long categoryId);
    
    // 메뉴 등록
    // 1. 매장 존재 확인
    // 2. 카테고리 존재 확인
    // 3. 필수 필드 검증 (이름, 가격)
    // 4. 가격 범위 검증
    // 5. 메뉴 저장
    public Menu createMenu(CreateMenuCommand command);
    
    // 메뉴 수정
    public Menu updateMenu(Long menuId, UpdateMenuCommand command);
    
    // 메뉴 삭제
    public void deleteMenu(Long menuId);
    
    // 메뉴 순서 변경
    public void updateMenuOrder(List<MenuOrderCommand> commands);
}
```

### 2.3 OrderUseCaseImpl

**책임**: 주문 생성 및 관리

```java
@Service
@Transactional
public class OrderUseCaseImpl implements OrderUseCase {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuRepository menuRepository;
    private final TableSessionRepository sessionRepository;
    private final OrderHistoryRepository historyRepository;
    private final OrderNotificationUseCase notificationUseCase;
    
    // 주문 생성
    // 1. 세션 유효성 확인 (활성 세션인지)
    // 2. 메뉴 존재 및 가격 확인
    // 3. 주문 번호 생성
    // 4. 주문 및 주문 항목 저장
    // 5. 실시간 알림 발송
    public Order createOrder(CreateOrderCommand command);
    
    // 세션별 주문 조회
    @Transactional(readOnly = true)
    public List<Order> getSessionOrders(Long sessionId);
    
    // 테이블별 현재 주문 조회
    @Transactional(readOnly = true)
    public List<Order> getTableCurrentOrders(Long tableId);
    
    // 주문 상태 변경
    // 1. 주문 존재 확인
    // 2. 상태 전이 유효성 검증 (WAITING -> PREPARING -> COMPLETED)
    // 3. 상태 변경 및 저장
    // 4. 실시간 알림 발송
    public Order updateOrderStatus(Long orderId, OrderStatus status);
    
    // 주문 삭제
    // 1. 주문 존재 확인
    // 2. 주문 항목 삭제
    // 3. 주문 삭제
    // 4. 실시간 알림 발송
    public void deleteOrder(Long orderId);
    
    // 테이블 총 주문액 계산
    @Transactional(readOnly = true)
    public BigDecimal calculateTableTotal(Long tableId, Long sessionId);
}
```

### 2.4 TableUseCaseImpl

**책임**: 테이블 관리

```java
@Service
@Transactional
public class TableUseCaseImpl implements TableUseCase {
    
    private final TableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final OrderRepository orderRepository;
    private final OrderHistoryRepository historyRepository;
    private final StoreRepository storeRepository;
    
    // 테이블 목록 조회
    @Transactional(readOnly = true)
    public List<Table> getTables(Long storeId);
    
    // 테이블 등록
    // 1. 매장 존재 확인
    // 2. 테이블 번호 중복 확인
    // 3. 비밀번호 해싱
    // 4. 테이블 저장
    public Table createTable(CreateTableCommand command);
    
    // 테이블 초기 설정 (태블릿용)
    // 1. 테이블 존재 확인
    // 2. 비밀번호 검증
    // 3. 세션 토큰 생성 (16시간)
    public Table setupTable(Long tableId, TableSetupCommand command);
    
    // 테이블 이용 완료
    // 1. 현재 활성 세션 조회
    // 2. 세션의 모든 주문을 OrderHistory로 이동
    // 3. 세션 종료
    // 4. 테이블 상태 초기화
    public void completeTableSession(Long tableId);
    
    // 테이블 과거 주문 이력 조회
    @Transactional(readOnly = true)
    public List<OrderHistory> getTableHistory(
        Long tableId, LocalDate startDate, LocalDate endDate
    );
}
```

### 2.5 AdminAuthUseCaseImpl

**책임**: 관리자 인증

```java
@Service
@Transactional
public class AdminAuthUseCaseImpl implements AdminAuthUseCase {
    
    private final AdminRepository adminRepository;
    private final StoreRepository storeRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;
    
    // 로그인
    // 1. 계정 잠금 확인
    // 2. 매장 식별자로 매장 조회
    // 3. 사용자명으로 관리자 조회
    // 4. 비밀번호 검증
    // 5. JWT 토큰 생성 (16시간)
    // 6. 로그인 시도 기록
    public AuthResult login(String storeIdentifier, String username, String password);
    
    // 토큰 검증
    public Admin validateToken(String token);
    
    // 토큰 갱신
    public AuthResult refreshToken(String refreshToken);
    
    // 로그인 시도 기록 (브루트포스 방지)
    // 5회 연속 실패 시 15분 잠금
    public void recordLoginAttempt(String storeIdentifier, String username, boolean success);
    
    // 계정 잠금 확인
    public boolean isAccountLocked(String storeIdentifier, String username);
}
```

### 2.6 OrderNotificationUseCaseImpl

**책임**: 실시간 주문 알림

```java
@Service
public class OrderNotificationUseCaseImpl implements OrderNotificationUseCase {
    
    private final SseEmitterManager emitterManager;
    
    // 새 주문 알림 발송
    // SSE를 통해 연결된 모든 관리자에게 알림
    public void notifyNewOrder(Order order);
    
    // 주문 상태 변경 알림
    public void notifyOrderStatusChange(Order order);
    
    // SSE 구독 등록
    // 1. SseEmitter 생성 (타임아웃 설정)
    // 2. 매장별 emitter 목록에 추가
    // 3. 연결 종료 시 정리 콜백 등록
    public SseEmitter subscribe(Long storeId);
    
    // SSE 구독 해제
    public void unsubscribe(Long storeId, SseEmitter emitter);
}
```

---

## 3. Domain Services

### 3.1 OrderDomainService

**책임**: 주문 관련 도메인 로직

```java
@Service
public class OrderDomainService {
    
    // 주문 번호 생성
    // 형식: #YYYYMMDD-NNNN (일자-일련번호)
    public String generateOrderNumber();
    
    // 주문 상태 전이 검증
    // WAITING -> PREPARING -> COMPLETED 순서만 허용
    public boolean isValidStatusTransition(OrderStatus from, OrderStatus to);
    
    // 주문 금액 계산
    public BigDecimal calculateOrderTotal(List<OrderItem> items);
}
```

### 3.2 SessionDomainService

**책임**: 세션 관련 도메인 로직

```java
@Service
public class SessionDomainService {
    
    // 세션 활성 상태 확인
    public boolean isSessionActive(TableSession session);
    
    // 세션 토큰 생성 (테이블 태블릿용)
    public String generateSessionToken(Table table);
    
    // 세션 토큰 검증
    public boolean validateSessionToken(String token, Long tableId);
}
```

### 3.3 AuthDomainService

**책임**: 인증 관련 도메인 로직

```java
@Service
public class AuthDomainService {
    
    // 비밀번호 해싱
    public String hashPassword(String rawPassword);
    
    // 비밀번호 검증
    public boolean verifyPassword(String rawPassword, String hashedPassword);
    
    // 로그인 시도 제한 확인
    public boolean shouldBlockLogin(int failedAttempts, LocalDateTime lastAttempt);
}
```

---

## 4. Service Orchestration Patterns

### 4.1 주문 생성 플로우

```
Customer Request: POST /api/customer/orders
                        │
                        ▼
              ┌─────────────────┐
              │ OrderController │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  OrderUseCase   │  @Transactional
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌───────────┐ ┌──────────────┐
│SessionRepo  │ │ MenuRepo  │ │  OrderRepo   │
│(validate)   │ │(get price)│ │   (save)     │
└─────────────┘ └───────────┘ └──────────────┘
                       │
                       ▼
              ┌─────────────────────┐
              │OrderNotificationUse │
              │   Case (SSE)        │
              └─────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Admin Dashboard │
              │   (Real-time)   │
              └─────────────────┘
```

### 4.2 테이블 이용 완료 플로우

```
Admin Request: POST /api/admin/tables/{id}/complete
                        │
                        ▼
              ┌─────────────────────┐
              │TableManagementCtrl  │
              └────────┬────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  TableUseCase   │  @Transactional
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────────────┐
         ▼             ▼                     ▼
┌─────────────┐ ┌───────────────┐ ┌──────────────────┐
│SessionRepo  │ │  OrderRepo    │ │OrderHistoryRepo  │
│(get active) │ │(get orders)   │ │(save history)    │
└─────────────┘ └───────────────┘ └──────────────────┘
         │             │
         ▼             ▼
┌─────────────┐ ┌───────────────┐
│SessionRepo  │ │  OrderRepo    │
│(end session)│ │(clear orders) │
└─────────────┘ └───────────────┘
```

### 4.3 실시간 주문 알림 플로우

```
       ┌──────────────────┐
       │  OrderUseCase    │
       │  (createOrder)   │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────────┐
       │OrderNotificationUse  │
       │   Case               │
       └────────┬─────────────┘
                │
                ▼
       ┌──────────────────┐
       │ SseEmitterManager│
       └────────┬─────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐
│Admin 1 │ │Admin 2 │ │Admin N │
│(SSE)   │ │(SSE)   │ │(SSE)   │
└────────┘ └────────┘ └────────┘
```

---

## 5. Cross-Cutting Concerns

### 5.1 트랜잭션 관리
- **위치**: Application Layer (Use Case)
- **전파**: REQUIRED (기본값)
- **읽기 전용**: 조회 메서드에 `@Transactional(readOnly = true)`

### 5.2 예외 처리
- **도메인 예외**: `DomainException` 상속
- **전역 핸들러**: `@ControllerAdvice`로 통합 처리
- **응답 형식**: `ApiResponse<T>` 통일

### 5.3 로깅
- **요청/응답**: 컨트롤러 레벨 AOP
- **비즈니스 로직**: 서비스 레벨 주요 작업 로깅
- **에러**: 예외 발생 시 스택트레이스 포함

### 5.4 인증/인가
- **고객용 API**: 세션 토큰 기반 (테이블 식별)
- **관리자용 API**: JWT 토큰 기반 (16시간 만료)
- **필터 체인**: Spring Security Filter
