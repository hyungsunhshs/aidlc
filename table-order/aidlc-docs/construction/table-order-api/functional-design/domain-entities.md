# Domain Entities - table-order-api

## Overview
table-order-api의 도메인 엔티티 상세 정의입니다.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│      Store      │
│  (Aggregate)    │
└────────┬────────┘
         │ 1
         │
    ┌────┴────┬─────────────┬─────────────┐
    │         │             │             │
    │ N       │ N           │ N           │ N
    ▼         ▼             ▼             ▼
┌───────┐ ┌───────┐   ┌──────────┐  ┌───────────┐
│ Table │ │ Admin │   │ Category │  │DailyOrder │
└───┬───┘ └───────┘   └────┬─────┘  │  Sequence │
    │ 1                    │ 1      └───────────┘
    │                      │
    │ N                    │ N
    ▼                      ▼
┌──────────────┐      ┌────────┐
│ TableSession │      │  Menu  │
└──────┬───────┘      └────┬───┘
       │ 1                 │
       │                   │ (snapshot)
       │ N                 │
       ▼                   ▼
   ┌───────┐         ┌───────────┐
   │ Order │─────────│ OrderItem │
   └───┬───┘    1  N └───────────┘
       │
       │ (archive)
       ▼
┌──────────────┐
│ OrderHistory │
└──────────────┘
```

---

## 1. Store (매장)

### Description
매장 정보를 관리하는 최상위 엔티티입니다. 모든 데이터의 테넌트 역할을 합니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 매장 고유 ID |
| `name` | String | Not null, Max 100 | 매장명 |
| `identifier` | String | Not null, Unique, Max 50 | 매장 식별자 (로그인 시 사용) |
| `createdAt` | LocalDateTime | Not null, Auto | 생성 일시 |
| `updatedAt` | LocalDateTime | Auto | 수정 일시 |

### Relationships
- `1:N` → Table (매장은 여러 테이블을 가짐)
- `1:N` → Admin (매장은 여러 관리자를 가짐)
- `1:N` → Category (매장은 여러 카테고리를 가짐)

### Business Rules
- `identifier`는 시스템 전체에서 고유해야 함
- 매장 삭제 시 모든 하위 데이터 cascade 삭제 (주의 필요)

---

## 2. Table (테이블)

### Description
매장 내 물리적 테이블을 나타냅니다. 고객이 주문하는 단위입니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 테이블 고유 ID |
| `storeId` | Long | FK, Not null | 소속 매장 ID |
| `tableNumber` | String | Not null, Max 20 | 테이블 번호 (예: "1", "A-1") |
| `passwordHash` | String | Not null | 비밀번호 해시 (bcrypt) |
| `isActive` | Boolean | Not null, Default true | 활성 상태 |
| `createdAt` | LocalDateTime | Not null, Auto | 생성 일시 |
| `updatedAt` | LocalDateTime | Auto | 수정 일시 |

### Relationships
- `N:1` → Store (테이블은 하나의 매장에 속함)
- `1:N` → TableSession (테이블은 여러 세션을 가짐)

### Business Rules
- `tableNumber`는 같은 매장 내에서 고유해야 함
- 비밀번호는 4자리 숫자 (평문 저장 불가, bcrypt 해시)
- 비활성 테이블은 새 세션 생성 불가

### Indexes
- `UNIQUE (storeId, tableNumber)`

---

## 3. TableSession (테이블 세션)

### Description
고객의 한 번 이용(착석~퇴석)을 나타냅니다. 주문의 그룹핑 단위입니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 세션 고유 ID |
| `tableId` | Long | FK, Not null | 테이블 ID |
| `status` | Enum | Not null | ACTIVE, COMPLETED, EXPIRED |
| `startedAt` | LocalDateTime | Not null, Auto | 세션 시작 시간 |
| `endedAt` | LocalDateTime | Nullable | 세션 종료 시간 |
| `totalAmount` | BigDecimal | Not null, Default 0 | 세션 총 주문 금액 |

### Relationships
- `N:1` → Table (세션은 하나의 테이블에 속함)
- `1:N` → Order (세션은 여러 주문을 가짐)

### Business Rules
- 테이블당 ACTIVE 세션은 최대 1개
- 세션 시작 후 16시간 경과 시 자동으로 EXPIRED 상태로 변경
- COMPLETED: 관리자가 "이용 완료" 처리
- EXPIRED: 16시간 경과로 자동 만료
- `totalAmount`는 하위 Order들의 합계

### Status Transitions
```
ACTIVE → COMPLETED (관리자 이용 완료)
ACTIVE → EXPIRED (16시간 경과)
```

---

## 4. Category (카테고리)

### Description
메뉴를 분류하는 카테고리입니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 카테고리 고유 ID |
| `storeId` | Long | FK, Not null | 소속 매장 ID |
| `name` | String | Not null, Max 50 | 카테고리명 |
| `displayOrder` | Integer | Not null, Default 0 | 표시 순서 |
| `createdAt` | LocalDateTime | Not null, Auto | 생성 일시 |
| `updatedAt` | LocalDateTime | Auto | 수정 일시 |

### Relationships
- `N:1` → Store (카테고리는 하나의 매장에 속함)
- `1:N` → Menu (카테고리는 여러 메뉴를 가짐)

### Business Rules
- `name`은 같은 매장 내에서 고유 권장 (강제 아님)
- 카테고리 삭제 시 하위 Menu도 cascade 삭제
- `displayOrder`가 낮을수록 먼저 표시

### Indexes
- `INDEX (storeId, displayOrder)`

---

## 5. Menu (메뉴)

### Description
주문 가능한 메뉴 항목입니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 메뉴 고유 ID |
| `categoryId` | Long | FK, Not null | 소속 카테고리 ID |
| `name` | String | Not null, Max 100 | 메뉴명 |
| `price` | BigDecimal | Not null, Min 0 | 가격 |
| `description` | String | Nullable, Max 500 | 메뉴 설명 |
| `imageUrl` | String | Nullable, Max 500 | 이미지 URL (S3) |
| `displayOrder` | Integer | Not null, Default 0 | 표시 순서 |
| `isAvailable` | Boolean | Not null, Default true | 판매 가능 여부 |
| `isDeleted` | Boolean | Not null, Default false | 삭제 여부 (Soft delete) |
| `createdAt` | LocalDateTime | Not null, Auto | 생성 일시 |
| `updatedAt` | LocalDateTime | Auto | 수정 일시 |

### Relationships
- `N:1` → Category (메뉴는 하나의 카테고리에 속함)
- Referenced by OrderItem (Snapshot 방식)

### Business Rules
- `price`는 0 이상
- `isDeleted=true`인 메뉴는 고객에게 표시 안 됨
- `isAvailable=false`인 메뉴는 품절 상태 (표시는 되지만 주문 불가)
- 삭제 시 `isDeleted=true`로 soft delete (주문 이력 보존)
- `displayOrder`가 낮을수록 먼저 표시

### Indexes
- `INDEX (categoryId, displayOrder)`
- `INDEX (categoryId, isDeleted, isAvailable)`

---

## 6. Order (주문)

### Description
고객의 한 번 주문을 나타냅니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 주문 고유 ID |
| `sessionId` | Long | FK, Not null | 테이블 세션 ID |
| `orderNumber` | String | Not null, Unique | 주문 번호 (YYYYMMDD-NNN) |
| `status` | Enum | Not null | PENDING, PREPARING, COMPLETED |
| `totalAmount` | BigDecimal | Not null | 주문 총액 |
| `createdAt` | LocalDateTime | Not null, Auto | 주문 생성 시간 |
| `updatedAt` | LocalDateTime | Auto | 수정 일시 |

### Relationships
- `N:1` → TableSession (주문은 하나의 세션에 속함)
- `1:N` → OrderItem (주문은 여러 주문 항목을 가짐)

### Business Rules
- `orderNumber` 형식: `YYYYMMDD-NNN` (예: 20250121-001)
- 일별 순번은 매장별로 관리 (DailyOrderSequence)
- `totalAmount`는 OrderItem들의 (unitPrice × quantity) 합계
- 주문 생성 시 `totalAmount` 계산 및 저장

### Status Transitions (Strict Flow)
```
PENDING → PREPARING (관리자 접수)
PREPARING → COMPLETED (관리자 완료)

삭제는 모든 상태에서 가능 (관리자 직권)
```

### Indexes
- `UNIQUE (orderNumber)`
- `INDEX (sessionId, createdAt)`
- `INDEX (status)`

---

## 7. OrderItem (주문 항목)

### Description
주문에 포함된 개별 메뉴 항목입니다. 메뉴 정보를 스냅샷으로 저장합니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 주문 항목 고유 ID |
| `orderId` | Long | FK, Not null | 주문 ID |
| `menuId` | Long | FK, Nullable | 메뉴 ID (참조용, null 가능) |
| `menuName` | String | Not null, Max 100 | 메뉴명 (스냅샷) |
| `unitPrice` | BigDecimal | Not null | 단가 (스냅샷) |
| `quantity` | Integer | Not null, Min 1 | 수량 |

### Relationships
- `N:1` → Order (주문 항목은 하나의 주문에 속함)
- `N:1` → Menu (참조, Nullable - 메뉴 삭제 시에도 유지)

### Business Rules
- `menuName`, `unitPrice`는 주문 시점의 Menu 정보를 복사 (Snapshot)
- `menuId`는 참조 무결성 없이 null 가능 (메뉴 hard delete 대비)
- `quantity`는 1 이상
- 소계(subtotal) = `unitPrice` × `quantity`

---

## 8. OrderHistory (주문 이력)

### Description
이용 완료된 세션의 주문 이력을 JSON 형태로 아카이빙합니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 이력 고유 ID |
| `tableId` | Long | FK, Not null | 테이블 ID |
| `sessionId` | Long | Not null | 원본 세션 ID |
| `orderData` | JSON/Text | Not null | 주문 데이터 JSON |
| `totalAmount` | BigDecimal | Not null | 세션 총액 |
| `startedAt` | LocalDateTime | Not null | 세션 시작 시간 |
| `completedAt` | LocalDateTime | Not null, Auto | 이용 완료 시간 |

### Relationships
- `N:1` → Table (이력은 테이블에 연결)

### Business Rules
- 이용 완료 시 세션의 모든 주문을 JSON으로 직렬화하여 저장
- 원본 Order/OrderItem은 삭제하거나 유지 (정책에 따라)
- 조회용/통계용 데이터

### JSON Structure (orderData)
```json
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

---

## 9. Admin (관리자)

### Description
매장 관리자 계정입니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 관리자 고유 ID |
| `storeId` | Long | FK, Not null | 소속 매장 ID |
| `username` | String | Not null, Max 50 | 사용자명 |
| `passwordHash` | String | Not null | 비밀번호 해시 (bcrypt) |
| `failedLoginAttempts` | Integer | Not null, Default 0 | 로그인 실패 횟수 |
| `lockedUntil` | LocalDateTime | Nullable | 계정 잠금 해제 시간 |
| `lastLoginAt` | LocalDateTime | Nullable | 마지막 로그인 시간 |
| `createdAt` | LocalDateTime | Not null, Auto | 생성 일시 |
| `updatedAt` | LocalDateTime | Auto | 수정 일시 |

### Relationships
- `N:1` → Store (관리자는 하나의 매장에 속함)

### Business Rules
- `username`은 같은 매장 내에서 고유
- 매장당 여러 관리자 계정 가능
- 5회 연속 로그인 실패 시 15분 잠금 (`lockedUntil` 설정)
- 로그인 성공 시 `failedLoginAttempts` 초기화

### Indexes
- `UNIQUE (storeId, username)`

---

## 10. DailyOrderSequence (일별 주문 순번)

### Description
매장별 일별 주문 순번을 관리하는 보조 테이블입니다.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Long | PK, Auto-generated | 순번 고유 ID |
| `storeId` | Long | FK, Not null | 매장 ID |
| `orderDate` | LocalDate | Not null | 주문 일자 |
| `lastSequence` | Integer | Not null, Default 0 | 마지막 사용된 순번 |

### Business Rules
- 새 주문 생성 시 `lastSequence` + 1로 순번 발급
- 동시성 제어 필요 (비관적 락 또는 `SELECT FOR UPDATE`)
- 매일 자정에 새 레코드 생성 (또는 첫 주문 시)

### Indexes
- `UNIQUE (storeId, orderDate)`

---

## Value Objects

### 1. Money (금액)
```java
public record Money(BigDecimal amount) {
    public Money {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount must be non-negative");
        }
    }
    
    public Money add(Money other) {
        return new Money(this.amount.add(other.amount));
    }
    
    public Money multiply(int quantity) {
        return new Money(this.amount.multiply(BigDecimal.valueOf(quantity)));
    }
}
```

### 2. OrderNumber (주문 번호)
```java
public record OrderNumber(String value) {
    private static final Pattern PATTERN = Pattern.compile("\\d{8}-\\d{3}");
    
    public OrderNumber {
        if (!PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid order number format");
        }
    }
    
    public static OrderNumber generate(LocalDate date, int sequence) {
        String formatted = String.format("%s-%03d", 
            date.format(DateTimeFormatter.BASIC_ISO_DATE), 
            sequence);
        return new OrderNumber(formatted);
    }
}
```

### 3. TablePassword (테이블 비밀번호)
```java
public record TablePassword(String plainText) {
    private static final Pattern PATTERN = Pattern.compile("\\d{4}");
    
    public TablePassword {
        if (!PATTERN.matcher(plainText).matches()) {
            throw new IllegalArgumentException("Password must be 4 digits");
        }
    }
}
```

---

## Enums

### OrderStatus
```java
public enum OrderStatus {
    PENDING,    // 대기중 (접수 대기)
    PREPARING,  // 준비중 (조리 중)
    COMPLETED   // 완료
}
```

### SessionStatus
```java
public enum SessionStatus {
    ACTIVE,     // 활성 (이용 중)
    COMPLETED,  // 완료 (이용 완료)
    EXPIRED     // 만료 (16시간 경과)
}
```

---

## Database Schema Notes

### Naming Conventions
- 테이블명: snake_case, 복수형 (예: `orders`, `order_items`)
- 컬럼명: snake_case (예: `created_at`, `store_id`)
- 인덱스명: `idx_{table}_{columns}` (예: `idx_orders_session_id`)
- 제약조건명: `{table}_{type}_{columns}` (예: `orders_fk_session_id`)

### Common Columns
모든 엔티티에 공통 적용:
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP` (Optional)

### Soft Delete Pattern
Menu 엔티티에 적용:
- `is_deleted BOOLEAN NOT NULL DEFAULT FALSE`
- 조회 시 `WHERE is_deleted = FALSE` 조건 추가

