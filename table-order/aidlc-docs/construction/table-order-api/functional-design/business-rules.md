# Business Rules - table-order-api

## Overview
table-order-api의 비즈니스 규칙 정의입니다. 검증 규칙, 상태 전이 규칙, 계산 규칙, 권한 규칙을 포함합니다.

---

## 1. Validation Rules (검증 규칙)

### 1.1 Store (매장)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| STR-V01 | 매장명은 필수, 1~100자 | "매장명은 필수입니다" / "매장명은 100자 이내여야 합니다" |
| STR-V02 | 매장 식별자는 필수, 영문소문자+숫자+하이픈, 3~50자 | "매장 식별자 형식이 올바르지 않습니다" |
| STR-V03 | 매장 식별자는 시스템 전체에서 고유 | "이미 사용 중인 매장 식별자입니다" |

### 1.2 Table (테이블)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| TBL-V01 | 테이블 번호는 필수, 1~20자 | "테이블 번호는 필수입니다" |
| TBL-V02 | 테이블 번호는 같은 매장 내 고유 | "이미 등록된 테이블 번호입니다" |
| TBL-V03 | 비밀번호는 4자리 숫자 | "비밀번호는 4자리 숫자여야 합니다" |

### 1.3 TableSession (세션)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| SES-V01 | 테이블당 활성 세션은 1개만 가능 | "이미 활성화된 세션이 있습니다" |
| SES-V02 | 비활성 테이블은 세션 생성 불가 | "비활성화된 테이블입니다" |

### 1.4 Category (카테고리)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| CAT-V01 | 카테고리명은 필수, 1~50자 | "카테고리명은 필수입니다" |
| CAT-V02 | 표시 순서는 0 이상 정수 | "표시 순서는 0 이상이어야 합니다" |

### 1.5 Menu (메뉴)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| MNU-V01 | 메뉴명은 필수, 1~100자 | "메뉴명은 필수입니다" |
| MNU-V02 | 가격은 필수, 0 이상 | "가격은 0 이상이어야 합니다" |
| MNU-V03 | 설명은 500자 이내 | "설명은 500자 이내여야 합니다" |
| MNU-V04 | 이미지 URL은 유효한 URL 형식 | "이미지 URL 형식이 올바르지 않습니다" |
| MNU-V05 | 카테고리는 필수 | "카테고리를 선택해주세요" |

### 1.6 Order (주문)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| ORD-V01 | 주문 항목은 1개 이상 필수 | "주문 항목이 없습니다" |
| ORD-V02 | 활성 세션에서만 주문 가능 | "유효하지 않은 세션입니다" |
| ORD-V03 | 주문 가능한 메뉴만 주문 가능 (isAvailable=true, isDeleted=false) | "주문할 수 없는 메뉴가 포함되어 있습니다" |

### 1.7 OrderItem (주문 항목)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| ORI-V01 | 수량은 1 이상 | "수량은 1 이상이어야 합니다" |
| ORI-V02 | 메뉴 ID는 유효한 메뉴 참조 | "존재하지 않는 메뉴입니다" |

### 1.8 Admin (관리자)

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| ADM-V01 | 사용자명은 필수, 3~50자 | "사용자명은 3~50자여야 합니다" |
| ADM-V02 | 사용자명은 같은 매장 내 고유 | "이미 사용 중인 사용자명입니다" |
| ADM-V03 | 비밀번호는 최소 8자, 영문+숫자 포함 | "비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다" |

---

## 2. State Transition Rules (상태 전이 규칙)

### 2.1 OrderStatus (주문 상태)

```
                     ┌─────────────────┐
                     │                 │
                     ▼                 │
┌──────────┐    ┌──────────┐    ┌──────────┐
│ PENDING  │───▶│PREPARING │───▶│COMPLETED │
└──────────┘    └──────────┘    └──────────┘
     │               │               │
     │               │               │
     └───────────────┴───────────────┘
                     │
                     ▼
               [DELETE 가능]
```

| Rule ID | From | To | Allowed | Error Message |
|---------|------|-----|---------|---------------|
| OST-01 | PENDING | PREPARING | ✅ Yes | - |
| OST-02 | PREPARING | COMPLETED | ✅ Yes | - |
| OST-03 | PENDING | COMPLETED | ❌ No | "주문은 순차적으로 처리해야 합니다" |
| OST-04 | PREPARING | PENDING | ❌ No | "이전 상태로 되돌릴 수 없습니다" |
| OST-05 | COMPLETED | * | ❌ No | "완료된 주문의 상태는 변경할 수 없습니다" |
| OST-06 | * | DELETE | ✅ Yes | - (관리자 직권 삭제) |

### 2.2 SessionStatus (세션 상태)

```
┌──────────┐    ┌──────────┐
│  ACTIVE  │───▶│COMPLETED │  (관리자 이용 완료)
└──────────┘    └──────────┘
     │
     │ (16시간 경과)
     ▼
┌──────────┐
│ EXPIRED  │
└──────────┘
```

| Rule ID | From | To | Trigger | Description |
|---------|------|-----|---------|-------------|
| SST-01 | ACTIVE | COMPLETED | 관리자 액션 | 이용 완료 처리, 주문 → 히스토리 이동 |
| SST-02 | ACTIVE | EXPIRED | 시간 경과 | 16시간 후 자동 만료, 주문 데이터 유지 |
| SST-03 | COMPLETED | * | - | 종료된 세션은 상태 변경 불가 |
| SST-04 | EXPIRED | * | - | 만료된 세션은 상태 변경 불가 |

---

## 3. Calculation Rules (계산 규칙)

### 3.1 Order Total Amount (주문 총액)

```
Order.totalAmount = Σ(OrderItem.unitPrice × OrderItem.quantity)
```

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| CAL-01 | 주문 총액은 주문 항목의 소계 합 | 주문 생성 시 계산하여 저장 |
| CAL-02 | 주문 항목 소계 = 단가 × 수량 | `unitPrice * quantity` |
| CAL-03 | 금액은 원화, 소수점 없음 | `BigDecimal.ZERO.setScale(0)` |

### 3.2 Session Total Amount (세션 총액)

```
TableSession.totalAmount = Σ(Order.totalAmount) for non-deleted orders
```

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| CAL-04 | 세션 총액은 해당 세션 주문들의 합 | 주문 생성/삭제 시 재계산 |
| CAL-05 | 삭제된 주문은 총액에서 제외 | 주문 삭제 시 세션 총액 갱신 |

### 3.3 Order Number Generation (주문 번호 생성)

```
OrderNumber = YYYYMMDD-NNN
예: 20250121-001, 20250121-002, ...
```

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| CAL-06 | 주문 번호는 일별 순번 | `DailyOrderSequence.lastSequence + 1` |
| CAL-07 | 순번은 매장별로 독립 | `storeId + orderDate`로 구분 |
| CAL-08 | 순번은 001부터 시작 | 첫 주문 시 1, 3자리로 포맷 |
| CAL-09 | 동시성 제어 필수 | 비관적 락 사용 |

---

## 4. Authorization Rules (권한 규칙)

### 4.1 Customer API (고객 API)

| Rule ID | Endpoint | Authorization | Description |
|---------|----------|---------------|-------------|
| AUT-01 | POST /sessions | Table Password | 테이블 비밀번호로 세션 생성 |
| AUT-02 | GET /sessions/current | Session Token | 세션 토큰 필수 |
| AUT-03 | GET /menus/* | Session Token | 세션 토큰 필수 |
| AUT-04 | POST /orders | Session Token | 세션 토큰 필수 |
| AUT-05 | GET /orders | Session Token | 본인 세션의 주문만 조회 가능 |

### 4.2 Admin API (관리자 API)

| Rule ID | Endpoint | Authorization | Description |
|---------|----------|---------------|-------------|
| AUT-06 | POST /auth/login | Public | 로그인 (인증 불필요) |
| AUT-07 | * /admin/* | JWT Token | 모든 관리자 API는 JWT 필수 |
| AUT-08 | * /admin/* | Store Scope | 본인 매장 데이터만 접근 가능 |

### 4.3 Data Scope Rules (데이터 범위 규칙)

| Rule ID | Rule | Description |
|---------|------|-------------|
| DSC-01 | 관리자는 본인 매장 데이터만 접근 | `storeId` 필터 자동 적용 |
| DSC-02 | 고객은 본인 세션 데이터만 접근 | `sessionId` 필터 자동 적용 |
| DSC-03 | Cross-store 접근 불가 | 다른 매장 데이터 조회/수정 차단 |

---

## 5. Business Process Rules (비즈니스 프로세스 규칙)

### 5.1 Session Lifecycle (세션 생명주기)

```
1. 세션 시작 (고객)
   - 테이블 비밀번호 검증
   - 기존 활성 세션 확인 (있으면 재사용)
   - 없으면 새 세션 생성

2. 주문 (고객)
   - 활성 세션 확인
   - 주문 생성 (상태: PENDING)
   - SSE로 관리자에게 알림

3. 주문 처리 (관리자)
   - PENDING → PREPARING → COMPLETED
   - 상태 변경 시 SSE 이벤트 발송

4. 이용 완료 (관리자)
   - 세션 상태: ACTIVE → COMPLETED
   - 주문 데이터 → OrderHistory 아카이빙
   - 세션 총액 초기화
```

### 5.2 Session Expiry (세션 만료)

| Rule ID | Rule | Action |
|---------|------|--------|
| EXP-01 | 세션 시작 후 16시간 경과 | 상태를 EXPIRED로 변경 |
| EXP-02 | 만료된 세션의 주문 데이터 | 그대로 유지 (삭제 안 함) |
| EXP-03 | 만료 처리 시점 | 스케줄러 또는 조회 시 체크 |

### 5.3 Menu Deletion (메뉴 삭제)

| Rule ID | Rule | Action |
|---------|------|--------|
| DEL-01 | 메뉴 삭제 요청 | Soft delete (`isDeleted=true`) |
| DEL-02 | 삭제된 메뉴 | 고객 메뉴 목록에서 제외 |
| DEL-03 | 과거 주문의 메뉴 참조 | OrderItem에 snapshot 보존 |

### 5.4 Category Deletion (카테고리 삭제)

| Rule ID | Rule | Action |
|---------|------|--------|
| DEL-04 | 카테고리 삭제 요청 | 하위 메뉴 cascade 삭제 |
| DEL-05 | 삭제 전 확인 | "N개의 메뉴가 함께 삭제됩니다" 경고 |

---

## 6. Security Rules (보안 규칙)

### 6.1 Authentication (인증)

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| SEC-01 | 비밀번호는 평문 저장 금지 | bcrypt 해싱 |
| SEC-02 | JWT 서명 검증 | 서버 사이드 검증 필수 |
| SEC-03 | JWT 만료 시간 | 16시간 |

### 6.2 Login Protection (로그인 보호)

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| SEC-04 | 로그인 실패 카운트 | 5회 연속 실패 시 잠금 |
| SEC-05 | 계정 잠금 시간 | 15분 |
| SEC-06 | 잠금 해제 | 15분 경과 후 자동 해제 |
| SEC-07 | 성공 시 카운트 초기화 | `failedLoginAttempts = 0` |

### 6.3 Input Validation (입력 검증)

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| SEC-08 | SQL Injection 방지 | JPA 파라미터 바인딩 사용 |
| SEC-09 | XSS 방지 | 출력 시 HTML 이스케이프 |
| SEC-10 | 입력값 길이 제한 | 각 필드별 max length 적용 |

---

## 7. Notification Rules (알림 규칙)

### 7.1 SSE Events (실시간 이벤트)

| Rule ID | Event | Trigger | Payload |
|---------|-------|---------|---------|
| NOT-01 | NEW_ORDER | 새 주문 생성 | Order 정보 |
| NOT-02 | ORDER_STATUS_CHANGED | 주문 상태 변경 | Order 정보 (새 상태) |
| NOT-03 | ORDER_DELETED | 주문 삭제 | Order ID |

### 7.2 Event Delivery (이벤트 전달)

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| NOT-04 | 매장별 이벤트 분리 | `storeId`로 SSE 채널 분리 |
| NOT-05 | 연결 유지 | 주기적 heartbeat (30초) |
| NOT-06 | 재연결 처리 | 클라이언트 자동 재연결 지원 |

---

## 8. Data Integrity Rules (데이터 무결성 규칙)

### 8.1 Referential Integrity (참조 무결성)

| Rule ID | Parent | Child | On Delete |
|---------|--------|-------|-----------|
| REF-01 | Store | Table | CASCADE |
| REF-02 | Store | Category | CASCADE |
| REF-03 | Store | Admin | CASCADE |
| REF-04 | Table | TableSession | CASCADE |
| REF-05 | TableSession | Order | CASCADE |
| REF-06 | Order | OrderItem | CASCADE |
| REF-07 | Category | Menu | CASCADE |
| REF-08 | Menu | OrderItem | SET NULL (menuId만) |

### 8.2 Consistency Rules (일관성 규칙)

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| CON-01 | 주문 총액 일관성 | 주문 생성 시 계산, 항목 변경 없음 |
| CON-02 | 세션 총액 일관성 | 주문 생성/삭제 시 재계산 |
| CON-03 | 주문 번호 고유성 | UNIQUE 제약조건 |

