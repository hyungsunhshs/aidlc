# NFR Design Plan - table-order-api

## Overview
table-order-api Unit의 NFR Design 계획입니다. NFR 요구사항을 설계 패턴과 논리 컴포넌트로 구체화합니다.

**Note**: Resiliency Extension이 비활성화되어 있으므로 고급 복원력 패턴(Circuit Breaker, Retry 등)은 제외합니다.

---

## Part 1: Planning

### Step 1: Analyze NFR Requirements Context
- [x] Review nfr-requirements.md
- [x] Review tech-stack-decisions.md
- [x] Identify applicable patterns (MVP scope)

### Step 2: Answer NFR Design Questions

NFR Requirements에서 기술 스택이 결정되었습니다. 설계 패턴 적용에 대한 추가 질문입니다.

---

#### Q1: Exception Handling 전략

예외 처리 계층 구조를 어떻게 설계할까요?

**Options:**
- **A) Flat**: 단일 BusinessException + 에러 코드
- **B) Hierarchical**: 도메인별 Exception 계층 (OrderException, MenuException 등)
- **C) Spring Standard**: ResponseStatusException 사용

**Recommendation**: A) MVP에서는 단순한 구조가 유지보수에 유리

[Answer]: 

---

#### Q2: DTO 변환 전략

Entity ↔ DTO 변환을 어떻게 처리할까요?

**Options:**
- **A) Manual**: 직접 변환 메서드 작성
- **B) MapStruct**: 컴파일 타임 매퍼 생성
- **C) ModelMapper**: 런타임 리플렉션 기반

**Recommendation**: A) MVP 규모에서는 직접 작성이 명확하고 디버깅 용이

[Answer]: 

---

#### Q3: SSE Connection ���리

SSE 연결 관리 방식을 어떻게 설계할까요?

**Options:**
- **A) In-Memory**: ConcurrentHashMap으로 관리 (단일 인스턴스)
- **B) Redis Pub/Sub**: 다중 인스턴스 지원
- **C) Spring WebFlux**: 리액티브 스트림 기반

**Recommendation**: A) MVP 단일 인스턴스 환경, 추후 확장 시 B로 전환

[Answer]: 

---

#### Q4: Validation 적용 위치

입력 검증을 어느 계층에서 수행할까요?

**Options:**
- **A) Controller only**: @Valid로 DTO 검증
- **B) Controller + UseCase**: DTO 검증 + 비즈니스 규칙 검증
- **C) All layers**: 모든 계층에서 방어적 검증

**Recommendation**: B) Controller에서 형식 검증, UseCase에서 비즈니스 규칙 검증

[Answer]: 

---

### Step 3: Generate NFR Design Artifacts
- [x] Create nfr-design-patterns.md
- [x] Create logical-components.md

---

## Part 2: Generation (After Answers)

### Step 4: Design Patterns
- [x] Security patterns
- [x] Performance patterns
- [x] Error handling patterns

### Step 5: Logical Components
- [x] Infrastructure components
- [x] Cross-cutting concerns

### Step 6: Finalize and Validate
- [x] Review all artifacts
- [x] Ensure alignment with NFR requirements
- [x] Verify implementation feasibility

---

## Notes
- Resiliency Extension 비활성화 → Circuit Breaker, Retry 패턴 제외
- MVP 단일 인스턴스 환경 가정
- 확장 가능한 구조로 설계하되, 복잡도는 최소화

