# Code Generation Plan - table-order-api

## Overview
table-order-api Unit의 코드 생성 계획입니다. 이 문서는 Code Generation 단계의 **단일 진실 원천(Single Source of Truth)**입니다.

---

## Unit Context

### Technology Stack
- **Language**: Java 17
- **Framework**: Spring Boot 3.2.x
- **Build Tool**: Gradle (Kotlin DSL)
- **Database**: PostgreSQL
- **Authentication**: JWT (jjwt)
- **API Documentation**: SpringDoc OpenAPI

### Design Decisions
- **Architecture**: Layered Architecture (Presentation → Application → Domain → Infrastructure)
- **Exception Handling**: Flat BusinessException + ErrorCode enum
- **DTO Mapping**: Manual (static factory methods)
- **Validation**: Two-Layer (Controller: format, UseCase: business rules)
- **Transaction**: UseCase layer
- **SSE Management**: In-Memory ConcurrentHashMap
- **Concurrency**: Pessimistic Lock for Order Number Generation

### Stories Covered
모든 32개 Backend 스토리를 구현합니다:
- Customer Stories (Backend): US-C01~C04, US-C10~C13
- Admin Stories (Backend): US-A01~A19

---

## Code Location

```
/Users/hyungsun/aidlc-workshop/table-order/
├── table-order-api/                          # Backend Application
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src/
│       ├── main/
│       │   ├── java/com/tableorder/
│       │   │   ├── TableOrderApplication.java
│       │   │   ├── common/                   # Cross-cutting concerns
│       │   │   │   ├── config/
│       │   │   │   ├── exception/
│       │   │   │   ├── security/
│       │   │   │   └── util/
│       │   │   ├── domain/                   # Domain Layer
│       │   │   │   ├── model/
│       │   │   │   └── repository/
│       │   │   ├── application/              # Application Layer (UseCases)
│       │   │   │   └── usecase/
│       │   │   ├── presentation/             # Presentation Layer (Controllers)
│       │   │   │   ├── customer/
│       │   │   │   └── admin/
│       │   │   └── infrastructure/           # Infrastructure Layer
│       │   │       ├── persistence/
│       │   │       ├── security/
│       │   │       └── sse/
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-dev.yml
│       │       └── application-prod.yml
│       └── test/
│           └── java/com/tableorder/
│               ├── domain/
│               ├── application/
│               ├── presentation/
│               └── integration/
├── k8s/                                      # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── secret.yaml
└── aidlc-docs/construction/table-order-api/code/  # Documentation only
```

---

## Generation Steps

### Phase 1: Project Structure Setup

#### Step 1: Project Configuration Files
- [x] Create `table-order-api/build.gradle.kts` (dependencies, plugins)
- [x] Create `table-order-api/settings.gradle.kts`
- [x] Create `table-order-api/src/main/resources/application.yml` (base config)
- [x] Create `table-order-api/src/main/resources/application-dev.yml` (dev profile)
- [x] Create `table-order-api/src/main/resources/application-prod.yml` (prod profile)
- [x] Create `table-order-api/src/main/java/com/tableorder/TableOrderApplication.java`

**Stories**: N/A (Infrastructure)

---

### Phase 2: Domain Layer

#### Step 2: Domain Entities
- [x] Create `Store.java` entity
- [x] Create `Table.java` entity (renamed from Table to avoid SQL keyword)
- [x] Create `TableSession.java` entity
- [x] Create `Category.java` entity
- [x] Create `Menu.java` entity
- [x] Create `Order.java` entity
- [x] Create `OrderItem.java` entity
- [x] Create `OrderHistory.java` entity
- [x] Create `Admin.java` entity
- [x] Create `DailyOrderSequence.java` entity
- [x] Create `BaseTimeEntity.java` (JPA Auditing)

**Stories**: All stories require domain entities

#### Step 3: Domain Enums and Value Objects
- [x] Create `SessionStatus.java` enum (ACTIVE, COMPLETED, EXPIRED)
- [x] Create `OrderStatus.java` enum (PENDING, PREPARING, COMPLETED)
- [ ] Create `Money.java` value object
- [ ] Create `OrderNumber.java` value object
- [ ] Create `TablePassword.java` value object

**Stories**: US-C01, US-C10, US-A07

#### Step 4: Repository Interfaces
- [x] Create `StoreRepository.java` interface
- [x] Create `TableRepository.java` interface
- [x] Create `TableSessionRepository.java` interface
- [x] Create `CategoryRepository.java` interface
- [x] Create `MenuRepository.java` interface
- [x] Create `OrderRepository.java` interface
- [x] Create `OrderItemRepository.java` interface
- [x] Create `OrderHistoryRepository.java` interface
- [x] Create `AdminRepository.java` interface
- [x] Create `DailyOrderSequenceRepository.java` interface

**Stories**: All stories require repository access

#### Step 5: Domain Layer Unit Tests
- [ ] Test `Money` value object
- [ ] Test `OrderNumber` value object
- [ ] Test `TablePassword` value object
- [ ] Test enum behaviors

**Stories**: N/A (Testing)

#### Step 6: Domain Layer Summary
- [ ] Create `aidlc-docs/construction/table-order-api/code/domain-layer-summary.md`

---

### Phase 3: Common (Cross-cutting Concerns)

#### Step 7: Exception Handling
- [x] Create `ErrorCode.java` enum (all error codes)
- [x] Create `BusinessException.java`
- [x] Create `ErrorResponse.java` record
- [x] Create `GlobalExceptionHandler.java`

**Stories**: US-C12, US-A03 (error handling scenarios)

#### Step 8: Security Configuration
- [x] Create `SecurityConfig.java` (filter chain, authorization rules)
- [x] Create `CorsConfig.java`
- [x] Create `JwtTokenProvider.java`
- [x] Create `JwtAuthenticationFilter.java` (Admin API)
- [x] Create `SessionAuthenticationFilter.java` (Customer API)
- [x] Create `AdminAuthentication.java` (custom auth object)
- [x] Create `SessionAuthentication.java` (custom auth object)

**Stories**: US-C01, US-A01, US-A02

#### Step 9: Utility Classes
- [x] Create `JpaConfig.java` (JPA Auditing)
- [x] Create `SchedulerConfig.java`
- [x] Create custom validators (`ValidTablePassword.java`, `TablePasswordValidator.java`)

**Stories**: US-A08 (table password validation)

#### Step 10: Common Layer Unit Tests
- [ ] Test `JwtTokenProvider` (token creation, validation, expiry)
- [ ] Test `GlobalExceptionHandler` (all exception types)
- [ ] Test custom validators

**Stories**: N/A (Testing)

#### Step 11: Common Layer Summary
- [ ] Create `aidlc-docs/construction/table-order-api/code/common-layer-summary.md`

---

### Phase 4: Application Layer (UseCases)

#### Step 12: Session UseCase
- [x] Create `SessionUseCase.java`
  - `startSession(request)` → US-C01
  - `getActiveSession(tableId)` → US-C01

**Request/Response DTOs**:
- [x] Create `StartSessionRequest.java`
- [x] Create `StartSessionResponse.java`

**Stories**: US-C01, US-A09

#### Step 13: Menu UseCase
- [x] Create `MenuUseCase.java`
  - `getCategories(storeId)` → US-C02, US-A15
  - `getMenusByCategory(categoryId)` → US-C02, US-A15
  - `getMenuDetail(menuId)` → US-C03
  - `createCategory(request)` → US-A15
  - `updateCategory(request)` → US-A15
  - `deleteCategory(categoryId)` → US-A15
  - `createMenu(request)` → US-A16
  - `updateMenu(request)` → US-A17
  - `deleteMenu(menuId)` → US-A18
  - `updateMenuDisplayOrder(request)` → US-A19

**Request/Response DTOs**:
- [x] Create `CategoryResponse.java`
- [x] Create `MenuResponse.java`
- [x] Create `MenuDetailResponse.java`
- [x] Create `CreateCategoryRequest.java`
- [x] Create `UpdateCategoryRequest.java`
- [x] Create `CreateMenuRequest.java`
- [x] Create `UpdateMenuRequest.java`
- [x] Create `UpdateMenuDisplayOrderRequest.java`

**Stories**: US-C02, US-C03, US-C04, US-A15, US-A16, US-A17, US-A18, US-A19

#### Step 14: Order UseCase
- [x] Create `OrderUseCase.java`
  - `createOrder(sessionId, request)` → US-C10
  - `getOrdersBySession(sessionId)` → US-C13
  - `getOrdersByStore(storeId)` → US-A04
  - `getOrderDetail(orderId)` → US-A06
  - `updateOrderStatus(orderId, status)` → US-A07
  - `deleteOrder(orderId)` → US-A10

**Request/Response DTOs**:
- [x] Create `CreateOrderRequest.java`
- [x] Create `OrderItemRequest.java`
- [x] Create `CreateOrderResponse.java`
- [x] Create `OrderResponse.java`
- [x] Create `OrderDetailResponse.java`
- [x] Create `OrderItemResponse.java`
- [x] Create `UpdateOrderStatusRequest.java`

**Stories**: US-C10, US-C11, US-C12, US-C13, US-A04, US-A06, US-A07, US-A10

#### Step 15: Table UseCase
- [x] Create `TableUseCase.java`
  - `getTables(storeId)` → US-A04
  - `createTable(request)` → US-A08
  - `updateTable(request)` → US-A08
  - `deleteTable(tableId)` → US-A08
  - `completeSession(tableId)` → US-A11
  - `getOrderHistory(tableId)` → US-A12

**Request/Response DTOs**:
- [x] Create `TableResponse.java`
- [x] Create `CreateTableRequest.java`
- [x] Create `UpdateTableRequest.java`
- [x] Create `TableDetailResponse.java`
- [x] Create `OrderHistoryResponse.java`

**Stories**: US-A04, US-A08, US-A09, US-A11, US-A12

#### Step 16: Store UseCase
- [x] Create `StoreUseCase.java`
  - `createStore(request)` → US-A13
  - `updateStore(request)` → US-A14
  - `getStore(storeId)` → US-A14
  - `findByIdentifier(identifier)` → US-C01, US-A01

**Request/Response DTOs**:
- [x] Create `CreateStoreRequest.java`
- [x] Create `UpdateStoreRequest.java`
- [x] Create `StoreResponse.java`

**Stories**: US-A13, US-A14

#### Step 17: AdminAuth UseCase
- [x] Create `AdminAuthUseCase.java`
  - `login(request)` → US-A01
  - `validateToken(token)` → US-A02
  - `createAdmin(request)` → (매장 생성 시 함께)

**Request/Response DTOs**:
- [x] Create `AdminLoginRequest.java`
- [x] Create `AdminLoginResponse.java`
- [x] Create `CreateAdminRequest.java`

**Stories**: US-A01, US-A02, US-A03

#### Step 18: OrderNotification UseCase
- [x] Create `OrderNotificationUseCase.java`
  - `notifyNewOrder(order, storeId)` → US-A05
  - `notifyOrderStatusChanged(order, storeId)` → US-A05
  - `notifyOrderDeleted(orderId, storeId)` → US-A05

**Event DTOs**:
- [x] Create `OrderEvent.java`
- [x] Create `OrderItemEvent.java`
- [x] Create `OrderDeletedEvent.java`

**Stories**: US-A05

#### Step 19: Application Layer Unit Tests
- [ ] Test `SessionUseCase` (startSession, session reuse)
- [ ] Test `OrderUseCase` (createOrder, status transitions, validation)
- [ ] Test `MenuUseCase` (CRUD, cascade delete)
- [ ] Test `TableUseCase` (CRUD, session complete)
- [ ] Test `AdminAuthUseCase` (login, lockout)

**Stories**: N/A (Testing)

#### Step 20: Application Layer Summary
- [ ] Create `aidlc-docs/construction/table-order-api/code/application-layer-summary.md`

---

### Phase 5: Presentation Layer (Controllers)

#### Step 21: Customer Controllers
- [x] Create `CustomerSessionController.java`
  - `POST /api/customer/sessions` → startSession (US-C01)
  
- [x] Create `CustomerMenuController.java`
  - `GET /api/customer/categories` → getCategories (US-C02)
  - `GET /api/customer/categories/{categoryId}/menus` → getMenusByCategory (US-C02)
  - `GET /api/customer/menus/{menuId}` → getMenuDetail (US-C03)
  
- [x] Create `CustomerOrderController.java`
  - `POST /api/customer/orders` → createOrder (US-C10)
  - `GET /api/customer/orders` → getMyOrders (US-C13)

**Stories**: US-C01, US-C02, US-C03, US-C04, US-C10, US-C11, US-C12, US-C13

#### Step 22: Admin Controllers
- [x] Create `AdminAuthController.java`
  - `POST /api/admin/auth/login` → login (US-A01)
  
- [x] Create `AdminDashboardController.java`
  - `GET /api/admin/dashboard/tables` → getTablesWithOrders (US-A04)
  
- [x] Create `AdminOrderController.java`
  - `GET /api/admin/orders` → getAllOrders (US-A04)
  - `GET /api/admin/orders/{orderId}` → getOrderDetail (US-A06)
  - `PATCH /api/admin/orders/{orderId}/status` → updateStatus (US-A07)
  - `DELETE /api/admin/orders/{orderId}` → deleteOrder (US-A10)
  
- [x] Create `AdminTableController.java`
  - `GET /api/admin/tables` → getTables (US-A08)
  - `POST /api/admin/tables` → createTable (US-A08)
  - `PUT /api/admin/tables/{tableId}` → updateTable (US-A08)
  - `DELETE /api/admin/tables/{tableId}` → deleteTable (US-A08)
  - `POST /api/admin/tables/{tableId}/complete` → completeSession (US-A11)
  - `GET /api/admin/tables/{tableId}/history` → getOrderHistory (US-A12)
  
- [x] Create `AdminMenuController.java`
  - `GET /api/admin/categories` → getCategories (US-A15)
  - `POST /api/admin/categories` → createCategory (US-A15)
  - `PUT /api/admin/categories/{categoryId}` → updateCategory (US-A15)
  - `DELETE /api/admin/categories/{categoryId}` → deleteCategory (US-A15)
  - `GET /api/admin/menus` → getMenus (US-A15)
  - `POST /api/admin/menus` → createMenu (US-A16)
  - `PUT /api/admin/menus/{menuId}` → updateMenu (US-A17)
  - `DELETE /api/admin/menus/{menuId}` → deleteMenu (US-A18)
  - `PATCH /api/admin/menus/display-order` → updateDisplayOrder (US-A19)
  
- [x] Create `AdminStoreController.java`
  - `POST /api/admin/stores` → createStore (US-A13)
  - `GET /api/admin/stores/{storeId}` → getStore (US-A14)
  - `PUT /api/admin/stores/{storeId}` → updateStore (US-A14)
  
- [x] Create `AdminSseController.java`
  - `GET /api/admin/sse/orders` → subscribeOrders (US-A05)

**Stories**: US-A01, US-A02, US-A03, US-A04, US-A05, US-A06, US-A07, US-A08, US-A09, US-A10, US-A11, US-A12, US-A13, US-A14, US-A15, US-A16, US-A17, US-A18, US-A19

#### Step 23: Presentation Layer Unit Tests
- [ ] Test Customer Controllers (MockMvc)
- [ ] Test Admin Controllers (MockMvc)
- [ ] Test Authentication filters

**Stories**: N/A (Testing)

#### Step 24: Presentation Layer Summary
- [ ] Create `aidlc-docs/construction/table-order-api/code/presentation-layer-summary.md`

---

### Phase 6: Infrastructure Layer

#### Step 25: JPA Repository Implementations
- [x] Create JPA Entity annotations refinement (indexes, constraints)
- [x] Add custom query methods to repositories
- [x] Configure `DailyOrderSequenceRepository` with pessimistic lock

**Stories**: All stories requiring data access

#### Step 26: SSE Infrastructure
- [x] Create `SseEmitterManager.java`
- [x] Create `SseHeartbeatScheduler.java`

**Stories**: US-A05

#### Step 27: Scheduled Tasks
- [x] Create `SessionExpiryScheduler.java`

**Stories**: US-C01 (session expiry)

#### Step 28: Request Logging
- [ ] Create `RequestLoggingFilter.java`

**Stories**: N/A (Cross-cutting)

#### Step 29: Infrastructure Layer Unit Tests
- [ ] Test `SseEmitterManager`
- [ ] Test schedulers with mocks

**Stories**: N/A (Testing)

#### Step 30: Infrastructure Layer Summary
- [ ] Create `aidlc-docs/construction/table-order-api/code/infrastructure-layer-summary.md`

---

### Phase 7: Database Migration

#### Step 31: Database Schema
- [x] Create `src/main/resources/db/migration/V1__init_schema.sql` (Flyway)
  - All 10 tables with indexes and constraints
  - Foreign keys
  - Initial data (optional)

**Stories**: All stories require database

---

### Phase 8: API Documentation

#### Step 32: OpenAPI Configuration
- [x] Create `OpenApiConfig.java` (SpringDoc configuration)
- [x] Add OpenAPI annotations to controllers
- [ ] Create `aidlc-docs/construction/table-order-api/code/api-documentation.md`

**Stories**: N/A (Documentation)

---

### Phase 9: Deployment Artifacts

#### Step 33: Kubernetes Manifests
- [x] Create `k8s/deployment.yaml`
- [x] Create `k8s/service.yaml`
- [x] Create `k8s/ingress.yaml`
- [x] Create `k8s/configmap.yaml`
- [x] Create `k8s/secret.yaml`

**Stories**: N/A (Deployment)

#### Step 34: Dockerfile
- [x] Create `table-order-api/Dockerfile`

**Stories**: N/A (Deployment)

#### Step 35: Deployment Summary
- [ ] Create `aidlc-docs/construction/table-order-api/code/deployment-summary.md`

---

## Story Traceability

### Customer Stories Implementation Status

| Story ID | Title | Implementation Steps |
|----------|-------|---------------------|
| US-C01 | 주문 시작하기 | Step 2, 3, 4, 8, 12, 21 |
| US-C02 | 카테고리별 메뉴 보기 | Step 2, 4, 13, 21 |
| US-C03 | 메뉴 상세 정보 확인 | Step 2, 4, 13, 21 |
| US-C04 | 카테고리 간 빠른 이동 | Step 13, 21 |
| US-C10 | 주문 내역 확인 및 주문하기 | Step 2, 3, 4, 14, 21, 26 |
| US-C11 | 주문 성공 처리 | Step 7, 14, 21 |
| US-C12 | 주문 실패 처리 | Step 7, 14, 21 |
| US-C13 | 현재 세션 주문 내역 보기 | Step 2, 4, 14, 21 |

### Admin Stories Implementation Status

| Story ID | Title | Implementation Steps |
|----------|-------|---------------------|
| US-A01 | 관리자 로그인 | Step 2, 4, 8, 17, 22 |
| US-A02 | 세션 유지 | Step 8, 17, 22 |
| US-A03 | 로그인 시도 제한 | Step 2, 7, 17, 22 |
| US-A04 | 테이블별 주문 대시보드 보기 | Step 2, 4, 14, 15, 22 |
| US-A05 | 실시간 주문 업데이트 | Step 18, 22, 26 |
| US-A06 | 주문 상세 보기 | Step 2, 4, 14, 22 |
| US-A07 | 주문 상태 변경 | Step 2, 3, 14, 22 |
| US-A08 | 테이블 등록 | Step 2, 4, 9, 15, 22 |
| US-A09 | 테이블 태블릿 초기 설정 | Step 12, 15, 22 |
| US-A10 | 주문 삭제 (직권 수정) | Step 14, 18, 22 |
| US-A11 | 테이블 이용 완료 처리 | Step 2, 4, 15, 22 |
| US-A12 | 과거 주문 내역 조회 | Step 2, 4, 15, 22 |
| US-A13 | 매장 등록 | Step 2, 4, 16, 22 |
| US-A14 | 매장 정보 수정 | Step 2, 4, 16, 22 |
| US-A15 | 카테고리별 메뉴 조회 | Step 2, 4, 13, 22 |
| US-A16 | 메뉴 등록 | Step 2, 4, 13, 22 |
| US-A17 | 메뉴 수정 | Step 2, 4, 13, 22 |
| US-A18 | 메뉴 삭제 | Step 2, 4, 13, 22 |
| US-A19 | 메뉴 노출 순서 조정 | Step 13, 22 |

---

## Execution Summary

| Phase | Steps | Description |
|-------|-------|-------------|
| Phase 1 | Step 1 | Project Structure Setup |
| Phase 2 | Steps 2-6 | Domain Layer |
| Phase 3 | Steps 7-11 | Common (Cross-cutting) |
| Phase 4 | Steps 12-20 | Application Layer (UseCases) |
| Phase 5 | Steps 21-24 | Presentation Layer (Controllers) |
| Phase 6 | Steps 25-30 | Infrastructure Layer |
| Phase 7 | Step 31 | Database Migration |
| Phase 8 | Step 32 | API Documentation |
| Phase 9 | Steps 33-35 | Deployment Artifacts |

**Total Steps**: 35
**Total Files**: ~100+ (source + test + config + docs)
**Estimated Scope**: Large (Backend MVP complete implementation)

---

## Notes

1. 모든 코드는 `table-order-api/` 디렉토리에 생성됩니다 (aidlc-docs/ 아님).
2. 테스트는 각 레이어 완료 후 작성됩니다.
3. 문서 요약은 `aidlc-docs/construction/table-order-api/code/`에 작성됩니다.
4. 각 Step 완료 시 즉시 checkbox를 [x]로 업데이트합니다.
5. Security Baseline Extension이 활성화되어 있으므로 보안 관련 구현에 주의합니다.

