# Requirements Verification Questions

제공된 요구사항 문서를 검토했습니다. 개발 진행 전 아래 질문들에 답변해 주세요.
각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션 문자를 입력해 주세요.

---

## 기술 스택 질문

### Question 1
백엔드 개발에 사용할 프로그래밍 언어와 프레임워크는 무엇인가요?

A) Java + Spring Boot

B) TypeScript + Node.js (Express/NestJS)

C) Python + FastAPI/Django

D) Go + Gin/Echo

E) Kotlin + Spring Boot

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
프론트엔드 개발에 사용할 기술 스택은 무엇인가요?

A) React + TypeScript

B) Vue.js + TypeScript

C) Next.js (React 기반 풀스택)

D) Angular + TypeScript

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
데이터베이스로 어떤 것을 사용할 예정인가요?

A) PostgreSQL (관계형)

B) MySQL/MariaDB (관계형)

C) MongoDB (NoSQL Document)

D) DynamoDB (AWS NoSQL)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 아키텍처 질문

### Question 4
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성할 예정인가요?

A) 단일 웹 애플리케이션에서 경로로 분리 (예: /customer, /admin)

B) 별도의 프론트엔드 애플리케이션 2개 (고객용, 관리자용)

C) 고객용은 모바일 앱, 관리자용은 웹 애플리케이션

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 5
백엔드 아키텍처 패턴은 어떤 것을 선호하시나요?

A) Monolithic (단일 애플리케이션)

B) Modular Monolith (모듈화된 단일 애플리케이션)

C) Microservices (마이크로서비스)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 운영 환경 질문

### Question 6
배포 환경은 어디를 목표로 하시나요?

A) AWS (EC2, ECS, Lambda 등)

B) 로컬 서버 / On-premise

C) Docker 컨테이너 기반 (배포 환경은 추후 결정)

D) Kubernetes 기반 클라우드

X) Other (please describe after [Answer]: tag below)

[Answer]: A(EKS Automode)

### Question 7
예상되는 동시 접속자 수 (테이블 수 기준)는 어느 정도인가요?

A) 소규모 (1-50 테이블, 단일 매장)

B) 중규모 (50-200 테이블, 복수 매장)

C) 대규모 (200+ 테이블, 프랜차이즈)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 데이터 및 비즈니스 로직 질문

### Question 8
메뉴 이미지 저장 방식은 어떻게 할 예정인가요?

A) 외부 URL 참조 (CDN 또는 외부 이미지 호스팅)

B) 로컬 파일 시스템에 저장

C) 클라우드 스토리지 (S3 등) 사용

X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 9
매장(Store)과 테이블(Table) 데이터는 어떻게 초기화할 예정인가요?

A) 관리자 화면에서 직접 등록 (매장 등록 기능 포함)

B) 데이터베이스에 직접 시드 데이터 삽입 (매장은 사전 설정)

C) API를 통한 프로그래밍 방식 등록

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
테이블 세션 시작 조건에 대해 확인합니다. 요구사항에는 "첫 주문 시작 시 세션 시작"이라고 되어 있는데, 이 방식이 맞나요?

A) 맞습니다 - 첫 주문이 들어올 때 세션 자동 시작

B) 아니요 - 고객이 테이블에 착석 시 명시적으로 세션 시작 버튼 필요

C) 아니요 - 관리자가 테이블 세션을 수동으로 시작

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Extension 옵트인 질문

### Question 11: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용할까요?

A) Yes — 모든 SECURITY 규칙을 blocking 제약 조건으로 적용 (프로덕션 수준 애플리케이션 권장)

B) No — SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12: Resiliency Extensions
이 프로젝트에 복원력 베이스라인을 적용할까요?

**이 확장이 하는 일**: AWS Well-Architected Framework (Reliability Pillar)를 기반으로 내결함성, 고가용성, 관찰 가능성, 복구 가능성을 위한 설계 시점 모범 사례를 적용합니다.

**이 확장이 하지 않는 일**: 프로덕션 준비 완료를 보장하거나 가용성/RTO/RPO 목표를 인증하지 않습니다. 초기 복원력 결정을 위한 출발점입니다.

A) Yes — 복원력 베이스라인을 방향적 모범 사례로 적용 (비즈니스 크리티컬 워크로드에 권장)

B) No — 복원력 베이스라인 건너뛰기 (PoC, 프로토타입, 빠른 반복이 중요한 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 13: Property-Based Testing Extension
이 프로젝트에 Property-Based Testing (PBT) 규칙을 적용할까요?

A) Yes — 모든 PBT 규칙을 blocking 제약 조건으로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트 권장)

B) Partial — 순수 함수와 직렬화 round-trip에만 PBT 규칙 적용 (알고리즘 복잡도가 제한적인 프로젝트에 적합)

C) No — 모든 PBT 규칙 건너뛰기 (단순 CRUD, UI 전용 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## 추가 확인 질문

### Question 14
MVP 범위에 대해 확인합니다. 요구사항 문서의 "MVP 개발 범위"에 명시된 기능만 구현하면 될까요?

A) 맞습니다 - MVP 범위만 구현

B) 아니요 - 섹션 3의 전체 핵심 기능 요구사항 모두 구현

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
메뉴 관리 기능(3.2.4)이 MVP에 명시되지 않았는데, 이 기능은 어떻게 할까요?

A) MVP에서 제외 - 메뉴는 데이터베이스에 직접 시드 데이터로 등록

B) MVP에 포함 - 관리자용 메뉴 관리 기능도 함께 개발

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

모든 질문에 답변을 완료하셨으면 알려주세요.
