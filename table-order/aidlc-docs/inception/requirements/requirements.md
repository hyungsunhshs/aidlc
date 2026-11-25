# 테이블오더 서비스 요구사항 명세서

## Intent Analysis Summary

| 항목 | 내용 |
|------|------|
| **User Request** | 테이블오더 서비스 구축 (디지털 주문 시스템) |
| **Request Type** | New Project (신규 프로젝트) |
| **Scope Estimate** | Multiple Components (다중 컴포넌트) |
| **Complexity Estimate** | Moderate (중간 복잡도) |
| **Project Type** | Greenfield |

---

## 1. 프로젝트 개요

### 1.1 서비스 비전
디지털 주문 시스템을 통해 고객에게는 편리한 주문 경험을, 매장 운영자에게는 효율적인 운영 환경을 제공하는 테이블오더 플랫폼

### 1.2 핵심 가치 제안

| 관점 | 가치 |
|------|------|
| **고객** | 대기 시간 없는 즉시 주문, 직관적인 인터페이스 |
| **매장 운영자** | 인건비 절감, 운영 효율성 증대, 실시간 주문 관리 |
| **시장 차별화** | 다양한 업종 적용 가능, 직관적인 관리자 도구 |

### 1.3 개발 범위
- **MVP 범위만 구현** (요구사항 문서 섹션 4 기준)
- **추가 포함**: 메뉴 관리 기능 (관리자용)

---

## 2. 기술 스택 결정사항

### 2.1 Backend
| 항목 | 선택 |
|------|------|
| **Language** | Java |
| **Framework** | Spring Boot |
| **Architecture** | Modular Monolith |

### 2.2 Frontend
| 항목 | 선택 |
|------|------|
| **Language** | TypeScript |
| **Framework** | React |
| **구성** | 별도의 프론트엔드 애플리케이션 2개 (고객용, 관리자용) |

### 2.3 Database & Storage
| 항목 | 선택 |
|------|------|
| **Database** | PostgreSQL |
| **Image Storage** | AWS S3 |

### 2.4 Infrastructure
| 항목 | 선택 |
|------|------|
| **Cloud Provider** | AWS |
| **Container Orchestration** | EKS Automode |
| **Target Scale** | 소규모 (1-50 테이블, 단일 매장) |

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 고객용 기능 (Customer App)

#### FR-C01: 테이블 세션 관리
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-C01.1 | 고객이 테이블에 착석 시 명시적으로 "주문 시작" 버튼을 눌러 세션 시작 | Must |
| FR-C01.2 | 세션 시작 후 해당 테이블의 모든 주문이 세션에 연결됨 | Must |
| FR-C01.3 | 세션 정보는 브라우저에 로컬 저장 (새로고침 시 유지) | Must |

#### FR-C02: 메뉴 조회 및 탐색
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-C02.1 | 메뉴 화면이 기본 화면으로 표시 | Must |
| FR-C02.2 | 카테고리별 메뉴 분류 및 표시 | Must |
| FR-C02.3 | 메뉴 상세 정보 표시 (메뉴명, 가격, 설명, 이미지) | Must |
| FR-C02.4 | 카테고리 간 빠른 이동 | Must |
| FR-C02.5 | 카드 형태의 메뉴 레이아웃, 터치 친화적 버튼 (최소 44x44px) | Must |

#### FR-C03: 장바구니 관리
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-C03.1 | 메뉴 추가/삭제 기능 | Must |
| FR-C03.2 | 수량 조절 (증가/감소) | Must |
| FR-C03.3 | 총 금액 실시간 계산 | Must |
| FR-C03.4 | 장바구니 비우기 | Must |
| FR-C03.5 | 로컬 저장 (페이지 새로고침 시에도 유지) | Must |

#### FR-C04: 주문 생성
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-C04.1 | 주문 내역 최종 확인 화면 | Must |
| FR-C04.2 | 주문 확정 버튼 | Must |
| FR-C04.3 | 주문 성공 시: 주문 번호 표시, 장바구니 자동 비우기, 5초 후 메뉴 화면으로 자동 리다이렉트 | Must |
| FR-C04.4 | 주문 실패 시: 에러 메시지 표시, 장바구니 유지 | Must |

#### FR-C05: 주문 내역 조회
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-C05.1 | 현재 테이블 세션의 주문만 표시 (이전 세션 제외) | Must |
| FR-C05.2 | 주문 시간 순 정렬 | Must |
| FR-C05.3 | 주문별 상세 정보 표시 (주문 번호, 시각, 메뉴/수량, 금액, 상태) | Must |
| FR-C05.4 | 주문 상태: 대기중/준비중/완료 | Must |

### 3.2 관리자용 기능 (Admin App)

#### FR-A01: 매장 인증
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-A01.1 | 매장 식별자, 사용자명, 비밀번호 입력 로그인 | Must |
| FR-A01.2 | 16시간 세션 유지 (JWT 토큰 기반) | Must |
| FR-A01.3 | 브라우저 새로고침 시 세션 유지 | Must |
| FR-A01.4 | 16시간 후 자동 로그아웃 | Must |
| FR-A01.5 | 비밀번호 bcrypt 해싱 저장 | Must |
| FR-A01.6 | 로그인 시도 제한 (브루트포스 방지) | Must |

#### FR-A02: 실시간 주문 모니터링
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-A02.1 | Server-Sent Events (SSE) 기반 실시간 업데이트 | Must |
| FR-A02.2 | 그리드/대시보드 레이아웃 (테이블별 카드 형태) | Must |
| FR-A02.3 | 각 테이블 카드에 총 주문액 및 최신 주문 미리보기 | Must |
| FR-A02.4 | 주문 카드 클릭 시 전체 메뉴 목록 상세 보기 | Must |
| FR-A02.5 | 주문 상태 변경 (대기중/준비중/완료) | Must |
| FR-A02.6 | 신규 주문 시각적 강조 (색상 변경, 애니메이션) | Must |
| FR-A02.7 | 2초 이내 주문 표시 | Must |

#### FR-A03: 테이블 관리
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-A03.1 | 테이블 등록 (테이블 번호, 비밀번호 설정) | Must |
| FR-A03.2 | 테이블 태블릿 초기 설정 (16시간 세션 생성) | Must |
| FR-A03.3 | 주문 삭제 (직권 수정) - 확인 팝업 후 삭제, 총 주문액 재계산 | Must |
| FR-A03.4 | 테이블 세션 종료 (매장 이용 완료) - 주문 내역 과거 이력으로 이동, 테이블 리셋 | Must |
| FR-A03.5 | 과거 주문 내역 조회 (테이블별, 시간 역순, 날짜 필터링) | Must |

#### FR-A04: 매장 관리
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-A04.1 | 매장 등록 (관리자 화면에서 직접 등록) | Must |
| FR-A04.2 | 매장 정보 수정 | Should |

#### FR-A05: 메뉴 관리
| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-A05.1 | 메뉴 조회 (카테고리별) | Must |
| FR-A05.2 | 메뉴 등록 (메뉴명, 가격, 설명, 카테고리, 이미지 URL) | Must |
| FR-A05.3 | 메뉴 수정 | Must |
| FR-A05.4 | 메뉴 삭제 | Must |
| FR-A05.5 | 메뉴 노출 순서 조정 | Should |
| FR-A05.6 | 필수 필드 검증, 가격 범위 검증 | Must |

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

### 4.1 성능
| ID | 요구사항 | 목표 |
|----|----------|------|
| NFR-01 | API 응답 시간 | 95% < 500ms |
| NFR-02 | SSE 주문 전달 지연 | < 2초 |
| NFR-03 | 동시 접속 | 50 테이블 동시 지원 |

### 4.2 보안 (Security Extension Enabled)
| ID | 요구사항 |
|----|----------|
| NFR-04 | 모든 데이터 저장소 암호화 (at rest, in transit) |
| NFR-05 | 네트워크 중간자 접근 로깅 (Load Balancer, API Gateway) |
| NFR-06 | 애플리케이션 레벨 구조화 로깅 |
| NFR-07 | HTTP 보안 헤더 설정 (CSP, HSTS, X-Content-Type-Options 등) |
| NFR-08 | 모든 API 파라미터 입력 검증 |
| NFR-09 | 최소 권한 원칙 적용 |
| NFR-10 | 제한적 네트워크 구성 (deny-by-default) |
| NFR-11 | 애플리케이션 레벨 접근 제어 (인증/인가) |
| NFR-12 | 보안 강화 및 설정 오류 방지 |
| NFR-13 | 소프트웨어 공급망 보안 (의존성 고정, 취약점 스캔) |
| NFR-14 | 보안 설계 원칙 적용 (관심사 분리, 심층 방어, 속도 제한) |
| NFR-15 | 인증 및 자격 증명 관리 (bcrypt, 세션 관리, 브루트포스 방지) |
| NFR-16 | 소프트웨어/데이터 무결성 검증 |
| NFR-17 | 보안 이벤트 알림 및 모니터링 |
| NFR-18 | 예외 처리 및 Fail-Safe 기본값 |

### 4.3 가용성
| ID | 요구사항 | 목표 |
|----|----------|------|
| NFR-19 | 서비스 가용성 | 99% (소규모 MVP 기준) |

### 4.4 유지보수성
| ID | 요구사항 |
|----|----------|
| NFR-20 | Modular Monolith 아키텍처로 모듈 간 명확한 경계 |
| NFR-21 | API 문서화 (OpenAPI/Swagger) |
| NFR-22 | 코드 주석 및 README 문서화 |

---

## 5. 데이터 모델 (High-Level)

### 5.1 핵심 엔티티
| 엔티티 | 설명 |
|--------|------|
| **Store** | 매장 정보 |
| **Table** | 테이블 정보 (매장 소속) |
| **TableSession** | 테이블 세션 (착석~이용완료) |
| **Category** | 메뉴 카테고리 |
| **Menu** | 메뉴 항목 |
| **Order** | 주문 |
| **OrderItem** | 주문 항목 |
| **OrderHistory** | 완료된 주문 이력 |
| **Admin** | 관리자 계정 |

### 5.2 주요 관계
```
Store 1:N Table
Store 1:N Category
Store 1:N Admin
Category 1:N Menu
Table 1:N TableSession
TableSession 1:N Order
Order 1:N OrderItem
OrderItem N:1 Menu
```

---

## 6. 제외 범위 (Out of Scope)

다음 기능들은 MVP에서 제외됩니다 (constraints.md 기준):

- 결제 처리 (PG사 연동, 영수증, 환불, 포인트/쿠폰)
- 복잡한 사용자 인증 (OAuth, SNS 로그인, 2FA)
- 이미지 리사이징/최적화
- 알림 시스템 (푸시, SMS, 이메일)
- 주방 기능 (주문 전달, 재고 관리)
- 고급 기능 (분석, 리포트, 직원 관리, 예약, 리뷰, 다국어)
- 외부 연동 (배달 플랫폼, POS, 소셜 미디어)

---

## 7. Extension Configuration

| Extension | Enabled | Decided At |
|-----------|---------|------------|
| Security Baseline | Yes | Requirements Analysis |
| Resiliency Baseline | No | Requirements Analysis (User override) |
| Property-Based Testing | No | Requirements Analysis |

---

## 8. 용어 정의

| 용어 | 정의 |
|------|------|
| **테이블 세션** | 고객이 테이블에서 "주문 시작" 버튼을 눌러 세션을 시작한 후부터 관리자가 "매장 이용 완료" 처리할 때까지의 기간 |
| **MVP** | Minimum Viable Product - 최소 기능 제품 |
| **SSE** | Server-Sent Events - 서버에서 클라이언트로 단방향 실시간 통신 |
| **Modular Monolith** | 단일 배포 단위이지만 내부적으로 모듈화된 아키텍처 |
