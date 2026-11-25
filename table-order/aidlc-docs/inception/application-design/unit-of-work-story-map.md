# Unit of Work - Story Mapping

## Overview
User Stories를 Unit of Work에 매핑합니다. Persona-based 매핑 전략에 따라 고객 스토리는 customer-ordering-app에, 관리자 스토리는 store-management-app에 매핑되며, 모든 Backend 로직은 table-order-api에서 처리됩니다.

---

## Story Distribution Summary

| Unit | Customer Stories | Admin Stories | Total |
|------|------------------|---------------|-------|
| **table-order-api** | 13 (Backend) | 19 (Backend) | 32 |
| **customer-ordering-app** | 13 (Frontend) | 0 | 13 |
| **store-management-app** | 0 | 19 (Frontend) | 19 |

---

## Unit 1: table-order-api

### All Stories (Backend Implementation)

table-order-api는 모든 스토리의 Backend 로직을 담당합니다.

#### Customer Stories Backend

| Story ID | Title | Backend Components |
|----------|-------|-------------------|
| US-C01 | 주문 시작하기 | SessionUseCase, SessionController, TableSession Entity |
| US-C02 | 카테고리별 메뉴 보기 | MenuUseCase, MenuController, Category Entity |
| US-C03 | 메뉴 상세 정보 확인 | MenuUseCase, MenuController, Menu Entity |
| US-C04 | 카테고리 간 빠른 이동 | MenuUseCase, MenuController |
| US-C05 | 메뉴를 장바구니에 담기 | (Frontend only - 로컬 상태) |
| US-C06 | 장바구니 수량 조절 | (Frontend only - 로컬 상태) |
| US-C07 | 장바구니에서 메뉴 삭제 | (Frontend only - 로컬 상태) |
| US-C08 | 장바구니 비우기 | (Frontend only - 로컬 상태) |
| US-C09 | 장바구니 유지 (새로고침) | (Frontend only - 로컬 저장소) |
| US-C10 | 주문 내역 확인 및 주문하기 | OrderUseCase, OrderController, Order Entity |
| US-C11 | 주문 성공 처리 | OrderUseCase, OrderController |
| US-C12 | 주문 실패 처리 | OrderUseCase, OrderController, Error Handling |
| US-C13 | 현재 세션 주문 내역 보기 | OrderUseCase, OrderController |

#### Admin Stories Backend

| Story ID | Title | Backend Components |
|----------|-------|-------------------|
| US-A01 | 관리자 로그인 | AdminAuthUseCase, AuthController, JwtTokenProvider |
| US-A02 | 세션 유지 | AdminAuthUseCase, JwtTokenProvider |
| US-A03 | 로그인 시도 제한 | AdminAuthUseCase, Rate Limiting |
| US-A04 | 테이블별 주문 대시보드 보기 | OrderUseCase, DashboardController |
| US-A05 | 실시간 주문 업데이트 | OrderNotificationUseCase, SseController, SseEmitterManager |
| US-A06 | 주문 상세 보기 | OrderUseCase, OrderManagementController |
| US-A07 | 주문 상태 변경 | OrderUseCase, OrderManagementController |
| US-A08 | 테이블 등록 | TableUseCase, TableManagementController |
| US-A09 | 테이블 태블릿 초기 설정 | SessionUseCase, SessionController |
| US-A10 | 주문 삭제 (직권 수정) | OrderUseCase, OrderManagementController |
| US-A11 | 테이블 이용 완료 처리 | TableUseCase, SessionUseCase, TableManagementController |
| US-A12 | 과거 주문 내역 조회 | OrderUseCase, TableManagementController, OrderHistory Entity |
| US-A13 | 매장 등록 | StoreUseCase, StoreController |
| US-A14 | 매장 정보 수정 | StoreUseCase, StoreController |
| US-A15 | 카테고리별 메뉴 조회 | MenuUseCase, MenuManagementController |
| US-A16 | 메뉴 등록 | MenuUseCase, MenuManagementController |
| US-A17 | 메뉴 수정 | MenuUseCase, MenuManagementController |
| US-A18 | 메뉴 삭제 | MenuUseCase, MenuManagementController |
| US-A19 | 메뉴 노출 순서 조정 | MenuUseCase, MenuManagementController |

---

## Unit 2: customer-ordering-app

### Customer Stories (Frontend Implementation)

| Story ID | Title | Priority | Frontend Components |
|----------|-------|----------|---------------------|
| US-C01 | 주문 시작하기 | 🔴 Must | StartSessionPage, SessionContext |
| US-C02 | 카테고리별 메뉴 보기 | 🔴 Must | MenuPage, CategoryTabs, MenuGrid |
| US-C03 | 메뉴 상세 정보 확인 | 🔴 Must | MenuCard |
| US-C04 | 카테고리 간 빠른 이동 | 🔴 Must | CategoryTabs |
| US-C05 | 메뉴를 장바구니에 담기 | 🔴 Must | MenuCard, CartContext |
| US-C06 | 장바구니 수량 조절 | 🔴 Must | CartPage, QuantityControl, CartContext |
| US-C07 | 장바구니에서 메뉴 삭제 | 🔴 Must | CartPage, CartItem, CartContext |
| US-C08 | 장바구니 비우기 | 🔴 Must | CartPage, CartContext |
| US-C09 | 장바구니 유지 (새로고침) | 🔴 Must | CartContext (localStorage) |
| US-C10 | 주문 내역 확인 및 주문하기 | 🔴 Must | CartPage, CartSummary, OrderSuccessModal |
| US-C11 | 주문 성공 처리 | 🔴 Must | OrderSuccessModal |
| US-C12 | 주문 실패 처리 | 🔴 Must | CartPage (Error Handling) |
| US-C13 | 현재 세션 주문 내역 보기 | 🔴 Must | OrderHistoryPage, OrderCard, OrderStatus |

### Pages → Stories Mapping

```
StartSessionPage
├── US-C01: 주문 시작하기

MenuPage
├── US-C02: 카테고리별 메뉴 보기
├── US-C03: 메뉴 상세 정보 확인
├── US-C04: 카테고리 간 빠른 이동
└── US-C05: 메뉴를 장바구니에 담기

CartPage
├── US-C05: 메뉴를 장바구니에 담기 (추가 피드백)
├── US-C06: 장바구니 수량 조절
├── US-C07: 장바구니에서 메뉴 삭제
├── US-C08: 장바구니 비우기
├── US-C10: 주문 내역 확인 및 주문하기
├── US-C11: 주문 성공 처리
└── US-C12: 주문 실패 처리

OrderHistoryPage
└── US-C13: 현재 세션 주문 내역 보기

Contexts (Cross-cutting)
├── SessionContext: US-C01, US-C09
└── CartContext: US-C05, US-C06, US-C07, US-C08, US-C09
```

---

## Unit 3: store-management-app

### Admin Stories (Frontend Implementation)

| Story ID | Title | Priority | Frontend Components |
|----------|-------|----------|---------------------|
| US-A01 | 관리자 로그인 | 🔴 Must | LoginPage, AuthContext |
| US-A02 | 세션 유지 | 🔴 Must | AuthContext (token refresh) |
| US-A03 | 로그인 시도 제한 | 🔴 Must | LoginPage (error display) |
| US-A04 | 테이블별 주문 대시보드 보기 | 🔴 Must | DashboardPage, TableCard |
| US-A05 | 실시간 주문 업데이트 | 🔴 Must | DashboardPage, useSSE hook |
| US-A06 | 주문 상세 보기 | 🔴 Must | DashboardPage, OrderDetailModal |
| US-A07 | 주문 상태 변경 | 🔴 Must | OrderDetailModal |
| US-A08 | 테이블 등록 | 🔴 Must | TableManagementPage, TableSetupModal |
| US-A09 | 테이블 태블릿 초기 설정 | 🔴 Must | TableManagementPage |
| US-A10 | 주문 삭제 (직권 수정) | 🔴 Must | OrderDetailModal |
| US-A11 | 테이블 이용 완료 처리 | 🔴 Must | DashboardPage, TableCard |
| US-A12 | 과거 주문 내역 조회 | 🔴 Must | TableManagementPage, OrderHistoryModal |
| US-A13 | 매장 등록 | 🔴 Must | StoreInfoPage, StoreForm |
| US-A14 | 매장 정보 수정 | 🟡 Should | StoreInfoPage, StoreForm |
| US-A15 | 카테고리별 메뉴 조회 | 🔴 Must | MenuManagementPage, CategoryManager |
| US-A16 | 메뉴 등록 | 🔴 Must | MenuManagementPage, MenuForm |
| US-A17 | 메뉴 수정 | 🔴 Must | MenuManagementPage, MenuForm |
| US-A18 | 메뉴 삭제 | 🔴 Must | MenuManagementPage, MenuTable |
| US-A19 | 메뉴 노출 순서 조정 | 🟡 Should | MenuManagementPage (Drag & Drop) |

### Pages → Stories Mapping

```
LoginPage
├── US-A01: 관리자 로그인
├── US-A02: 세션 유지 (token 저장)
└── US-A03: 로그인 시도 제한 (에러 표시)

DashboardPage
├── US-A04: 테이블별 주문 대시보드 보기
├── US-A05: 실시간 주문 업데이트 (SSE)
├── US-A06: 주문 상세 보기
├── US-A07: 주문 상태 변경
├── US-A10: 주문 삭제 (직권 수정)
└── US-A11: 테이블 이용 완료 처리

TableManagementPage
├── US-A08: 테이블 등록
├── US-A09: 테이블 태블릿 초기 설정
└── US-A12: 과거 주문 내역 조회

MenuManagementPage
├── US-A15: 카테고리별 메뉴 조회
├── US-A16: 메뉴 등록
├── US-A17: 메뉴 수정
├── US-A18: 메뉴 삭제
└── US-A19: 메뉴 노출 순서 조정

StoreInfoPage
├── US-A13: 매장 등록
└── US-A14: 매장 정보 수정

Contexts (Cross-cutting)
└── AuthContext: US-A01, US-A02
```

---

## Story Coverage Verification

### All Stories Accounted

| Story ID | Backend (table-order-api) | Frontend |
|----------|---------------------------|----------|
| US-C01 | ✓ | ✓ customer-ordering-app |
| US-C02 | ✓ | ✓ customer-ordering-app |
| US-C03 | ✓ | ✓ customer-ordering-app |
| US-C04 | ✓ | ✓ customer-ordering-app |
| US-C05 | (Frontend only) | ✓ customer-ordering-app |
| US-C06 | (Frontend only) | ✓ customer-ordering-app |
| US-C07 | (Frontend only) | ✓ customer-ordering-app |
| US-C08 | (Frontend only) | ✓ customer-ordering-app |
| US-C09 | (Frontend only) | ✓ customer-ordering-app |
| US-C10 | ✓ | ✓ customer-ordering-app |
| US-C11 | ✓ | ✓ customer-ordering-app |
| US-C12 | ✓ | ✓ customer-ordering-app |
| US-C13 | ✓ | ✓ customer-ordering-app |
| US-A01 | ✓ | ✓ store-management-app |
| US-A02 | ✓ | ✓ store-management-app |
| US-A03 | ✓ | ✓ store-management-app |
| US-A04 | ✓ | ✓ store-management-app |
| US-A05 | ✓ | ✓ store-management-app |
| US-A06 | ✓ | ✓ store-management-app |
| US-A07 | ✓ | ✓ store-management-app |
| US-A08 | ✓ | ✓ store-management-app |
| US-A09 | ✓ | ✓ store-management-app |
| US-A10 | ✓ | ✓ store-management-app |
| US-A11 | ✓ | ✓ store-management-app |
| US-A12 | ✓ | ✓ store-management-app |
| US-A13 | ✓ | ✓ store-management-app |
| US-A14 | ✓ | ✓ store-management-app |
| US-A15 | ✓ | ✓ store-management-app |
| US-A16 | ✓ | ✓ store-management-app |
| US-A17 | ✓ | ✓ store-management-app |
| US-A18 | ✓ | ✓ store-management-app |
| US-A19 | ✓ | ✓ store-management-app |

**Total Stories**: 32  
**Mapped Stories**: 32  
**Orphan Stories**: 0 ✓

---

## Priority Distribution by Unit

### customer-ordering-app (13 stories)
- 🔴 Must: 13 (100%)
- 🟡 Should: 0
- 🟢 Could: 0

### store-management-app (19 stories)
- 🔴 Must: 17 (89.5%)
- 🟡 Should: 2 (10.5%)
- 🟢 Could: 0

### Combined
- 🔴 Must: 30 (93.75%)
- 🟡 Should: 2 (6.25%)

---

## Notes

- 장바구니 관련 스토리(US-C05~C09)는 Frontend 로컬 상태로만 관리되어 Backend 의존성 없음
- 모든 Admin 스토리는 인증(JWT)이 필요하므로 US-A01, US-A02가 선행되어야 함
- 실시간 업데이트(US-A05)는 SSE를 사용하므로 별도의 연결 관리 필요

