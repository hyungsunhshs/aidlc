# Components Definition

## Overview
테이블오더 서비스의 컴포넌트 정의입니다. Layer-based 아키텍처를 기반으로 구성됩니다.

---

## 1. Backend Components

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                         │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  Customer Module    │  │   Admin Module      │              │
│  │  (REST Controllers) │  │  (REST Controllers) │              │
│  └─────────────────────┘  └─────────────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                      Application Layer                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Use Cases (Services)                  │   │
│  │  - SessionUseCase    - OrderUseCase    - MenuUseCase    │   │
│  │  - TableUseCase      - StoreUseCase    - AdminUseCase   │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                        Domain Layer                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Entities: Store, Table, TableSession, Menu, Category,  │   │
│  │            Order, OrderItem, OrderHistory, Admin         │   │
│  │  Interfaces: Repository Interfaces, Service Interfaces  │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - JPA Repositories    - S3 Client    - SSE Emitter     │   │
│  │  - Security Config     - JWT Provider                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Presentation Layer

#### 1.2.1 Customer Module
| 컴포넌트 | 책임 |
|----------|------|
| `SessionController` | 테이블 세션 시작/종료 API |
| `MenuController` | 메뉴 조회 API |
| `CartController` | 장바구니 관련 API (선택적, 프론트엔드 로컬 처리 가능) |
| `OrderController` | 주문 생성/조회 API |

#### 1.2.2 Admin Module
| 컴포넌트 | 책임 |
|----------|------|
| `AuthController` | 관리자 로그인/로그아웃 API |
| `DashboardController` | 대시보드 데이터 조회 API |
| `OrderManagementController` | 주문 상태 변경/삭제 API |
| `TableManagementController` | 테이블 관리 API |
| `MenuManagementController` | 메뉴 CRUD API |
| `StoreController` | 매장 정보 관리 API |
| `SseController` | SSE 실시간 주문 스트림 |

### 1.3 Application Layer (Use Cases)

| 컴포넌트 | 책임 |
|----------|------|
| `SessionUseCase` | 테이블 세션 생성/종료 비즈니스 로직 |
| `MenuUseCase` | 메뉴 조회/관리 비즈니스 로직 |
| `OrderUseCase` | 주문 생성/상태 변경/삭제 비즈니스 로직 |
| `TableUseCase` | 테이블 등록/설정/이용완료 비즈니스 로직 |
| `StoreUseCase` | 매장 등록/수정 비즈니스 로직 |
| `AdminAuthUseCase` | 관리자 인증/세션 비즈니스 로직 |
| `OrderNotificationUseCase` | 실시간 주문 알림 비즈니스 로직 |

### 1.4 Domain Layer

#### 1.4.1 Entities
| 엔티티 | 책임 |
|--------|------|
| `Store` | 매장 정보 (매장명, 식별자) |
| `Table` | 테이블 정보 (테이블 번호, 비밀번호, 매장 연결) |
| `TableSession` | 테이블 세션 (시작 시간, 종료 시간, 상태) |
| `Category` | 메뉴 카테고리 (카테고리명, 순서) |
| `Menu` | 메뉴 항목 (메뉴명, 가격, 설명, 이미지URL, 카테고리) |
| `Order` | 주문 (테이블, 세션, 상태, 총액) |
| `OrderItem` | 주문 항목 (메뉴, 수량, 단가) |
| `OrderHistory` | 완료된 주문 이력 |
| `Admin` | 관리자 계정 (사용자명, 비밀번호 해시, 매장) |

#### 1.4.2 Repository Interfaces
| 인터페이스 | 책임 |
|------------|------|
| `StoreRepository` | 매장 데이터 접근 |
| `TableRepository` | 테이블 데이터 접근 |
| `TableSessionRepository` | 세션 데이터 접근 |
| `CategoryRepository` | 카테고리 데이터 접근 |
| `MenuRepository` | 메뉴 데이터 접근 |
| `OrderRepository` | 주문 데이터 접근 |
| `OrderItemRepository` | 주문 항목 데이터 접근 |
| `OrderHistoryRepository` | 주문 이력 데이터 접근 |
| `AdminRepository` | 관리자 데이터 접근 |

### 1.5 Infrastructure Layer

| 컴포넌트 | 책임 |
|----------|------|
| `JpaStoreRepository` | Store JPA 구현체 |
| `JpaTableRepository` | Table JPA 구현체 |
| `JpaTableSessionRepository` | TableSession JPA 구현체 |
| `JpaCategoryRepository` | Category JPA 구현체 |
| `JpaMenuRepository` | Menu JPA 구현체 |
| `JpaOrderRepository` | Order JPA 구현체 |
| `JpaOrderItemRepository` | OrderItem JPA 구현체 |
| `JpaOrderHistoryRepository` | OrderHistory JPA 구현체 |
| `JpaAdminRepository` | Admin JPA 구현체 |
| `S3ImageService` | S3 이미지 업로드/URL 생성 |
| `JwtTokenProvider` | JWT 토큰 생성/검증 |
| `SseEmitterManager` | SSE 연결 관리 |
| `SecurityConfig` | Spring Security 설정 |

---

## 2. Frontend Components

### 2.1 Customer App

```
customer-app/
├── src/
│   ├── components/
│   │   ├── common/           # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── menu/             # 메뉴 관련
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── MenuCard.tsx
│   │   │   └── MenuGrid.tsx
│   │   ├── cart/             # 장바구니 관련
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── QuantityControl.tsx
│   │   └── order/            # 주문 관련
│   │       ├── OrderCard.tsx
│   │       ├── OrderStatus.tsx
│   │       └── OrderSuccessModal.tsx
│   ├── pages/
│   │   ├── StartSessionPage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── CartPage.tsx
│   │   └── OrderHistoryPage.tsx
│   ├── contexts/
│   │   ├── SessionContext.tsx
│   │   └── CartContext.tsx
│   ├── hooks/
│   │   ├── useMenu.ts
│   │   ├── useCart.ts
│   │   └── useOrders.ts
│   ├── services/
│   │   └── api.ts            # Axios 인스턴스 및 API 호출
│   └── types/
│       └── index.ts          # TypeScript 타입 정의
```

#### 2.1.1 Page Components
| 컴포넌트 | 책임 |
|----------|------|
| `StartSessionPage` | 주문 시작 버튼, 세션 생성 |
| `MenuPage` | 카테고리 탭, 메뉴 그리드 표시 |
| `CartPage` | 장바구니 목록, 수량 조절, 주문하기 |
| `OrderHistoryPage` | 현재 세션 주문 내역 표시 |

#### 2.1.2 Context (상태 관리)
| 컨텍스트 | 책임 |
|----------|------|
| `SessionContext` | 세션 ID, 테이블 정보 관리 |
| `CartContext` | 장바구니 상태 관리 (로컬 저장 포함) |

### 2.2 Admin App

```
admin-app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── TableCard.tsx
│   │   │   └── OrderDetailModal.tsx
│   │   ├── menu/
│   │   │   ├── MenuTable.tsx
│   │   │   └── MenuForm.tsx
│   │   ├── table/
│   │   │   ├── TableGrid.tsx
│   │   │   └── TableSetupModal.tsx
│   │   └── store/
│   │       └── StoreInfoCard.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MenuManagementPage.tsx
│   │   ├── TableManagementPage.tsx
│   │   └── StoreInfoPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOrders.ts
│   │   ├── useSSE.ts
│   │   └── useMenu.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── sse.ts            # SSE 연결 관리
│   └── types/
│       └── index.ts
```

#### 2.2.1 Page Components
| 컴포넌트 | 책임 |
|----------|------|
| `LoginPage` | 관리자 로그인 폼 |
| `DashboardPage` | 주문 현황 대시보드, 테이블 그리드 |
| `MenuManagementPage` | 메뉴 CRUD 테이블 |
| `TableManagementPage` | 테이블 목록, 설정 |
| `StoreInfoPage` | 매장 정보 표시/수정 |

#### 2.2.2 Context (상태 관리)
| 컨텍스트 | 책임 |
|----------|------|
| `AuthContext` | JWT 토큰, 로그인 상태, 매장 정보 관리 |

---

## 3. Component Responsibilities Summary

### 3.1 Backend Layers Responsibility

| Layer | 책임 | 의존 방향 |
|-------|------|-----------|
| **Presentation** | HTTP 요청/응답, 데이터 변환 | → Application |
| **Application** | 비즈니스 유스케이스 조율, 트랜잭션 | → Domain |
| **Domain** | 비즈니스 엔티티, 규칙, 인터페이스 정의 | 없음 (Core) |
| **Infrastructure** | 기술적 구현 (DB, 외부 서비스) | → Domain (인터페이스 구현) |

### 3.2 Frontend Apps Responsibility

| App | 대상 사용자 | 주요 기능 |
|-----|-------------|-----------|
| **Customer App** | 고객 (테이블 태블릿) | 메뉴 조회, 장바구니, 주문, 주문 내역 |
| **Admin App** | 매장 관리자 | 주문 모니터링, 메뉴/테이블/매장 관리 |
