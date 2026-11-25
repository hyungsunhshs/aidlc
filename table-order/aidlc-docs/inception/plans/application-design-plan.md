# Application Design Plan

## Overview
테이블오더 서비스의 애플리케이션 설계를 위한 계획입니다.

---

## Part 1: Design Questions

아래 질문들에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션 문자를 입력해 주세요.

---

### Section 1: Backend Module Structure

#### Question 1
Modular Monolith 백엔드의 모듈 구성 방식을 어떻게 할까요?

A) **Domain-based**: 도메인별 모듈 (store, table, menu, order, admin)

B) **Layer-based**: 레이어별 모듈 (presentation, application, domain, infrastructure)

C) **Feature-based**: 기능별 모듈 (customer-features, admin-features, shared)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

#### Question 2
모듈 간 통신 방식은 어떻게 할까요?

A) **Direct method calls**: 모듈 간 직접 메서드 호출 (단순, 강한 결합)

B) **Interface-based**: 인터페이스를 통한 의존성 주입 (느슨한 결합)

C) **Event-driven**: 이벤트/메시지 기반 비동기 통신 (가장 느슨한 결합)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Section 2: API Design

#### Question 3
API 설계 스타일은 어떤 것을 선호하시나요?

A) **REST**: 리소스 중심 REST API

B) **REST + SSE**: REST API + Server-Sent Events (실시간 업데이트용)

C) **GraphQL**: GraphQL API

X) Other (please describe after [Answer]: tag below)

[Answer]: A

#### Question 4
고객용 API와 관리자용 API를 어떻게 분리할까요?

A) **Path prefix**: 같은 서버, 경로로 구분 (/api/customer/*, /api/admin/*)

B) **Separate controllers**: 같은 서버, 별도 컨트롤러 패키지

C) **Separate modules**: 별도 모듈로 완전 분리

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Section 3: Data Access

#### Question 5
데이터 접근 계층은 어떻게 구성할까요?

A) **Spring Data JPA only**: JPA Repository 패턴만 사용

B) **JPA + QueryDSL**: 복잡한 쿼리는 QueryDSL 사용

C) **JPA + Native Query**: 복잡한 쿼리는 Native SQL 사용

X) Other (please describe after [Answer]: tag below)

[Answer]: A

#### Question 6
트랜잭션 경계는 어디에 설정할까요?

A) **Service layer**: 서비스 레이어에서 트랜잭션 관리

B) **Use case layer**: 유스케이스/애플리케이션 서비스에서 관리

C) **Repository layer**: 레포지토리 레이어에서 개별 관리

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Section 4: Frontend Architecture

#### Question 7
React 프론트엔드의 상태 관리 방식은 어떻게 할까요?

A) **React Context + useState**: 간단한 상태 관리 (소규모에 적합)

B) **Zustand**: 경량 상태 관리 라이브러리

C) **Redux Toolkit**: 풀스택 상태 관리 (대규모에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

#### Question 8
API 호출은 어떤 방식으로 구현할까요?

A) **Fetch API**: 브라우저 내장 Fetch 사용

B) **Axios**: Axios 라이브러리 사용

C) **React Query (TanStack Query)**: 서버 상태 관리 + 캐싱

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Section 5: Real-time Communication

#### Question 9
SSE (Server-Sent Events) 구현 방식은 어떻게 할까요?

A) **Spring WebFlux**: Reactive 방식 SSE

B) **Spring MVC SseEmitter**: 전통적인 방식 SSE

C) **Spring WebFlux + R2DBC**: 완전 Reactive 스택

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part 2: Design Checklist

질문에 대한 답변이 완료되면, 아래 체크리스트에 따라 설계 문서를 생성합니다.

### Component Identification
- [x] 백엔드 모듈/컴포넌트 식별
- [x] 프론트엔드 컴포넌트 식별
- [x] 공통/공유 컴포넌트 식별

### Component Design
- [x] 각 컴포넌트 책임 정의
- [x] 컴포넌트 인터페이스 정의
- [x] 컴포넌트 메서드 시그니처 정의

### Service Layer Design
- [x] 서비스 정의 및 책임
- [x] 서비스 오케스트레이션 패턴
- [x] 서비스 간 상호작용

### Dependency Design
- [x] 컴포넌트 의존성 관계
- [x] 통신 패턴 정의
- [x] 데이터 흐름 다이어그램

### Documentation
- [x] components.md 생성
- [x] component-methods.md 생성
- [x] services.md 생성
- [x] component-dependency.md 생성
- [x] application-design.md 통합 문서 생성

---

모든 질문에 답변을 완료하셨으면 알려주세요.
