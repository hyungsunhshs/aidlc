# Code Generation Plan - store-management-app

## Overview
store-management-app Unit의 코드 생성 계획입니다. 매장 관리자용 앱 (React + TypeScript)입니다.

---

## Unit Context

### Technology Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: React Context + useState
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Real-time**: Server-Sent Events (SSE)

### Stories Covered (19 Admin Stories)
- US-A01: 관리자 로그인
- US-A02: 세션 유지
- US-A03: 로그인 시도 제한
- US-A04: 테이블별 주문 대시보드 보기
- US-A05: 실시간 주문 업데이트
- US-A06: 주문 상세 보기
- US-A07: 주문 상태 변경
- US-A08: 테이블 등록
- US-A09: 테이블 태블릿 초기 설정 (참고 - 주로 customer-ordering-app 관련)
- US-A10: 주문 삭제 (직권 수정)
- US-A11: 테이블 이용 완료 처리
- US-A12: 과거 주문 내역 조회
- US-A13: 매장 등록 (참고 - 슈퍼어드민 기능, MVP에서는 간소화)
- US-A14: 매장 정보 수정
- US-A15: 카테고리별 메뉴 조회
- US-A16: 메뉴 등록
- US-A17: 메뉴 수정
- US-A18: 메뉴 삭제
- US-A19: 메뉴 노출 순서 조정

---

## Code Location

```
/Users/hyungsun/aidlc-workshop/table-order/
└── store-management-app/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── vite-env.d.ts
        ├── api/
        │   └── client.ts
        ├── contexts/
        │   └── AuthContext.tsx
        ├── hooks/
        │   └── useSSE.ts
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── TableDetailPage.tsx
        │   ├── TableManagementPage.tsx
        │   ├── MenuManagementPage.tsx
        │   └── StoreSettingsPage.tsx
        ├── components/
        │   ├── common/
        │   │   ├── LoadingSpinner.tsx
        │   │   ├── ErrorMessage.tsx
        │   │   ├── ConfirmModal.tsx
        │   │   └── Toast.tsx
        │   ├── dashboard/
        │   │   ├── TableCard.tsx
        │   │   ├── TableGrid.tsx
        │   │   └── OrderSummary.tsx
        │   ├── table/
        │   │   ├── OrderList.tsx
        │   │   ├── OrderItem.tsx
        │   │   ├── OrderStatusBadge.tsx
        │   │   └── TableForm.tsx
        │   └── menu/
        │       ├── CategoryList.tsx
        │       ├── MenuList.tsx
        │       ├── MenuCard.tsx
        │       └── MenuForm.tsx
        └── types/
            └── index.ts
```

---

## Generation Steps

### Step 1: Project Configuration
- [x] Create `package.json`
- [x] Create `vite.config.ts`
- [x] Create `tsconfig.json`
- [x] Create `tailwind.config.js`
- [x] Create `postcss.config.js`
- [x] Create `index.html`
- [x] Create `src/index.css` (Tailwind directives)
- [x] Create `src/vite-env.d.ts`

### Step 2: Type Definitions
- [x] Create `src/types/index.ts`

### Step 3: API Client
- [x] Create `src/api/client.ts`

### Step 4: Contexts & Hooks
- [x] Create `src/contexts/AuthContext.tsx`
- [x] Create `src/hooks/useSSE.ts`

### Step 5: Common Components
- [x] Create `src/components/common/LoadingSpinner.tsx`
- [x] Create `src/components/common/ErrorMessage.tsx`
- [x] Create `src/components/common/ConfirmModal.tsx`
- [x] Create `src/components/common/Toast.tsx`

### Step 6: Dashboard Components
- [x] Create `src/components/dashboard/TableCard.tsx`
- [x] Create `src/components/dashboard/TableGrid.tsx`
- [x] Create `src/components/dashboard/OrderSummary.tsx`

### Step 7: Table Components
- [x] Create `src/components/table/OrderList.tsx`
- [x] Create `src/components/table/OrderItem.tsx`
- [x] Create `src/components/table/OrderStatusBadge.tsx`
- [x] Create `src/components/table/TableForm.tsx`

### Step 8: Menu Components
- [x] Create `src/components/menu/CategoryList.tsx`
- [x] Create `src/components/menu/MenuList.tsx`
- [x] Create `src/components/menu/MenuCard.tsx`
- [x] Create `src/components/menu/MenuForm.tsx`

### Step 9: Pages
- [x] Create `src/pages/LoginPage.tsx`
- [x] Create `src/pages/DashboardPage.tsx`
- [x] Create `src/pages/TableDetailPage.tsx`
- [x] Create `src/pages/TableManagementPage.tsx`
- [x] Create `src/pages/MenuManagementPage.tsx`
- [x] Create `src/pages/StoreSettingsPage.tsx`

### Step 10: App Entry
- [x] Create `src/main.tsx`
- [x] Create `src/App.tsx`

### Step 11: Build & Verify
- [x] Run `npm install`
- [x] Run `npm run build`

---

## Story Traceability

| Story | Implementation |
|-------|---------------|
| US-A01 | LoginPage, AuthContext |
| US-A02 | AuthContext (token refresh, localStorage) |
| US-A03 | LoginPage (error handling from API) |
| US-A04 | DashboardPage, TableGrid, TableCard |
| US-A05 | useSSE hook, DashboardPage |
| US-A06 | TableDetailPage, OrderList |
| US-A07 | OrderItem, OrderStatusBadge |
| US-A08 | TableManagementPage, TableForm |
| US-A09 | (Customer app - 참조만) |
| US-A10 | TableDetailPage, OrderItem |
| US-A11 | TableDetailPage, ConfirmModal |
| US-A12 | TableDetailPage (history tab) |
| US-A13 | (Super admin - MVP에서 제외) |
| US-A14 | StoreSettingsPage |
| US-A15 | MenuManagementPage, CategoryList |
| US-A16 | MenuManagementPage, MenuForm |
| US-A17 | MenuManagementPage, MenuForm |
| US-A18 | MenuManagementPage, ConfirmModal |
| US-A19 | MenuList (drag-and-drop) |

---

## Security Requirements (Extension: Security Baseline)

- JWT 토큰 저장: HttpOnly cookie 불가 시 메모리 + secure localStorage
- 토큰 만료 시 자동 로그아웃
- API 호출 시 Authorization 헤더 자동 추가
- XSS 방지: React 기본 escaping 활용
- CSRF: SameSite cookie 또는 토큰 기반

