# Component Dependencies

## Overview
컴포넌트 간 의존성 관계 및 통신 패턴을 정의합니다.

---

## 1. Backend Layer Dependencies

### 1.1 Dependency Direction (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    Presentation ───────────────────────────────────────────►    │
│         │                                                       │
│         │  depends on                                           │
│         ▼                                                       ��
│    Application ────────────────────────────────────────────►    │
│         │                                                       │
│         │  depends on                                           │
│         ▼                                                       │
│      Domain ◄──────────────────────────────────────────────     │
│         ▲                                                       │
│         │  implements                                           │
│         │                                                       │
│   Infrastructure ──────────────────────────────────────────►    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend:
  ───────► : depends on (compile-time dependency)
  Domain   : Core layer (no outward dependencies)
```

### 1.2 Module Dependencies

```
┌───────────────────────────────────────────────────────────────────┐
│                        Backend Modules                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐          ┌─────────────────┐                │
│  │ customer-module │          │  admin-module   │                │
│  │  (Presentation) │          │  (Presentation) │                │
│  └────────┬────────┘          └────────┬────────┘                │
│           │                            │                          │
│           └────────────┬───────────────┘                          │
│                        │                                          │
│                        ▼                                          │
│           ┌────────────────────────┐                              │
│           │   application-module   │                              │
│           │     (Use Cases)        │                              │
│           └────────────┬───────────┘                              │
│                        │                                          │
│                        ▼                                          │
│           ┌────────────────────────┐                              │
│           │     domain-module      │                              │
│           │ (Entities, Interfaces) │                              │
│           └────────────────────────┘                              │
│                        ▲                                          │
│                        │ implements                               │
│           ┌────────────────────────┐                              │
│           │ infrastructure-module  │                              │
│           │   (JPA, Security)      │                              │
│           └────────────────────────┘                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Dependency Matrix

### 2.1 Presentation → Application

| Presentation Component | Application Dependency |
|------------------------|------------------------|
| `SessionController` | `SessionUseCase` |
| `MenuController` | `MenuUseCase` |
| `OrderController` | `OrderUseCase` |
| `AuthController` | `AdminAuthUseCase` |
| `DashboardController` | `OrderUseCase`, `TableUseCase` |
| `OrderManagementController` | `OrderUseCase` |
| `TableManagementController` | `TableUseCase`, `SessionUseCase` |
| `MenuManagementController` | `MenuUseCase` |
| `StoreController` | `StoreUseCase` |
| `SseController` | `OrderNotificationUseCase` |

### 2.2 Application → Domain (Interfaces)

| Application Component | Domain Interface Dependencies |
|----------------------|------------------------------|
| `SessionUseCaseImpl` | `TableRepository`, `TableSessionRepository` |
| `MenuUseCaseImpl` | `MenuRepository`, `CategoryRepository`, `StoreRepository` |
| `OrderUseCaseImpl` | `OrderRepository`, `OrderItemRepository`, `MenuRepository`, `TableSessionRepository`, `OrderHistoryRepository` |
| `TableUseCaseImpl` | `TableRepository`, `TableSessionRepository`, `OrderRepository`, `OrderHistoryRepository`, `StoreRepository` |
| `StoreUseCaseImpl` | `StoreRepository` |
| `AdminAuthUseCaseImpl` | `AdminRepository`, `StoreRepository` |
| `OrderNotificationUseCaseImpl` | (No repository dependency - manages SSE emitters) |

### 2.3 Infrastructure → Domain (Implementations)

| Infrastructure Component | Implements Domain Interface |
|-------------------------|----------------------------|
| `JpaStoreRepository` | `StoreRepository` |
| `JpaTableRepository` | `TableRepository` |
| `JpaTableSessionRepository` | `TableSessionRepository` |
| `JpaCategoryRepository` | `CategoryRepository` |
| `JpaMenuRepository` | `MenuRepository` |
| `JpaOrderRepository` | `OrderRepository` |
| `JpaOrderItemRepository` | `OrderItemRepository` |
| `JpaOrderHistoryRepository` | `OrderHistoryRepository` |
| `JpaAdminRepository` | `AdminRepository` |

---

## 3. Data Flow Diagrams

### 3.1 Customer Order Flow

```
┌──────────┐    HTTP     ┌────────────┐    Call    ┌─────────────┐
│ Customer │ ─────────►  │  Order     │ ────────►  │ OrderUse    │
│   App    │             │ Controller │            │   Case      │
└──────────┘             └────────────┘            └──────┬──────┘
                                                          │
                              ┌────────────────────────────┤
                              │                            │
                              ▼                            ▼
                    ┌─────────────────┐          ┌─────────────────┐
                    │ SessionRepo     │          │   MenuRepo      │
                    │ (validate)      │          │ (get prices)    │
                    └─────────────────┘          └─────────────────┘
                              │                            │
                              └────────────────────────────┤
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │   OrderRepo     │
                                                 │    (save)       │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ Notification    │
                                                 │  UseCase (SSE)  │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Admin App      │
                                                 │  (Dashboard)    │
                                                 └─────────────────┘
```

### 3.2 Admin Authentication Flow

```
┌──────────┐    HTTP     ┌────────────┐    Call    ┌─────────────┐
│  Admin   │ ─────────►  │   Auth     │ ────────►  │ AdminAuth   │
│   App    │             │ Controller │            │  UseCase    │
└──────────┘             └────────────┘            └──────┬──────┘
                                                          │
                    ┌─────────────────────────────────────┤
                    │                                     │
                    ▼                                     ▼
          ┌─────────────────┐                   ┌─────────────────┐
          │   StoreRepo     │                   │   AdminRepo     │
          │ (find by id)    │                   │ (find by user)  │
          └─────────────────┘                   └─────────────────┘
                    │                                     │
                    └─────────────────────────────────────┤
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ PasswordEncoder │
                                                 │   (verify)      │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ JwtTokenProvider│
                                                 │  (generate)     │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Admin App      │
                                                 │  (JWT Token)    │
                                                 └─────────────────┘
```

### 3.3 Real-time Order Notification Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      SSE Connection Flow                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     GET /sse/orders     ┌─────────────────┐       │
│  │  Admin   │ ─────────────────────►  │  SseController  │       │
│  │   App    │                         └────────┬────────┘       │
│  └──────────┘                                  │                 │
│       ▲                                        ▼                 │
│       │                              ┌─────────────────────┐     │
│       │                              │ OrderNotification   │     │
│       │                              │     UseCase         │     │
│       │                              └────────┬────────────┘     │
│       │                                       │                  │
│       │                                       ▼                  │
│       │                              ┌─────────────────────┐     │
│       │                              │  SseEmitterManager  │     │
│       │                              │  (store emitter)    │     │
│       │                              └─────────────────────┘     │
│       │                                                          │
│       │  SSE Event: { type: "NEW_ORDER", data: {...} }          │
│       └──────────────────────────────────────────────────────    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      Order Event Broadcast                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    createOrder()    ┌─────────────────┐       │
│  │ OrderUseCase │ ─────────────────►  │ OrderNotification│       │
│  │              │                     │    UseCase       │       │
│  └──────────────┘                     └────────┬────────┘       │
│                                                │                 │
│                                                ▼                 │
│                                       ┌─────────────────┐        │
│                                       │SseEmitterManager│        │
│                                       └────────┬────────┘        │
│                                                │                 │
│                         ┌──────────────────────┼──────────────┐  │
│                         ▼                      ▼              ▼  │
│                   ┌──────────┐          ┌──────────┐    ┌──────┐ │
│                   │ Admin 1  │          │ Admin 2  │    │Admin │ │
│                   │ (SSE)    │          │ (SSE)    │    │ N    │ │
│                   └──────────┘          └──────────┘    └──────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Frontend Dependencies

### 4.1 Customer App Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                      Customer App                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    Pages                                                        │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │ StartSession    │    │   MenuPage      │                  │
│    │    Page         │    │                 │                  │
│    └───────┬─────────┘    └───────┬─────────┘                  │
│            │                      │                             │
│            ▼                      ▼                             │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │ SessionContext  │    │  useMenu hook   │                  │
│    └───────┬─────────┘    └───────┬─────────┘                  │
│            │                      │                             │
│            └──────────────────────┤                             │
│                                   ▼                             │
│                          ┌─────────────────┐                    │
│                          │   api.ts        │                    │
│                          │   (Axios)       │                    │
│                          └───────┬─────────┘                    │
│                                  │                              │
│                                  ▼                              │
│                          ┌─────────────────┐                    │
│                          │  Backend API    │                    │
│                          └─────────────────┘                    │
│                                                                 │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │   CartPage      │    │ OrderHistory    │                  │
│    │                 │    │    Page         │                  │
│    └───────┬─────────┘    └───────┬─────────┘                  │
│            │                      │                             │
│            ▼                      ▼                             │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │  CartContext    │    │ useOrders hook  │                  │
│    │ (localStorage)  │    │                 │                  │
│    └─────────────────┘    └─────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Admin App Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin App                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    Pages                                                        │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │   LoginPage     │    │  DashboardPage  │                  │
│    │                 │    │                 │                  │
│    └───────┬─────────┘    └───────┬─────────┘                  │
│            │                      │                             │
│            ▼                      ▼                             │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │  AuthContext    │    │ useDashboard    │                  │
│    │  (JWT Token)    │    │   useSSE        │                  │
│    └───────┬─────────┘    └───────┬─────────┘                  │
│            │                      │                             │
│            │                      ├───────────────────┐         │
│            │                      │                   │         │
│            │                      ▼                   ▼         │
│            │             ┌─────────────────┐  ┌─────────────┐  │
│            │             │   api.ts        │  │   sse.ts    │  │
│            │             │   (Axios)       │  │(EventSource)│  │
│            │             └───────┬─────────┘  └──────┬──────┘  │
│            │                     │                   │          │
│            └─────────────────────┼───────────────────┘          │
│                                  │                              │
│                                  ▼                              │
│                          ┌─────────────────┐                    │
│                          │  Backend API    │                    │
│                          └─────────────────┘                    │
│                                                                 │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │ MenuManagement  │    │TableManagement  │                  │
│    │    Page         │    │    Page         │                  │
│    └───────┬─────────┘    └───────┬─────────┘                  │
│            │                      │                             │
│            ▼                      ▼                             │
│    ┌─────────────────┐    ┌─────────────────┐                  │
│    │useMenuManagement│    │useTableManage   │                  │
│    │                 │    │   ment          │                  │
│    └─────────────────┘    └─────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Communication Patterns

### 5.1 Backend Internal Communication

| Pattern | Description | Usage |
|---------|-------------|-------|
| **Interface-based DI** | 인터페이스를 통한 의존성 주입 | 모든 레이어 간 통신 |
| **Method Call** | 동기 메서드 호출 | Use Case → Repository |
| **Event Publish** | SSE 이벤트 발행 | OrderUseCase → Notification |

### 5.2 Frontend-Backend Communication

| Pattern | Description | Usage |
|---------|-------------|-------|
| **REST API** | HTTP 요청/응답 | 모든 CRUD 작업 |
| **SSE** | Server-Sent Events | 실시간 주문 알림 (Admin) |

### 5.3 State Management

| App | Pattern | Storage |
|-----|---------|---------|
| Customer | React Context | localStorage (장바구니, 세션) |
| Admin | React Context | sessionStorage (JWT 토큰) |

---

## 6. External Dependencies

### 6.1 Backend External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **PostgreSQL** | 데이터 저장 | Spring Data JPA |
| **AWS S3** | 이미지 저장 | AWS SDK |

### 6.2 Frontend External Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.x |
| **Axios** | HTTP Client | 1.x |
| **React Router** | Routing | 6.x |
