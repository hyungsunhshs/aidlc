# Unit of Work Definition

## Overview
테이블오더 서비스의 개발 단위(Unit of Work) 정의입니다. 시스템은 3개의 Unit으로 구성되며, API-Contract First 방식으로 병렬 개발됩니다.

---

## Unit Summary

| Unit | Name | Technology | Deployment |
|------|------|------------|------------|
| **Unit 1** | table-order-api | Java 17 + Spring Boot 3 | AWS EKS (Container) |
| **Unit 2** | customer-ordering-app | React + TypeScript | AWS S3 + CloudFront (Static) |
| **Unit 3** | store-management-app | React + TypeScript | AWS S3 + CloudFront (Static) |

---

## Unit 1: table-order-api

### Basic Information
- **Name**: table-order-api
- **Type**: Backend API Service
- **Technology**: Java 17, Spring Boot 3.x, PostgreSQL
- **Deployment**: AWS EKS Automode

### Scope & Responsibilities

```
+-------------------------------------------------------------------+
|                        table-order-api                            |
+-------------------------------------------------------------------+
|  Presentation Layer                                               |
|  +-----------------------------+  +-----------------------------+ |
|  |     Customer API Module     |  |      Admin API Module       | |
|  |  - SessionController        |  |  - AuthController           | |
|  |  - MenuController           |  |  - DashboardController      | |
|  |  - OrderController          |  |  - OrderManagementController| |
|  |                             |  |  - TableManagementController| |
|  |                             |  |  - MenuManagementController | |
|  |                             |  |  - StoreController          | |
|  |                             |  |  - SseController            | |
|  +-----------------------------+  +-----------------------------+ |
+-------------------------------------------------------------------+
|  Application Layer (Use Cases)                                    |
|  +-------------------------------------------------------------+  |
|  | SessionUseCase | MenuUseCase | OrderUseCase | TableUseCase  |  |
|  | StoreUseCase | AdminAuthUseCase | OrderNotificationUseCase  |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
|  Domain Layer                                                     |
|  +-------------------------------------------------------------+  |
|  | Entities: Store, Table, TableSession, Category, Menu,       |  |
|  |           Order, OrderItem, OrderHistory, Admin             |  |
|  | Repository Interfaces                                        |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
|  Infrastructure Layer                                             |
|  +-------------------------------------------------------------+  |
|  | JPA Repositories | JwtTokenProvider | SseEmitterManager     |  |
|  | S3ImageService | SecurityConfig                             |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
```

### Included Components

| Layer | Components |
|-------|------------|
| **Customer API** | SessionController, MenuController, OrderController |
| **Admin API** | AuthController, DashboardController, OrderManagementController, TableManagementController, MenuManagementController, StoreController, SseController |
| **Application** | SessionUseCase, MenuUseCase, OrderUseCase, TableUseCase, StoreUseCase, AdminAuthUseCase, OrderNotificationUseCase |
| **Domain** | 9 Entities, 9 Repository Interfaces |
| **Infrastructure** | JPA Repositories, JWT, SSE, S3, Security |

### API Contracts (Interfaces)

#### Customer API (`/api/customer/*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customer/sessions` | 테이블 세션 시작 |
| GET | `/api/customer/sessions/current` | 현재 세션 조회 |
| GET | `/api/customer/menus/categories` | 카테고리 목록 |
| GET | `/api/customer/menus` | 메뉴 목록 |
| POST | `/api/customer/orders` | 주문 생성 |
| GET | `/api/customer/orders` | 세션 주문 목록 |

#### Admin API (`/api/admin/*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | 로그인 |
| POST | `/api/admin/auth/logout` | 로그아웃 |
| GET | `/api/admin/dashboard/stats` | 대시보드 통계 |
| GET | `/api/admin/dashboard/tables` | 테이블 현황 |
| GET | `/api/admin/orders` | 주문 목록 |
| PATCH | `/api/admin/orders/{id}/status` | 주문 상태 변경 |
| DELETE | `/api/admin/orders/{id}` | 주문 삭제 |
| GET | `/api/admin/tables` | 테이블 목록 |
| POST | `/api/admin/tables` | 테이블 등록 |
| POST | `/api/admin/tables/{id}/complete` | 이용 완료 |
| GET | `/api/admin/tables/{id}/history` | 과거 내역 |
| GET | `/api/admin/menus` | 메뉴 목록 (관리용) |
| POST | `/api/admin/menus` | 메뉴 등록 |
| PUT | `/api/admin/menus/{id}` | 메뉴 수정 |
| DELETE | `/api/admin/menus/{id}` | 메뉴 삭제 |
| PATCH | `/api/admin/menus/order` | 메뉴 순서 변경 |
| GET | `/api/admin/categories` | 카테고리 목록 |
| POST | `/api/admin/categories` | 카테고리 등록 |
| PUT | `/api/admin/categories/{id}` | 카테고리 수정 |
| DELETE | `/api/admin/categories/{id}` | 카테고리 삭제 |
| GET | `/api/admin/store` | 매장 정보 조회 |
| PUT | `/api/admin/store` | 매장 정보 수정 |
| GET | `/api/admin/sse/orders` | 실시간 주문 스트림 (SSE) |

### External Dependencies
- PostgreSQL (Database)
- AWS S3 (Image Storage)

---

## Unit 2: customer-ordering-app

### Basic Information
- **Name**: customer-ordering-app
- **Type**: Frontend SPA (Single Page Application)
- **Technology**: React 18, TypeScript, Vite
- **Deployment**: AWS S3 + CloudFront

### Scope & Responsibilities

```
+-------------------------------------------------------------------+
|                     customer-ordering-app                         |
+-------------------------------------------------------------------+
|  Pages                                                            |
|  +--------------------+  +--------------------+                   |
|  | StartSessionPage   |  |    MenuPage        |                   |
|  | - 주문 시작 버튼     |  | - 카테고리 탭       |                   |
|  | - 세션 생성         |  | - 메뉴 그리드       |                   |
|  +--------------------+  +--------------------+                   |
|  +--------------------+  +--------------------+                   |
|  |    CartPage        |  | OrderHistoryPage   |                   |
|  | - 장바구니 목록      |  | - 주문 내역         |                   |
|  | - 수량 조절         |  | - 주문 상태         |                   |
|  | - 주문하기          |  |                    |                   |
|  +--------------------+  +--------------------+                   |
+-------------------------------------------------------------------+
|  State Management (React Context)                                 |
|  +-----------------------------+  +-----------------------------+ |
|  |      SessionContext         |  |       CartContext           | |
|  | - sessionId                 |  | - cartItems                 | |
|  | - tableInfo                 |  | - add/remove/update         | |
|  +-----------------------------+  +-----------------------------+ |
+-------------------------------------------------------------------+
|  Services                                                         |
|  +-------------------------------------------------------------+  |
|  |  api.ts (Axios)                                             |  |
|  |  - Customer API 호출                                         |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
```

### Included Components

| Category | Components |
|----------|------------|
| **Pages** | StartSessionPage, MenuPage, CartPage, OrderHistoryPage |
| **Menu Components** | CategoryTabs, MenuCard, MenuGrid |
| **Cart Components** | CartItem, CartSummary, QuantityControl |
| **Order Components** | OrderCard, OrderStatus, OrderSuccessModal |
| **Common Components** | Button, Modal, Loading |
| **Contexts** | SessionContext, CartContext |
| **Hooks** | useMenu, useCart, useOrders |
| **Services** | api.ts (Axios instance) |

### API Dependencies
- `table-order-api` Customer API (`/api/customer/*`)

### Key Features
- 테이블 세션 관리
- 카테고리별 메뉴 탐색
- 장바구니 관리 (로컬 저장)
- 주문 생성 및 확인
- 주문 내역 조회

---

## Unit 3: store-management-app

### Basic Information
- **Name**: store-management-app
- **Type**: Frontend SPA (Single Page Application)
- **Technology**: React 18, TypeScript, Vite
- **Deployment**: AWS S3 + CloudFront

### Scope & Responsibilities

```
+-------------------------------------------------------------------+
|                     store-management-app                          |
+-------------------------------------------------------------------+
|  Pages                                                            |
|  +--------------------+  +--------------------+                   |
|  |    LoginPage       |  |   DashboardPage    |                   |
|  | - 로그인 폼         |  | - 테이블 그리드     |                   |
|  | - JWT 토큰 관리     |  | - 주문 현황         |                   |
|  |                    |  | - 실시간 업데이트   |                   |
|  +--------------------+  +--------------------+                   |
|  +--------------------+  +--------------------+                   |
|  |MenuManagementPage  |  |TableManagementPage |                   |
|  | - 메뉴 CRUD        |  | - 테이블 목록       |                   |
|  | - 카테고리 관리     |  | - 테이블 설정       |                   |
|  | - 순서 조정         |  | - 이용 완료        |                   |
|  +--------------------+  +--------------------+                   |
|  +--------------------+                                           |
|  |   StoreInfoPage    |                                           |
|  | - 매장 정보 조회    |                                           |
|  | - 매장 정보 수정    |                                           |
|  +--------------------+                                           |
+-------------------------------------------------------------------+
|  State Management (React Context)                                 |
|  +-------------------------------------------------------------+  |
|  |                      AuthContext                            |  |
|  | - JWT token | login/logout | storeInfo                      |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
|  Services                                                         |
|  +-----------------------------+  +-----------------------------+ |
|  |     api.ts (Axios)          |  |     sse.ts (EventSource)    | |
|  | - Admin API 호출             |  | - 실시간 주문 수신           | |
|  +-----------------------------+  +-----------------------------+ |
+-------------------------------------------------------------------+
```

### Included Components

| Category | Components |
|----------|------------|
| **Pages** | LoginPage, DashboardPage, MenuManagementPage, TableManagementPage, StoreInfoPage |
| **Dashboard Components** | StatCard, TableCard, OrderDetailModal |
| **Menu Components** | MenuTable, MenuForm, CategoryManager |
| **Table Components** | TableGrid, TableSetupModal, OrderHistoryModal |
| **Store Components** | StoreInfoCard, StoreForm |
| **Common Components** | Button, Modal, Table, Sidebar, Header |
| **Contexts** | AuthContext |
| **Hooks** | useAuth, useOrders, useSSE, useMenu, useTables |
| **Services** | api.ts (Axios), sse.ts (EventSource) |

### API Dependencies
- `table-order-api` Admin API (`/api/admin/*`)
- `table-order-api` SSE Endpoint (`/api/admin/sse/orders`)

### Key Features
- 관리자 인증 (JWT)
- 실시간 주문 대시보드 (SSE)
- 주문 상태 관리
- 테이블 관리
- 메뉴/카테고리 CRUD
- 매장 정보 관리

---

## Code Organization Strategy (Greenfield)

### Project Directory Structure

```
table-order/                              # Workspace Root
├── table-order-api/                      # Unit 1: Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/tableorder/
│   │       │   ├── api/
│   │       │   │   ├── customer/         # Customer API Module
│   │       │   │   │   ├── controller/
│   │       │   │   │   └── dto/
│   │       │   │   └── admin/            # Admin API Module
│   │       │   │       ├── controller/
│   │       │   │       └── dto/
│   │       │   ├── application/          # Application Layer
│   │       │   │   └── usecase/
│   │       │   ├── domain/               # Domain Layer
│   │       │   │   ├── entity/
│   │       │   │   └── repository/
│   │       │   ├── infrastructure/       # Infrastructure Layer
│   │       │   │   ├── persistence/
│   │       │   │   ├── security/
│   │       │   │   └── sse/
│   │       │   └── common/               # Common Utilities
│   │       └── resources/
│   │           └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── customer-ordering-app/                # Unit 2: Customer Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   └── order/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── store-management-app/                 # Unit 3: Admin Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── menu/
│   │   │   ├── table/
│   │   │   └── store/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docs/                                 # API Documentation
│   └── openapi/
│       ├── customer-api.yaml
│       └── admin-api.yaml
│
├── aidlc-docs/                           # AI-DLC Documentation
│   └── ...
│
└── docker-compose.yml                    # Local Development
```

### Technology Stack Summary

| Unit | Build Tool | Test Framework | Linting |
|------|------------|----------------|---------|
| **table-order-api** | Gradle | JUnit 5 + Mockito | Checkstyle |
| **customer-ordering-app** | Vite | Vitest + React Testing Library | ESLint + Prettier |
| **store-management-app** | Vite | Vitest + React Testing Library | ESLint + Prettier |

---

## Development Approach: API-Contract First

### Phase 1: API Contract Definition
1. OpenAPI 명세 작성 (`docs/openapi/`)
2. API 엔드포인트, 요청/응답 스키마 정의
3. 팀 리뷰 및 승인

### Phase 2: Parallel Development
```
           +------------------------+
           |  OpenAPI Specification |
           |  (Customer + Admin)    |
           +------------------------+
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
+---------------+ +---------------+ +---------------+
| table-order-  | | customer-     | | store-        |
| api           | | ordering-app  | | management-   |
| (Backend)     | | (Frontend)    | | app           |
+---------------+ +---------------+ +---------------+
        |             |             |
        v             v             v
+---------------------------------------------------+
|              Integration Testing                   |
+---------------------------------------------------+
```

### Phase 3: Integration
1. Backend API 완성
2. Frontend들과 통합 테스트
3. E2E 테스트

---

## Notes

- 모든 Unit은 동일한 PostgreSQL 인스턴스 공유
- Backend는 Customer/Admin API를 모두 포함하는 단일 배포 단위
- Frontend는 각각 독립적인 정적 사이트로 배포
- API-Contract First로 병렬 개발 가능
- 로컬 개발 시 docker-compose로 전체 스택 실행

