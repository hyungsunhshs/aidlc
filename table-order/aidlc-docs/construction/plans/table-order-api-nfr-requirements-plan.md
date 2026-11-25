# NFR Requirements Plan - table-order-api

## Overview
table-order-api Unit의 Non-Functional Requirements 계획입니다. 성능, 보안, 가용성, 기술 스택 결정을 상세화합니다.

---

## Part 1: Planning

### Step 1: Analyze Existing NFR Context
- [x] Review requirements.md NFR section (NFR-01 ~ NFR-22)
- [x] Review functional design artifacts
- [x] Identify gaps needing clarification

### Step 2: Answer NFR Questions

Requirements Analysis에서 대부분의 NFR이 정의되었습니다. 추가 명확화가 필요한 항목에 답변해주세요.

---

#### Q1: 데이터베이스 Connection Pool 크기

동시 접속 50 테이블 기준으로 DB Connection Pool 크기를 어떻게 설정할까요?

**Options:**
- **A) Small (10-20)**: 소규모 MVP, 단일 인스턴스
- **B) Medium (20-50)**: 여유 있는 설정, 피크 대응
- **C) Auto-scaling**: HikariCP 기본 설정 활용

**Recommendation**: A) MVP 단일 인스턴스 기준 10-20 충분

[Answer]: A

---

#### Q2: 로깅 레벨 및 보관 기간

운영 로그 레벨과 보관 기간을 어떻게 설정할까요?

**Options:**
- **A) Minimal**: INFO 레벨, 7일 보관
- **B) Standard**: INFO 레벨, 30일 보관
- **C) Detailed**: DEBUG 레벨, 90일 보관

**Recommendation**: B) 운영 디버깅에 적절한 수준

[Answer]: B

---

#### Q3: API Rate Limiting

Customer API의 Rate Limit을 설정할까요?

**Options:**
- **A) No limit**: MVP에서는 불필요
- **B) Basic limit**: IP당 100 req/min
- **C) Strict limit**: IP당 30 req/min

**Consideration**: 테이블 태블릿은 내부 네트워크이므로 엄격한 제한 불필요

[Answer]: A

---

#### Q4: 헬스체크 엔드포인트

Kubernetes용 헬스체크 엔드포인트 구성을 어떻게 할까요?

**Options:**
- **A) Basic**: /actuator/health (기본)
- **B) Detailed**: /actuator/health + /actuator/health/liveness + /actuator/health/readiness
- **C) Custom**: 비즈니스 로직 포함 커스텀 헬스체크

**Recommendation**: B) K8s 환경에 적합

[Answer]: B

---

#### Q5: 에러 응답 형식

API 에러 응답 형식을 어떻게 표준화할까요?

**Options:**
- **A) Simple**: HTTP status + message
- **B) RFC 7807**: Problem Details for HTTP APIs 표준
- **C) Custom**: 프로젝트 특화 포맷

**Recommendation**: A) MVP에서는 단순한 형식이 적합

[Answer]: A

---

#### Q6: CORS 설정

Cross-Origin Resource Sharing 정책을 어떻게 설정할까요?

**Options:**
- **A) Allow all origins**: 개발 편의성 (보안 위험)
- **B) Specific origins**: Frontend 도메인만 허용
- **C) Same origin only**: 동일 도메인만 허용

**Recommendation**: B) Frontend 배포 URL만 허용하는 것이 안전

[Answer]: B

---

### Step 3: Generate NFR Artifacts
- [x] Create nfr-requirements.md
- [x] Create tech-stack-decisions.md

---

## Part 2: Generation (After Answers)

### Step 4: NFR Requirements Document
- [x] Performance requirements
- [x] Security requirements
- [x] Availability requirements
- [x] Scalability requirements

### Step 5: Tech Stack Decisions
- [x] Framework versions
- [x] Library selections
- [x] Configuration decisions

### Step 6: Finalize and Validate
- [x] Review all artifacts
- [x] Ensure consistency with existing requirements
- [x] Verify alignment with infrastructure constraints

---

## Notes
- Requirements.md의 NFR-01 ~ NFR-22를 기반으로 상세화
- Security Extension이 활성화되어 있으므로 보안 요구사항 강화
- MVP 범위이므로 복잡한 NFR은 제외

