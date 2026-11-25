# Unit of Work Plan

## Overview
테이블오더 서비스를 개발 단위(Unit of Work)로 분해하기 위한 계획입니다.

---

## Part 1: Planning

### Step 1: Understand Current Context
- [x] Review Application Design artifacts
- [x] Review User Stories and mappings
- [x] Identify deployment model and boundaries

### Step 2: Answer Decomposition Questions

아래 질문에 답변해주세요. 각 질문의 `[Answer]:` 뒤에 선택 옵션 또는 답변을 작성해주세요.

---

#### Q1: Deployment Model (배포 모델)

현재 설계는 Modular Monolith입니다. 개발 단위(Unit of Work)를 어떻게 구성할까요?

**Options:**
- **A) Single Unit**: 전체 시스템을 하나의 Unit으로 (Backend + Frontend 모두 포함)
- **B) Layered Units**: Backend 1개 + Frontend 2개 (Customer App, Admin App)로 분리
- **C) Feature Units**: 기능별로 분리 (예: 주문 관리, 메뉴 관리, 테이블 관리 등)

**Recommendation**: B) Backend와 Frontend는 기술 스택과 배포 단위가 다르므로 분리하는 것이 효율적입니다.

[Answer]: B

---

#### Q2: Backend Unit Scope (백엔드 Unit 범위)

Backend Unit에 포함될 범위를 선택해주세요.

**Options:**
- **A) Full Backend**: 모든 API 모듈 (Customer API + Admin API + 공통 서비스)
- **B) API Split**: Customer API와 Admin API를 별도 Unit으로 분리

**Recommendation**: A) Modular Monolith이므로 단일 Backend Unit이 적합합니다. 모듈 간 경계는 코드 레벨에서 유지합니다.

[Answer]: A

---

#### Q3: Frontend Units Priority (프론트엔드 개발 순서)

Customer App과 Admin App 중 개발 우선순위를 정해주세요.

**Options:**
- **A) Customer First**: Customer App 먼저 → Admin App
- **B) Admin First**: Admin App 먼저 → Customer App
- **C) Parallel**: 동시 개발 (별도 Unit으로 병렬 진행)

**Considerations**: 
- Customer App: 주문 생성 기능, 고객 경험의 핵심
- Admin App: 메뉴/테이블 설정, 운영에 필수

[Answer]: C

---

#### Q4: Story-to-Unit Mapping Strategy (스토리 매핑 전략)

스토리를 Unit에 매핑하는 전략을 선택해주세요.

**Options:**
- **A) Persona-based**: 고객 스토리 → Customer App, 관리자 스토리 → Admin App (백엔드 공유)
- **B) Feature-based**: 기능 그룹별로 Unit 할당 (메뉴 관련, 주문 관련 등)
- **C) Journey-based**: User Journey별로 Unit 할당

**Recommendation**: A) 이미 스토리가 Persona별로 구분되어 있으므로 자연스러운 매핑입니다.

[Answer]: A

---

#### Q5: Cross-Unit Dependencies (Unit 간 의존성 처리)

Frontend Unit들이 Backend Unit에 의존하는 형태입니다. 개발 순서를 어떻게 처리할까요?

**Options:**
- **A) Sequential**: Backend 완료 후 Frontend 시작
- **B) API-Contract First**: API 명세 먼저 작성 후 Backend/Frontend 병렬 개발
- **C) Incremental**: Backend 기능 완료될 때마다 해당 Frontend 기능 개발

**Recommendation**: A) MVP 범위이고 단일 개발자/팀 상황이라면 Sequential이 단순합니다.

[Answer]: B

---

#### Q6: Unit Naming Convention (Unit 이름 규칙)

Unit 이름을 어떻게 지정할까요?

**Options:**
- **A) Technical**: `backend-api`, `frontend-customer`, `frontend-admin`
- **B) Product-oriented**: `table-order-api`, `customer-ordering-app`, `store-management-app`
- **C) Simple**: `backend`, `customer-app`, `admin-app`

[Answer]: B

---

### Step 3: Create Unit Artifacts
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` with unit definitions and responsibilities
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` with dependency matrix
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` mapping stories to units
- [x] Document code organization strategy in `unit-of-work.md` (Greenfield)
- [x] Validate unit boundaries and dependencies
- [x] Ensure all stories are assigned to units

---

## Part 2: Generation

### Step 4: Generate Unit Definitions
- [x] Define Unit 1: Backend API
  - [x] Define scope and responsibilities
  - [x] List included modules/components
  - [x] Define interfaces/contracts
- [x] Define Unit 2: Customer Frontend
  - [x] Define scope and responsibilities
  - [x] List included components
  - [x] Define API dependencies
- [x] Define Unit 3: Admin Frontend
  - [x] Define scope and responsibilities
  - [x] List included components
  - [x] Define API dependencies

### Step 5: Generate Dependency Matrix
- [x] Document inter-unit dependencies
- [x] Define dependency direction
- [x] Identify shared resources

### Step 6: Generate Story Mapping
- [x] Map Customer stories (US-C01 ~ US-C13) to units
- [x] Map Admin stories (US-A01 ~ US-A19) to units
- [x] Verify complete story coverage

### Step 7: Finalize and Validate
- [x] Review all unit definitions
- [x] Validate no orphan stories
- [x] Confirm unit boundaries align with Application Design

---

## Notes
- All units share the same PostgreSQL database
- Backend provides REST API and SSE for all frontends
- Each frontend is an independent React SPA deployment

