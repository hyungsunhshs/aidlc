# Application Design - 통합 문서

## Overview
테이블오더 서비스의 애플리케이션 설계 통합 문서입니다.

---

## 1. 설계 결정 사항

### 1.1 기술 스택 요약

| 영역 | 선택 |
|------|------|
| **Backend Architecture** | Modular Monolith (Layer-based) |
| **Module Communication** | Interface-based (느슨한 결합) |
| **API Style** | REST + SSE (실시간 알림) |
| **API Separation** | 별도 모듈로 완전 분리 (Customer/Admin) |
| **Data Access** | Spring Data JPA |
| **Transaction** | Use Case Layer (Application Service) |
| **Frontend State** | React Context + useState |
| **HTTP Client** | Axios |
| **Real-time** | Spring MVC SseEmitter |

### 1.2 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              System Architecture                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────┐                              ┌─────────────┐            │
│    │  Customer   │                              │   Admin     │            │
│    │   App       │                              │    App      │            │
│    │  (React)    │                              │  (React)    │            │
│    └──────┬──────┘                              └──────┬──────┘            │
│           │                                            │                    │
│           │  REST API                    REST API + SSE│                    │
│           │                                            │                    │
│           └────────────────────┬───────────────────────┘                    │
│                                │                                            │
│                                ▼                                            │
│    ┌───────────────────────────────────────────────────────────────────┐   │
│    │                     Backend (Spring Boot)                         │   │
│    │  ┌─────────────────────────────────────────────────────────────┐  │   │
│    │  │                   Presentation Layer                        │  │   │
│    │  │  ┌───────────────────┐    ┌───────────────────┐            │  │   │
│    │  │  │  Customer Module  │    │   Admin Module    │            │  │   │
│    │  │  │  (Controllers)    │    │  (Controllers)    │            │  │   │
│    │  │  └───────────────────┘    └───────────────────┘            │  │   │
│    │  └─────────────────────────────────────────────────────────────┘  │   │
│    │  ┌─────────────────────────────────────────────────────────────┐  │   │
│    │  │                   Application Layer                         │  │   │
│    │  │            (Use Cases - @Transactional)                    │  │   │
│    │  └─────────────────────────────────────────────────────────────┘  │   │
│    │  ┌─────────────────────────────────────────────────────────────┐  │   │
│    │  │                      Domain Layer                           │  │   │
│    │  │         (Entities, Repository Interfaces)                   │  │   │
│    │  └─────────────────────────────────────────────────────────────┘  │   │
│    │  ┌─────────────────────────────────────────────────────────────┐  │   │
│    │  │                   Infrastructure Layer                      │  │   │
│    │  │        (JPA Repositories, Security, S3, SSE)               │  │   │
│    │  └─────────────────────────────────────────────────────────────┘  │   │
│    └───────────────────────────────────────────────────────────────────┘   │
│                                │                                            │
│                                ▼                                            │
│    ┌───────────────────────────────────────────────────────────────────┐   │
│    │                      PostgreSQL + AWS S3                          │   │
│    └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 컴포넌트 요약

### 2.1 Backend Components

| Layer | Components |
|-------|------------|
| **Presentation (Customer)** | SessionController, MenuController, OrderController |
| **Presentation (Admin)** | AuthController, DashboardController, OrderManagementController, TableManagementController, MenuManagementController, StoreController, SseController |
| **Application** | SessionUseCase, MenuUseCase, OrderUseCase, TableUseCase, StoreUseCase, AdminAuthUseCase, OrderNotificationUseCase |
| **Domain** | 9 Entities, 9 Repository Interfaces |
| **Infrastructure** | JPA Repositories, JwtTokenProvider, SseEmitterManager, S3ImageService, SecurityConfig |

### 2.2 Frontend Components

| App | Pages | Contexts |
|-----|-------|----------|
| **Customer** | StartSessionPage, MenuPage, CartPage, OrderHistoryPage | SessionContext, CartContext |
| **Admin** | LoginPage, DashboardPage, MenuManagementPage, TableManagementPage, StoreInfoPage | AuthContext |

---

## 3. 도메인 모델

### 3.1 Entity Relationship

```
┌─────────┐       ┌─────────┐       ┌──────────────┐
│  Store  │───────│  Table  │───────│ TableSession │
└─────────┘ 1   N └─────────┘ 1   N └──────────────┘
     │                                     │
     │ 1                                   │ 1
     │                                     │
     N                                     N
┌─────────┐       ┌─────────┐       ┌─────────┐
│Category │───────│  Menu   │◄──────│  Order  │
└─────────┘ 1   N └─────────┘       └─────────┘
                       │                 │
                       │ 1               │ 1
                       │                 │
                       └────────┬────────┘
                                │
                                N
                         ┌───────────┐
                         │ OrderItem │
                         └───────────┘

┌─────────┐       ┌──────────────┐
│  Admin  │       │ OrderHistory │
└─────────┘       └──────────────┘
     │
     N
     │
┌─────────┐
│  Store  │
└─────────┘
```

### 3.2 Core Entities

| Entity | Key Attributes |
|--------|----------------|
| **Store** | id, name, identifier |
| **Table** | id, storeId, tableNumber, passwordHash |
| **TableSession** | id, tableId, startedAt, endedAt, status |
| **Category** | id, storeId, name, displayOrder |
| **Menu** | id, categoryId, name, price, description, imageUrl, displayOrder |
| **Order** | id, sessionId, orderNumber, status, totalAmount, createdAt |
| **OrderItem** | id, orderId, menuId, quantity, unitPrice |
| **OrderHistory** | id, tableId, orderData, completedAt |
| **Admin** | id, storeId, username, passwordHash |

---

## 4. API 엔드포인트 요약

### 4.1 Customer API (`/api/customer/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions` | 테이블 세션 시작 |
| GET | `/sessions/current` | 현재 세션 조회 |
| GET | `/menus/categories` | 카테고리 목록 |
| GET | `/menus` | 메뉴 목록 |
| POST | `/orders` | 주문 생성 |
| GET | `/orders` | 세션 주문 목록 |

### 4.2 Admin API (`/api/admin/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | 로그인 |
| POST | `/auth/logout` | 로그아웃 |
| GET | `/dashboard/stats` | 대시보드 통계 |
| GET | `/dashboard/tables` | 테이블 현황 |
| PATCH | `/orders/{id}/status` | 주문 상태 변경 |
| DELETE | `/orders/{id}` | 주문 삭제 |
| POST | `/tables` | 테이블 등록 |
| POST | `/tables/{id}/complete` | 이용 완료 |
| GET | `/tables/{id}/history` | 과거 내역 |
| POST | `/menus` | 메뉴 등록 |
| PUT | `/menus/{id}` | 메뉴 수정 |
| DELETE | `/menus/{id}` | 메뉴 삭제 |
| GET | `/sse/orders` | 실시간 주문 스트림 |

---

## 5. 보안 설계

### 5.1 인증 방식

| 대상 | 방식 | 만료 |
|------|------|------|
| **Customer (테이블 태블릿)** | 테이블 비밀번호 + 세션 토큰 | 16시간 |
| **Admin** | JWT Access Token | 16시간 |

### 5.2 보안 요구사항 (Security Extension)

- 비밀번호 bcrypt 해싱
- 로그인 시도 제한 (5회 실패 시 15분 잠금)
- JWT 서버 사이드 검증
- HTTPS 강제 (TLS 1.2+)
- CORS 제한 설정
- 입력 검증 (모든 API)
- SQL Injection 방지 (JPA 파라미터 바인딩)

---

## 6. 실시간 통신

### 6.1 SSE 구현

```java
// SseEmitter 기반 실시간 주문 알림
@GetMapping(value = "/sse/orders", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter subscribeOrders(@RequestParam Long storeId) {
    SseEmitter emitter = new SseEmitter(TIMEOUT);
    sseEmitterManager.addEmitter(storeId, emitter);
    return emitter;
}
```

### 6.2 이벤트 타입

| Event Type | Trigger | Data |
|------------|---------|------|
| `NEW_ORDER` | 주문 생성 시 | Order 정보 |
| `ORDER_STATUS_CHANGED` | 주문 상태 변경 시 | Order 정보 |
| `ORDER_DELETED` | 주문 삭제 시 | Order ID |

---

## 7. 상세 설계 문서

다음 문서에서 상세 내용을 확인할 수 있습니다:

| 문서 | 내용 |
|------|------|
| [components.md](./components.md) | 컴포넌트 정의 및 책임 |
| [component-methods.md](./component-methods.md) | 메서드 시그니처 |
| [services.md](./services.md) | 서비스 레이어 및 오케스트레이션 |
| [component-dependency.md](./component-dependency.md) | 의존성 관계 및 데이터 흐름 |

---

## 8. 다음 단계

Application Design이 완료되면 다음 단계로 진행합니다:

1. **Units Generation**: 개발 단위 분할 및 의존성 정의
2. **CONSTRUCTION Phase**: 각 Unit별 상세 설계 및 구현
