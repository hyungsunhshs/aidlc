# Unit of Work Dependency Matrix

## Overview
테이블오더 서비스의 Unit 간 의존성 관계를 정의합니다.

---

## Dependency Summary

```
+---------------------+
|  store-management-  |
|  app (Admin FE)     |
+----------+----------+
           |
           | REST API + SSE
           | (Admin API)
           v
+---------------------+       +---------------------+
|   table-order-api   |<------| customer-ordering-  |
|   (Backend)         |       | app (Customer FE)   |
+----------+----------+       +----------+----------+
           |                             |
           | REST API                    | REST API
           | (Customer API)              | (Customer API)
           |                             |
           +-------------+---------------+
                         |
                         v
              +---------------------+
              |     PostgreSQL      |
              |     (Database)      |
              +---------------------+
                         |
                         v
              +---------------------+
              |      AWS S3         |
              |   (Image Storage)   |
              +---------------------+
```

---

## Dependency Matrix

### Unit Dependencies

| From → To | table-order-api | customer-ordering-app | store-management-app |
|-----------|-----------------|----------------------|---------------------|
| **table-order-api** | - | ✗ (No dependency) | ✗ (No dependency) |
| **customer-ordering-app** | ✓ (REST API) | - | ✗ (No dependency) |
| **store-management-app** | ✓ (REST API + SSE) | ✗ (No dependency) | - |

### External Dependencies

| Unit | PostgreSQL | AWS S3 | AWS EKS | AWS CloudFront |
|------|------------|--------|---------|----------------|
| **table-order-api** | ✓ Direct | ✓ Direct | ✓ Deploy | ✗ |
| **customer-ordering-app** | ✗ | ✗ | ✗ | ✓ Deploy |
| **store-management-app** | ✗ | ✗ | ✗ | ✓ Deploy |

---

## Dependency Details

### 1. customer-ordering-app → table-order-api

**Type**: REST API (HTTP)

**Endpoints Used**:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/customer/sessions` | POST | 세션 시작 |
| `/api/customer/sessions/current` | GET | 현재 세션 조회 |
| `/api/customer/menus/categories` | GET | 카테고리 목록 |
| `/api/customer/menus` | GET | 메뉴 목록 |
| `/api/customer/orders` | POST | 주문 생성 |
| `/api/customer/orders` | GET | 주문 목록 |

**Data Flow**:
```
customer-ordering-app                    table-order-api
        |                                       |
        |  POST /sessions (tableId, pw)         |
        |-------------------------------------->|
        |                                       |
        |  Response: { sessionId, token }       |
        |<--------------------------------------|
        |                                       |
        |  GET /menus (Authorization: token)    |
        |-------------------------------------->|
        |                                       |
        |  Response: [Menu List]                |
        |<--------------------------------------|
        |                                       |
        |  POST /orders (cart items)            |
        |-------------------------------------->|
        |                                       |
        |  Response: { orderId, orderNumber }   |
        |<--------------------------------------|
```

### 2. store-management-app → table-order-api

**Type**: REST API (HTTP) + SSE (Server-Sent Events)

**REST Endpoints Used**:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/auth/login` | POST | 로그인 |
| `/api/admin/auth/logout` | POST | 로그아웃 |
| `/api/admin/dashboard/stats` | GET | 통계 |
| `/api/admin/dashboard/tables` | GET | 테이블 현황 |
| `/api/admin/orders` | GET | 주문 목록 |
| `/api/admin/orders/{id}/status` | PATCH | 주문 상태 변경 |
| `/api/admin/orders/{id}` | DELETE | 주문 삭제 |
| `/api/admin/tables` | GET/POST | 테이블 CRUD |
| `/api/admin/tables/{id}/complete` | POST | 이용 완료 |
| `/api/admin/tables/{id}/history` | GET | 과거 내역 |
| `/api/admin/menus` | GET/POST | 메뉴 CRUD |
| `/api/admin/menus/{id}` | PUT/DELETE | 메뉴 수정/삭제 |
| `/api/admin/categories` | GET/POST | 카테고리 CRUD |
| `/api/admin/store` | GET/PUT | 매장 정보 |

**SSE Endpoint**:
| Endpoint | Type | Purpose |
|----------|------|---------|
| `/api/admin/sse/orders` | SSE | 실시간 주문 알림 |

**Data Flow (SSE)**:
```
store-management-app                     table-order-api
        |                                       |
        |  GET /sse/orders (EventSource)        |
        |-------------------------------------->|
        |                                       |
        |  SSE: event=NEW_ORDER                 |
        |<--------------------------------------|
        |                                       |
        |  SSE: event=ORDER_STATUS_CHANGED      |
        |<--------------------------------------|
        |                                       |
        |  SSE: event=ORDER_DELETED             |
        |<--------------------------------------|
```

### 3. table-order-api → PostgreSQL

**Type**: JDBC (JPA)

**Tables**:
- `stores` - 매장 정보
- `tables` - 테이블 정보
- `table_sessions` - 세션 정보
- `categories` - 카테고리
- `menus` - 메뉴
- `orders` - 주문
- `order_items` - 주문 항목
- `order_history` - 주문 이력
- `admins` - 관리자

### 4. table-order-api → AWS S3

**Type**: AWS SDK

**Operations**:
- 메뉴 이미지 업로드
- 이미지 URL 생성 (Pre-signed URL 또는 Public URL)

---

## Shared Resources

### Database Schema
모든 Backend 모듈은 동일한 PostgreSQL 스키마를 공유합니다.

```
+-------------------+     +-------------------+
|      stores       |---->|      tables       |
+-------------------+     +-------------------+
         |                         |
         |                         |
         v                         v
+-------------------+     +-------------------+
|    categories     |     |  table_sessions   |
+-------------------+     +-------------------+
         |                         |
         v                         v
+-------------------+     +-------------------+
|      menus        |     |      orders       |
+-------------------+     +-------------------+
                                   |
                                   v
                          +-------------------+
                          |   order_items     |
                          +-------------------+
```

### API Gateway / Load Balancer
Production 환경에서는 단일 엔트리 포인트를 통해 Backend API에 접근합니다.

```
                    +-------------------+
                    |   AWS ALB/NLB     |
                    +-------------------+
                             |
        +--------------------+--------------------+
        |                                         |
        v                                         v
+---------------+                        +---------------+
| /api/customer |                        | /api/admin    |
| Routing       |                        | Routing       |
+---------------+                        +---------------+
        |                                         |
        +--------------------+--------------------+
                             |
                             v
                    +-------------------+
                    |  table-order-api  |
                    |  (EKS Pods)       |
                    +-------------------+
```

---

## Dependency Direction Rules

### Allowed Dependencies
- Frontend → Backend (API 호출)
- Backend → Database (데이터 접근)
- Backend → External Services (S3, etc.)

### Not Allowed Dependencies
- Backend → Frontend (역방향 의존 불가)
- Frontend → Database (직접 접근 불가)
- Frontend ↔ Frontend (상호 의존 불가)

---

## Development Order Recommendation

API-Contract First 접근법에 따른 개발 순서:

### Step 1: API Contract (Week 1)
```
[ ] OpenAPI Specification 작성
    [ ] Customer API 명세
    [ ] Admin API 명세
    [ ] 공통 스키마 정의
```

### Step 2: Parallel Development (Week 2-4)
```
+------------------+  +------------------+  +------------------+
| table-order-api  |  | customer-        |  | store-           |
|                  |  | ordering-app     |  | management-app   |
|                  |  |                  |  |                  |
| - Domain Layer   |  | - Pages          |  | - Pages          |
| - Application    |  | - Components     |  | - Components     |
| - API Layer      |  | - Mock API       |  | - Mock API       |
| - Infrastructure |  | - State Mgmt     |  | - State Mgmt     |
+------------------+  +------------------+  +------------------+
```

### Step 3: Integration (Week 5)
```
[ ] Frontend - Backend 통합
[ ] E2E 테스트
[ ] 성능 테스트
```

---

## Notes

- Frontend는 개발 중 Mock API 또는 MSW(Mock Service Worker)를 사용하여 Backend 없이 개발 가능
- Backend API 완성 후 실제 API로 전환
- SSE는 Admin App에서만 사용 (실시간 주문 알림)
- 모든 API 통신은 HTTPS 사용 (Production)

