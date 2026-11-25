# Business Logic Model - table-order-api

## Overview
table-order-api의 핵심 비즈니스 로직 모델입니다. 주요 워크플로우, 데이터 변환, 통합 포인트를 정의합니다.

---

## 1. Core Business Workflows

### 1.1 Customer Session Workflow (고객 세션 워크플로우)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Customer Session Workflow                     │
└─────────────────────────────────────────────────────────────────┘

[고객] 태블릿 접근
         │
         ▼
┌─────────────────┐
│ 테이블 비밀번호  │
│ 입력            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    No    ┌─────────────────┐
│ 비밀번호 검증   │─────────▶│  에러 반환      │
└────────┬────────┘          └─────────────────┘
         │ Yes
         ▼
┌─────────────────┐    Yes   ┌─────────────────┐
│ 활성 세션 존재? │─────────▶│ 기존 세션 반환  │
└────────┬────────┘          └─────────────────┘
         │ No
         ▼
┌─────────────────┐
│ 새 세션 생성    │
│ status=ACTIVE   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 세션 토큰 발급  │
│ (16시간 유효)   │
└────────┬────────┘
         │
         ▼
    [메뉴 화면]
```

#### Use Case: StartSession

**Input:**
```java
record StartSessionRequest(
    String storeIdentifier,
    String tableNumber,
    String password  // 4자리 숫자
)
```

**Output:**
```java
record StartSessionResponse(
    Long sessionId,
    String tableNumber,
    String sessionToken,
    LocalDateTime expiresAt
)
```

**Logic:**
1. `storeIdentifier`로 Store 조회
2. `storeId + tableNumber`로 Table 조회
3. 비밀번호 검증 (bcrypt)
4. 테이블의 활성 세션 조회
   - 있으면: 기존 세션 반환
   - 없으면: 새 TableSession 생성 (status=ACTIVE)
5. 세션 토큰 생성 (JWT, 16시간 유효)
6. 응답 반환

---

### 1.2 Order Creation Workflow (주문 생성 워크플로우)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Order Creation Workflow                       │
└─────────────────────────────────────────────────────────────────┘

[고객] 주문하기 클릭
         │
         ▼
┌─────────────────┐
│ 세션 토큰 검증  │──── Invalid ───▶ [401 에러]
└────────┬────────┘
         │ Valid
         ▼
┌─────────────────┐
│ 세션 상태 확인  │──── Not Active ──▶ [400 에러]
└────────┬────────┘
         │ Active
         ▼
┌─────────────────┐
│ 주문 항목 검증  │
│ - 메뉴 존재?    │──── Invalid ───▶ [400 에러]
│ - 주문 가능?    │
│ - 수량 > 0?     │
└────────┬────────┘
         │ Valid
         ▼
┌─────────────────┐
│ 주문 번호 생성  │
│ YYYYMMDD-NNN    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Order 생성      │
│ status=PENDING  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OrderItem 생성  │
│ (Snapshot 저장) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 총액 계산 및    │
│ 저장            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 세션 총액 갱신  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SSE 이벤트 발송 │
│ NEW_ORDER       │
└────────┬────────┘
         │
         ▼
   [주문 성공 응답]
```

#### Use Case: CreateOrder

**Input:**
```java
record CreateOrderRequest(
    List<OrderItemRequest> items
)

record OrderItemRequest(
    Long menuId,
    Integer quantity
)
```

**Output:**
```java
record CreateOrderResponse(
    Long orderId,
    String orderNumber,
    BigDecimal totalAmount,
    LocalDateTime createdAt
)
```

**Logic:**
1. 세션 토큰에서 sessionId 추출
2. TableSession 조회 및 상태 확인 (ACTIVE 필수)
3. 각 OrderItemRequest 검증:
   - Menu 존재 여부
   - `isDeleted=false` 확인
   - `isAvailable=true` 확인
   - `quantity >= 1` 확인
4. 주문 번호 생성 (DailyOrderSequence 사용)
5. Order 생성 (status=PENDING)
6. OrderItem 생성 (메뉴 정보 snapshot)
7. 총액 계산: `Σ(unitPrice × quantity)`
8. Order.totalAmount 저장
9. TableSession.totalAmount 갱신
10. SSE 이벤트 발송 (NEW_ORDER)
11. 응답 반환

---

### 1.3 Order Status Update Workflow (주문 상태 변경 워크플로우)

```
┌─────────────────────────────────────────────────────────────────┐
│                 Order Status Update Workflow                     │
└─────────────────────────────────────────────────────────────────┘

[관리자] 상태 변경 요청
         │
         ▼
┌─────────────────┐
│ JWT 토큰 검증   │──── Invalid ───▶ [401 에러]
└────────┬────────┘
         │ Valid
         ▼
┌─────────────────┐
│ Order 조회      │──── Not Found ──▶ [404 에러]
│ (매장 범위)     │
└────────┬────────┘
         │ Found
         ▼
┌─────────────────┐
│ 상태 전이 검증  │
│ Strict Flow     │──── Invalid ───▶ [400 에러]
└────────┬────────┘
         │ Valid
         ▼
┌─────────────────┐
│ Order.status    │
│ 업데이트        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SSE 이벤트 발송 │
│ ORDER_STATUS_   │
│ CHANGED         │
└────────┬────────┘
         │
         ▼
   [성공 응답]
```

#### Use Case: UpdateOrderStatus

**Input:**
```java
record UpdateOrderStatusRequest(
    Long orderId,
    OrderStatus newStatus  // PREPARING or COMPLETED
)
```

**Logic:**
1. JWT에서 storeId 추출
2. Order 조회 (storeId 범위 필터)
3. 상태 전이 검증:
   - PENDING → PREPARING: ✅
   - PREPARING → COMPLETED: ✅
   - 그 외: ❌ (에러)
4. Order.status 업데이트
5. SSE 이벤트 발송 (ORDER_STATUS_CHANGED)

---

### 1.4 Table Completion Workflow (이용 완료 워크플로우)

```
┌─────────────────────────────────────────────────────────────────┐
│                  Table Completion Workflow                       │
└─────────────────────────────────────────────────────────────────┘

[관리자] 이용 완료 요청
         │
         ▼
┌─────────────────┐
│ 테이블/세션 조회│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 활성 세션 확인  │──── No Active ──▶ [400 에러]
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│ 세션의 주문     │
│ 데이터 수집     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OrderHistory    │
│ 생성 (JSON)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 세션 상태 변경  │
│ ACTIVE→COMPLETED│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 세션 종료 시간  │
│ 기록            │
└────────┬────────┘
         │
         ▼
   [성공 응답]
```

#### Use Case: CompleteTableSession

**Logic:**
1. Table 조회
2. 활성 세션 조회
3. 세션의 모든 Order 및 OrderItem 조회
4. JSON 직렬화하여 OrderHistory 생성
5. TableSession.status = COMPLETED
6. TableSession.endedAt = now()
7. 응답 반환

---

### 1.5 Admin Authentication Workflow (관리자 인증 워크플로우)

```
┌─────────────────────────────────────────────────────────────────┐
│                  Admin Authentication Workflow                   │
└─────────────────────────────────────────────────────────────────┘

[관리자] 로그인 요청
         │
         ▼
┌─────────────────┐
│ 매장 식별자로   │──── Not Found ──▶ [401 에러]
│ Store 조회      │
└────────┬────────┘
         │ Found
         ▼
┌─────────────────┐
│ Admin 조회      │──── Not Found ──▶ [401 에러]
│ (storeId+user)  │
└────────┬────────┘
         │ Found
         ▼
┌─────────────────┐
│ 계정 잠금 확인  │──── Locked ───▶ [429 에러]
│ (lockedUntil)   │                 "15분 후 재시도"
└────────┬────────┘
         │ Not Locked
         ▼
┌─────────────────┐
│ 비밀번호 검증   │──── Invalid ───▶ ┌─────────────┐
│ (bcrypt)        │                  │ 실패 카운트 │
└────────┬────────┘                  │ 증가        │
         │ Valid                     └──────┬──────┘
         ▼                                  │
┌─────────────────┐                         ▼
│ 실패 카운트     │              ┌─────────────────┐
│ 초기화          │              │ 5회 도달?       │
└────────┬────────┘              └────────┬────────┘
         │                                │ Yes
         ▼                                ▼
┌─────────────────┐              ┌─────────────────┐
│ JWT 토큰 생성   │              │ 계정 잠금       │
│ (16시간 유효)   │              │ (15분)          │
└────────┬────────┘              └─────────────────┘
         │
         ▼
┌─────────────────┐
│ lastLoginAt     │
│ 업데이트        │
└────────┬────────┘
         │
         ▼
   [토큰 반환]
```

#### Use Case: AdminLogin

**Input:**
```java
record AdminLoginRequest(
    String storeIdentifier,
    String username,
    String password
)
```

**Output:**
```java
record AdminLoginResponse(
    String accessToken,
    LocalDateTime expiresAt,
    StoreInfo store
)

record StoreInfo(
    Long storeId,
    String storeName,
    String storeIdentifier
)
```

**Logic:**
1. `storeIdentifier`로 Store 조회
2. `storeId + username`으로 Admin 조회
3. 계정 잠금 확인:
   - `lockedUntil > now()`: 429 에러 반환
4. 비밀번호 검증:
   - 실패 시: `failedLoginAttempts++`
   - 5회 도달 시: `lockedUntil = now() + 15분`
5. 성공 시:
   - `failedLoginAttempts = 0`
   - `lastLoginAt = now()`
   - JWT 토큰 생성 (payload: adminId, storeId, 16시간 유효)
6. 응답 반환

---

## 2. Data Transformations

### 2.1 Menu → OrderItem Snapshot

주문 시 메뉴 정보를 OrderItem에 복사합니다.

```java
// Source: Menu
Menu {
    id: Long,
    name: String,
    price: BigDecimal,
    // ... other fields
}

// Target: OrderItem
OrderItem {
    menuId: Long,        // 참조용 (soft reference)
    menuName: String,    // 복사 (snapshot)
    unitPrice: BigDecimal, // 복사 (snapshot)
    quantity: Integer
}

// Transformation
OrderItem.menuId = Menu.id
OrderItem.menuName = Menu.name
OrderItem.unitPrice = Menu.price
```

### 2.2 Session Orders → OrderHistory JSON

이용 완료 시 세션 주문 데이터를 JSON으로 아카이빙합니다.

```java
// Source: TableSession + Orders + OrderItems
TableSession {
    orders: List<Order> {
        items: List<OrderItem>
    }
}

// Target: OrderHistory.orderData (JSON)
{
    "sessionId": 123,
    "tableNumber": "1",
    "orders": [
        {
            "orderId": 456,
            "orderNumber": "20250121-001",
            "status": "COMPLETED",
            "totalAmount": 25000,
            "createdAt": "2025-01-21T12:30:00",
            "items": [
                {
                    "menuName": "김치찌개",
                    "unitPrice": 8000,
                    "quantity": 2
                }
            ]
        }
    ],
    "totalAmount": 25000
}
```

### 2.3 Order Number Generation

```java
// Input
LocalDate orderDate = LocalDate.now();  // 2025-01-21
int sequence = dailyOrderSequence.getNextSequence(storeId, orderDate);  // 1

// Transformation
String orderNumber = String.format("%s-%03d", 
    orderDate.format(DateTimeFormatter.BASIC_ISO_DATE),  // 20250121
    sequence  // 001
);

// Output
"20250121-001"
```

---

## 3. Integration Points

### 3.1 SSE (Server-Sent Events)

#### Event Types

| Event | Trigger | Payload |
|-------|---------|---------|
| `NEW_ORDER` | 새 주문 생성 | OrderEvent |
| `ORDER_STATUS_CHANGED` | 주문 상태 변경 | OrderEvent |
| `ORDER_DELETED` | 주문 삭제 | OrderDeletedEvent |

#### Event Payload

```java
record OrderEvent(
    Long orderId,
    String orderNumber,
    Long tableId,
    String tableNumber,
    OrderStatus status,
    BigDecimal totalAmount,
    LocalDateTime createdAt,
    List<OrderItemEvent> items
)

record OrderItemEvent(
    String menuName,
    Integer quantity,
    BigDecimal unitPrice
)

record OrderDeletedEvent(
    Long orderId,
    Long tableId
)
```

#### SSE Connection Management

```java
// Connection
GET /api/admin/sse/orders?storeId={storeId}

// Heartbeat (30초 간격)
event: heartbeat
data: {"timestamp": "2025-01-21T12:00:00"}

// Order Event
event: NEW_ORDER
data: {"orderId": 123, "orderNumber": "20250121-001", ...}
```

### 3.2 AWS S3 (Image Storage)

#### Operations

| Operation | Trigger | Description |
|-----------|---------|-------------|
| Upload | 메뉴 이미지 등록 | Presigned URL 또는 Direct Upload |
| Get URL | 메뉴 조회 | Public URL 또는 Presigned URL |

#### Image URL Pattern

```
https://{bucket}.s3.{region}.amazonaws.com/menus/{storeId}/{menuId}.{ext}
```

### 3.3 JWT Token Structure

#### Customer Session Token

```json
{
  "sub": "session",
  "sessionId": 123,
  "tableId": 456,
  "storeId": 789,
  "iat": 1705833600,
  "exp": 1705891200  // +16 hours
}
```

#### Admin Access Token

```json
{
  "sub": "admin",
  "adminId": 123,
  "storeId": 789,
  "username": "admin1",
  "iat": 1705833600,
  "exp": 1705891200  // +16 hours
}
```

---

## 4. Error Handling

### 4.1 Business Exceptions

| Exception | HTTP Status | Code | Description |
|-----------|-------------|------|-------------|
| `SessionNotFoundException` | 404 | SESSION_NOT_FOUND | 세션을 찾을 수 없음 |
| `SessionExpiredException` | 400 | SESSION_EXPIRED | 세션이 만료됨 |
| `InvalidPasswordException` | 401 | INVALID_PASSWORD | 비밀번호 불일치 |
| `MenuNotAvailableException` | 400 | MENU_NOT_AVAILABLE | 주문 불가 메뉴 |
| `InvalidOrderStatusTransitionException` | 400 | INVALID_STATUS_TRANSITION | 잘못된 상태 전이 |
| `AccountLockedException` | 429 | ACCOUNT_LOCKED | 계정 잠금 |
| `DuplicateResourceException` | 409 | DUPLICATE_RESOURCE | 중복 리소스 |

### 4.2 Error Response Format

```json
{
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "세션이 만료되었습니다. 주문 시작 버튼을 눌러 새 세션을 시작해주세요.",
    "timestamp": "2025-01-21T12:00:00Z"
  }
}
```

---

## 5. Concurrency Handling

### 5.1 Order Number Generation

동시 주문 시 주문 번호 중복 방지를 위한 비관적 락 사용:

```sql
-- DailyOrderSequence 조회 시 락 획득
SELECT * FROM daily_order_sequences 
WHERE store_id = ? AND order_date = ?
FOR UPDATE;

-- 순번 증가
UPDATE daily_order_sequences 
SET last_sequence = last_sequence + 1
WHERE store_id = ? AND order_date = ?;
```

### 5.2 Session Creation

동일 테이블 동시 세션 생성 방지:

```java
// Optimistic approach with unique constraint
@Transactional
public TableSession createSession(Long tableId) {
    // Check existing active session
    Optional<TableSession> existing = sessionRepository
        .findByTableIdAndStatus(tableId, SessionStatus.ACTIVE);
    
    if (existing.isPresent()) {
        return existing.get();  // Return existing
    }
    
    // Create new (unique constraint on tableId + status=ACTIVE)
    return sessionRepository.save(new TableSession(tableId, ACTIVE));
}
```

---

## 6. Scheduled Tasks

### 6.1 Session Expiry Check

16시간 경과 세션 자동 만료 처리:

```java
@Scheduled(fixedRate = 300000)  // 5분마다
public void expireSessions() {
    LocalDateTime threshold = LocalDateTime.now().minusHours(16);
    
    List<TableSession> expiredSessions = sessionRepository
        .findByStatusAndStartedAtBefore(ACTIVE, threshold);
    
    for (TableSession session : expiredSessions) {
        session.setStatus(EXPIRED);
        sessionRepository.save(session);
    }
}
```

---

## 7. Audit & Logging

### 7.1 Audit Events

| Event | Data | Purpose |
|-------|------|---------|
| ORDER_CREATED | orderId, sessionId, totalAmount | 주문 추적 |
| ORDER_STATUS_CHANGED | orderId, oldStatus, newStatus | 상태 변경 추적 |
| ORDER_DELETED | orderId, deletedBy | 삭제 추적 |
| ADMIN_LOGIN | adminId, storeId, ip | 보안 감사 |
| ADMIN_LOGIN_FAILED | username, storeId, ip | 보안 감사 |

### 7.2 Logging Levels

| Component | Level | Content |
|-----------|-------|---------|
| Controller | INFO | Request/Response summary |
| UseCase | DEBUG | Business logic flow |
| Repository | TRACE | SQL queries |
| Security | WARN | Authentication failures |

