# Functional Design Plan - table-order-api

## Overview
table-order-api Unit의 Functional Design 계획입니다. 비즈니스 로직, 도메인 모델, 비즈니스 규칙을 상세 설계합니다.

---

## Part 1: Planning

### Step 1: Analyze Unit Context
- [x] Review unit definition from unit-of-work.md
- [x] Review assigned stories (32 stories - all backend logic)
- [x] Understand unit boundaries

### Step 2: Answer Functional Design Questions

아래 질문에 답변해주세요. 각 질문의 `[Answer]:` 뒤에 답변을 작성해주세요.

---

#### Q1: 주문 번호 생성 규칙

주문 번호(Order Number)를 어떤 형식으로 생성할까요?

**Options:**
- **A) Sequential per day**: 일별 순번 (예: 20250121-001, 20250121-002)
- **B) Sequential per session**: 세션별 순번 (예: 테이블1-01, 테이블1-02)
- **C) Random unique**: UUID 기반 (예: ORD-A1B2C3D4)
- **D) Store-prefixed**: 매장코드 + 순번 (예: STORE01-20250121-001)

[Answer]: A

---

#### Q2: 세션 만료 처리

테이블 세션이 16시간 경과 후 자동 만료될 때 처리 방식을 선택해주세요.

**Options:**
- **A) Soft delete**: 세션 상태만 EXPIRED로 변경, 주문 데이터 유지
- **B) Auto-complete**: 자동으로 이용 완료 처리 (주문 → 히스토리 이동)
- **C) Manual only**: 자동 만료 없음, 관리자가 직접 이용 완료 처리

[Answer]: A

---

#### Q3: 메뉴 가격 변경 시 기존 주문 처리

메뉴 가격이 변경되었을 때 이미 생성된 주문의 가격을 어떻게 처리할까요?

**Options:**
- **A) Snapshot**: 주문 시점의 가격 저장 (OrderItem에 unitPrice 보관)
- **B) Reference**: 메뉴 가격 참조 (가격 변경 시 기존 주문도 변경됨)

**Recommendation**: A) 주문 시점 가격 저장이 일반적인 비즈니스 관행입니다.

[Answer]: A

---

#### Q4: 주문 상태 전이 규칙

주문 상태 변경에 제한을 둘까요?

**Options:**
- **A) Strict flow**: PENDING → PREPARING → COMPLETED 순서만 허용
- **B) Flexible**: 어떤 상태에서든 다른 상태로 변경 가능
- **C) Semi-flexible**: 역방향(COMPLETED → PREPARING) 불가, 순방향과 삭제만 허용

[Answer]: A

---

#### Q5: 테이블 비밀번호 정책

테이블 태블릿 인증용 비밀번호의 복잡도를 어떻게 설정할까요?

**Options:**
- **A) Simple numeric**: 4자리 숫자 (예: 1234)
- **B) Alphanumeric**: 영문+숫자 6자리 이상
- **C) No restriction**: 제한 없음 (관리자 재량)

**Consideration**: 테이블 태블릿은 고객이 아닌 매장 내부 장비이므로 간단해도 됩니다.

[Answer]: A

---

#### Q6: 카테고리/메뉴 삭제 시 연관 데이터 처리

카테고리 삭제 시 하위 메뉴는 어떻게 처리할까요?

**Options:**
- **A) Cascade delete**: 카테고리 삭제 시 하위 메뉴도 삭제
- **B) Block delete**: 하위 메뉴가 있으면 삭제 불가
- **C) Orphan allowed**: 카테고리만 삭제, 메뉴는 "미분류"로 이동

[Answer]: A

---

#### Q7: 메뉴 삭제 시 주문 이력 처리

메뉴가 삭제되었을 때 해당 메뉴가 포함된 과거 주문을 어떻게 표시할까요?

**Options:**
- **A) Soft delete**: 메뉴를 비활성화만 (deleted=true), 주문에서 계속 참조 가능
- **B) Snapshot in order**: OrderItem에 메뉴명, 가격 등 복사 저장
- **C) Both**: Soft delete + Snapshot 모두 적용

**Recommendation**: C) 가장 안전한 방식입니다.

[Answer]: C

---

#### Q8: 동시 주문 처리

같은 테이블에서 동시에 여러 주문이 들어올 때 처리 방식은?

**Options:**
- **A) Allow all**: 모든 주문 허용 (각각 별도 주문으로 처리)
- **B) Merge cart**: 장바구니 병합 (동일 세션 내 미완료 주문에 추가)
- **C) Lock table**: 주문 처리 중 테이블 잠금 (다른 주문 대기)

**Recommendation**: A) 테이블 태블릿 환경에서는 순차 주문이 일반적이지만, 동시 주문도 허용하는 것이 유연합니다.

[Answer]: A

---

#### Q9: 관리자 계정 관리

관리자 계정 생성 및 관리 방식을 선택해주세요.

**Options:**
- **A) Single admin per store**: 매장당 1개 관리자 계정
- **B) Multiple admins**: 매장당 여러 관리자 계정 가능
- **C) Super admin**: 매장 관리자 + 시스템 관리자 구분

**Consideration**: MVP 범위에서는 단순한 구조가 적합합니다.

[Answer]: B

---

#### Q10: 주문 금액 계산

주문 총액 계산 방식을 선택해주세요.

**Options:**
- **A) Real-time calculation**: 매번 OrderItem 합산으로 계산
- **B) Stored total**: Order 테이블에 totalAmount 저장 (OrderItem 변경 시 업데이트)

**Recommendation**: B) 조회 성능을 위해 저장하되, 무결성을 위해 생성/수정 시 재계산합니다.

[Answer]: B

---

### Step 3: Generate Functional Design Artifacts
- [x] Create business-logic-model.md
- [x] Create business-rules.md
- [x] Create domain-entities.md

---

## Part 2: Generation (After Answers)

### Step 4: Business Logic Model
- [x] Define core business workflows
- [x] Define data transformations
- [x] Define integration points

### Step 5: Business Rules
- [x] Define validation rules
- [x] Define state transition rules
- [x] Define calculation rules
- [x] Define authorization rules

### Step 6: Domain Entities
- [x] Define entity attributes in detail
- [x] Define entity relationships
- [x] Define value objects

### Step 7: Finalize and Validate
- [x] Review all artifacts
- [x] Ensure coverage of all assigned stories
- [x] Verify consistency with Application Design

---

## Notes
- 이 Unit은 모든 32개 스토리의 Backend 로직을 담당합니다
- Customer API와 Admin API 모두 포함
- 기술 스택: Java 17 + Spring Boot 3 + PostgreSQL

