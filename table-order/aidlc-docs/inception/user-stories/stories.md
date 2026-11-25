# User Stories

## Overview
테이블오더 서비스의 사용자 스토리입니다. User Journey 기반으로 구성되어 있으며, MoSCoW 우선순위와 Given-When-Then 형식의 Acceptance Criteria를 포함합니다.

**스토리 형식**: "As a [persona], I want to [action] so that [benefit]"

**우선순위 범례**:
- 🔴 **Must**: MVP 필수 기능
- 🟡 **Should**: 중요하지만 필수는 아님
- 🟢 **Could**: 있으면 좋은 기능
- ⚪ **Won't**: 이번 릴리스에서 제외

---

# Part 1: Customer Journey (고객 여정)

## Journey 1: 테이블 세션 시작

### US-C01: 주문 시작하기 🔴 Must
**As a** 고객  
**I want to** 테이블에 앉아서 "주문 시작" 버튼을 눌러 세션을 시작하고 싶다  
**So that** 이전 고객의 주문 내역 없이 새롭게 주문을 시작할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 테이블 태블릿 앞에 앉아있다
When "주문 시작" 버튼을 누른다
Then 새로운 테이블 세션이 생성된다
And 메뉴 화면으로 이동한다
And 세션 정보가 브라우저에 저장된다

Given 이미 활성화된 세션이 있는 테이블이다
When 고객이 화면을 본다
Then 현재 세션의 메뉴 화면이 표시된다
And "주문 시작" 버튼이 보이지 않는다
```

---

## Journey 2: 메뉴 탐색

### US-C02: 카테고리별 메뉴 보기 🔴 Must
**As a** 고객  
**I want to** 메뉴를 카테고리별로 볼 수 있다  
**So that** 원하는 종류의 음식을 쉽게 찾을 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 메뉴 화면에 있다
When 화면을 본다
Then 카테고리 목록이 표시된다
And 각 카테고리를 선택할 수 있다

Given 카테고리 목록이 표시되어 있다
When 특정 카테고리를 선택한다
Then 해당 카테고리의 메뉴들만 표시된다
And 선택된 카테고리가 시각적으로 강조된다
```

### US-C03: 메뉴 상세 정보 확인 🔴 Must
**As a** 고객  
**I want to** 메뉴의 상세 정보(이름, 가격, 설명, 이미지)를 볼 수 있다  
**So that** 주문 전에 메뉴에 대해 충분히 알 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 메뉴 목록을 보고 있다
When 각 메뉴 카드를 본다
Then 메뉴명이 표시된다
And 가격이 표시된다
And 메뉴 이미지가 표시된다
And 메뉴 설명이 표시된다
```

### US-C04: 카테고리 간 빠른 이동 🔴 Must
**As a** 고객  
**I want to** 카테고리 사이를 빠르게 이동할 수 있다  
**So that** 여러 종류의 메뉴를 효율적으로 탐색할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 특정 카테고리의 메뉴를 보고 있다
When 다른 카테고리를 선택한다
Then 즉시 해당 카테고리의 메뉴로 화면이 전환된다
And 스크롤 위치가 맨 위로 초기화된다
```

---

## Journey 3: 장바구니 관리

### US-C05: 메뉴를 장바구니에 담기 🔴 Must
**As a** 고객  
**I want to** 원하는 메뉴를 장바구니에 담을 수 있다  
**So that** 여러 메뉴를 모아서 한 번에 주문할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 메뉴 목록을 보고 있다
When 메뉴의 "담기" 버튼을 누른다
Then 해당 메뉴가 장바구니에 추가된다
And 장바구니 아이콘에 담긴 개수가 표시된다
And 추가 완료 피드백이 표시된다

Given 이미 장바구니에 있는 메뉴이다
When 같은 메뉴의 "담기" 버튼을 누른다
Then 해당 메뉴의 수량이 1 증가한다
```

### US-C06: 장바구니 수량 조절 🔴 Must
**As a** 고객  
**I want to** 장바구니에서 메뉴 수량을 조절할 수 있다  
**So that** 원하는 만큼 주문할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 장바구니를 보고 있다
And 특정 메뉴가 장바구니에 있다
When "+" 버튼을 누른다
Then 해당 메뉴의 수량이 1 증가한다
And 총 금액이 실시간으로 업데이트된다

Given 고객이 장바구니를 보고 있다
And 특정 메뉴의 수량이 2 이상이다
When "-" 버튼을 누른다
Then 해당 메뉴의 수량이 1 감소한다
And 총 금액이 실시간으로 업데이트된다

Given 고객이 장바구니를 보고 있다
And 특정 메뉴의 수량이 1이다
When "-" 버튼을 누른다
Then 해당 메뉴가 장바구니에서 삭제된다
```

### US-C07: 장바구니에서 메뉴 삭제 🔴 Must
**As a** 고객  
**I want to** 장바구니에서 메뉴를 삭제할 수 있다  
**So that** 주문하지 않을 메뉴를 제거할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 장바구니를 보고 있다
And 특정 메뉴가 장바구니에 있다
When 삭제 버튼을 누른다
Then 해당 메뉴가 장바구니에서 제거된다
And 총 금액이 업데이트된다
```

### US-C08: 장바구니 비우기 🔴 Must
**As a** 고객  
**I want to** 장바구니를 한 번에 비울 수 있다  
**So that** 처음부터 다시 메뉴를 담을 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 장바구니를 보고 있다
And 장바구니에 메뉴가 있다
When "장바구니 비우기" 버튼을 누른다
Then 확인 팝업이 표시된다

Given 확인 팝업이 표시되어 있다
When "확인"을 누른다
Then 장바구니의 모든 메뉴가 삭제된다
And 총 금액이 0원으로 표시된다
```

### US-C09: 장바구니 유지 (새로고침) 🔴 Must
**As a** 고객  
**I want to** 페이지를 새로고침해도 장바구니가 유지된다  
**So that** 실수로 새로고침해도 담은 메뉴를 잃지 않는다

**Acceptance Criteria:**
```gherkin
Given 고객이 장바구니에 메뉴를 담았다
When 페이지를 새로고침한다
Then 장바구니의 메뉴와 수량이 그대로 유지된다
And 총 금액이 동일하게 표시된다
```

---

## Journey 4: 주문 생성

### US-C10: 주문 내역 확인 및 주문하기 🔴 Must
**As a** 고객  
**I want to** 장바구니의 내용을 최종 확인하고 주문할 수 있다  
**So that** 실수 없이 원하는 메뉴를 주문할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 장바구니를 보고 있다
And 장바구니에 메뉴가 있다
When "주문하기" 버튼을 누른다
Then 주문 확인 화면이 표시된다
And 주문할 메뉴 목록과 수량이 표시된다
And 총 금액이 표시된다

Given 주문 확인 화면이 표시되어 있다
When "주문 확정" 버튼을 누른다
Then 주문이 서버로 전송된다
```

### US-C11: 주문 성공 처리 🔴 Must
**As a** 고객  
**I want to** 주문이 성공하면 주문 번호를 확인할 수 있다  
**So that** 내 주문이 접수되었음을 알 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 주문을 확정했다
When 주문이 성공적으로 처리된다
Then 주문 성공 화면이 표시된다
And 주문 번호가 표시된다
And 장바구니가 자동으로 비워진다
And 5초 후 메뉴 화면으로 자동 이동한다
```

### US-C12: 주문 실패 처리 🔴 Must
**As a** 고객  
**I want to** 주문이 실패하면 에러 메시지를 볼 수 있다  
**So that** 문제를 인지하고 다시 시도할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 주문을 확정했다
When 주문이 실패한다
Then 에러 메시지가 표시된다
And 장바구니의 메뉴는 그대로 유지된다
And 다시 주문을 시도할 수 있다
```

---

## Journey 5: 주문 내역 확인

### US-C13: 현재 세션 주문 내역 보기 🔴 Must
**As a** 고객  
**I want to** 현재 세션에서 주문한 내역을 볼 수 있다  
**So that** 무엇을 주문했는지 확인할 수 있다

**Acceptance Criteria:**
```gherkin
Given 고객이 현재 세션에서 주문을 했다
When "주문 내역" 메뉴를 선택한다
Then 현재 세션의 주문 목록이 표시된다
And 이전 세션의 주문은 표시되지 않는다
And 주문이 시간 순으로 정렬된다

Given 주문 내역이 표시되어 있다
When 각 주문을 본다
Then 주문 번호가 표시된다
And 주문 시각이 표시된다
And 주문한 메뉴와 수량이 표시된다
And 주문 금액이 표시된다
And 주문 상태(대기중/준비중/완료)가 표시된다
```

---

# Part 2: Admin Journey (관리자 여정)

## Journey 1: 매장 인증

### US-A01: 관리자 로그인 🔴 Must
**As a** 관리자  
**I want to** 매장 식별자와 계정 정보로 로그인할 수 있다  
**So that** 내 매장의 관리 시스템에 접근할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 로그인 페이지에 있다
When 매장 식별자, 사용자명, 비밀번호를 입력하고 로그인 버튼을 누른다
Then 인증이 성공하면 대시보드로 이동한다
And JWT 토큰이 발급되어 저장된다

Given 관리자가 로그인 정보를 입력했다
When 인증이 실패한다
Then 에러 메시지가 표시된다
And 입력 필드가 유지된다
```

### US-A02: 세션 유지 🔴 Must
**As a** 관리자  
**I want to** 로그인 후 16시간 동안 세션이 유지된다  
**So that** 영업 시간 동안 반복 로그인하지 않아도 된다

**Acceptance Criteria:**
```gherkin
Given 관리자가 로그인되어 있다
When 16시간이 지나지 않았다
Then 페이지를 새로고침해도 로그인이 유지된다

Given 관리자가 로그인되어 있다
When 16시간이 경과한다
Then 자동으로 로그아웃된다
And 로그인 페이지로 이동한다
```

### US-A03: 로그인 시도 제한 🔴 Must
**As a** 시스템 관리자  
**I want to** 반복적인 로그인 실패 시 접근을 제한할 수 있다  
**So that** 무차별 대입 공격을 방지할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 로그인을 시도한다
When 5회 연속 로그인에 실패한다
Then 15분 동안 해당 계정의 로그인이 차단된다
And 차단 메시지가 표시된다
```

---

## Journey 2: 실시간 주문 모니터링

### US-A04: 테이블별 주문 대시보드 보기 🔴 Must
**As a** 관리자  
**I want to** 테이블별로 주문 현황을 한눈에 볼 수 있다  
**So that** 매장 전체 상황을 빠르게 파악할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 대시보드에 있다
When 화면을 본다
Then 테이블별 카드가 그리드 형태로 표시된다
And 각 테이블 카드에 테이블 번호가 표시된다
And 각 테이블 카드에 총 주문액이 표시된다
And 최신 주문 미리보기가 표시된다
```

### US-A05: 실시간 주문 업데이트 🔴 Must
**As a** 관리자  
**I want to** 새로운 주문이 들어오면 실시간으로 화면에 반영된다  
**So that** 주문을 놓치지 않을 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 대시보드를 보고 있다
When 새로운 주문이 들어온다
Then 2초 이내에 해당 테이블 카드에 주문이 표시된다
And 새 주문이 시각적으로 강조된다 (색상 변경/애니메이션)
```

### US-A06: 주문 상세 보기 🔴 Must
**As a** 관리자  
**I want to** 테이블 카드를 클릭하면 전체 주문 목록을 볼 수 있다  
**So that** 해당 테이블의 상세 주문 내용을 확인할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 대시보드를 보고 있다
When 테이블 카드를 클릭한다
Then 해당 테이블의 전체 주문 목록이 표시된다
And 각 주문의 메뉴, 수량, 금액, 상태가 표시된다
And 주문 시각이 표시된다
```

### US-A07: 주문 상태 변경 🔴 Must
**As a** 관리자  
**I want to** 주문 상태를 변경할 수 있다 (대기중 → 준비중 → 완료)  
**So that** 주문 진행 상황을 관리할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 주문 상세를 보고 있다
And 주문 상태가 "대기중"이다
When "준비중" 버튼을 누른다
Then 주문 상태가 "준비중"으로 변경된다
And 고객 화면에도 상태 변경이 반영된다

Given 주문 상태가 "준비중"이다
When "완료" 버튼을 누른다
Then 주문 상태가 "완료"로 변경된다
```

---

## Journey 3: 테이블 관리

### US-A08: 테이블 등록 🔴 Must
**As a** 관리자  
**I want to** 새로운 테이블을 등록할 수 있다  
**So that** 매장의 테이블을 시스템에 추가할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 테이블 관리 화면에 있다
When "테이블 추가" 버튼을 누른다
Then 테이블 등록 폼이 표시된다

Given 테이블 등록 폼이 표시되어 있다
When 테이블 번호와 비밀번호를 입력하고 저장한다
Then 새 테이블이 등록된다
And 테이블 목록에 추가된다
```

### US-A09: 테이블 태블릿 초기 설정 🔴 Must
**As a** 관리자  
**I want to** 테이블 태블릿의 초기 설정을 할 수 있다  
**So that** 고객용 태블릿이 해당 테이블로 자동 연결된다

**Acceptance Criteria:**
```gherkin
Given 관리자가 테이블 태블릿에서 초기 설정을 진행한다
When 매장 식별자, 테이블 번호, 테이블 비밀번호를 입력한다
Then 태블릿이 해당 테이블로 설정된다
And 16시간 세션이 생성된다
And 이후 자동 로그인이 활성화된다
```

### US-A10: 주문 삭제 (직권 수정) 🔴 Must
**As a** 관리자  
**I want to** 잘못된 주문을 삭제할 수 있다  
**So that** 고객 실수나 시스템 오류를 정정할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 테이블의 주문 목록을 보고 있다
When 특정 주문의 "삭제" 버튼을 누른다
Then 확인 팝업이 표시된다

Given 확인 팝업이 표시되어 있다
When "확인"을 누른다
Then 해당 주문이 삭제된다
And 테이블 총 주문액이 재계산된다
And 성공 메시지가 표시된다
```

### US-A11: 테이블 이용 완료 처리 🔴 Must
**As a** 관리자  
**I want to** 고객이 떠날 때 테이블을 "이용 완료" 처리할 수 있다  
**So that** 다음 고객을 위해 테이블을 초기화할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 테이블 카드를 보고 있다
When "이용 완료" 버튼을 누른다
Then 확인 팝업이 표시된다

Given 확인 팝업이 표시되어 있다
When "확인"을 누른다
Then 현재 세션의 주문이 과거 이력으로 이동한다
And 테이블의 현재 주문 목록이 비워진다
And 총 주문액이 0으로 초기화된다
And 테이블 세션이 종료된다
```

### US-A12: 과거 주문 내역 조회 🔴 Must
**As a** 관리자  
**I want to** 테이블별 과거 주문 내역을 조회할 수 있다  
**So that** 이전 매출이나 주문 기록을 확인할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 테이블 상세를 보고 있다
When "과거 내역" 버튼을 누른다
Then 해당 테이블의 과거 주문 목록이 표시된다
And 시간 역순으로 정렬된다
And 각 주문에 주문 번호, 시각, 메뉴 목록, 총 금액, 이용 완료 시각이 표시된다

Given 과거 내역이 표시되어 있다
When 날짜 필터를 적용한다
Then 선택한 날짜 범위의 주문만 표시된다
```

---

## Journey 4: 매장 관리

### US-A13: 매장 등록 🔴 Must
**As a** 관리자  
**I want to** 새로운 매장을 등록할 수 있다  
**So that** 시스템에서 매장을 관리할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 매장 관리 화면에 있다
When "매장 등록" 버튼을 누른다
Then 매장 등록 폼이 표시된다

Given 매장 등록 폼이 표시되어 있다
When 필수 정보(매장명, 매장 식별자 등)를 입력하고 저장한다
Then 새 매장이 등록된다
And 매장 목록에 추가된다
```

### US-A14: 매장 정보 수정 🟡 Should
**As a** 관리자  
**I want to** 매장 정보를 수정할 수 있다  
**So that** 변경된 정보를 반영할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 매장 정보를 보고 있다
When "수정" 버튼을 누른다
Then 수정 폼이 표시된다
And 현재 정보가 미리 채워져 있다

Given 수정 폼이 표시되어 있다
When 정보를 변경하고 저장한다
Then 매장 정보가 업데이트된다
And 성공 메시지가 표시된다
```

---

## Journey 5: 메뉴 관리

### US-A15: 카테고리별 메뉴 조회 🔴 Must
**As a** 관리자  
**I want to** 카테고리별로 메뉴를 조회할 수 있다  
**So that** 메뉴를 체계적으로 관리할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 메뉴 관리 화면에 있다
When 화면을 본다
Then 카테고리 목록이 표시된다
And 각 카테고리의 메뉴 개수가 표시된다

Given 카테고리가 선택되어 있다
When 해당 카테고리를 본다
Then 해당 카테고리의 메뉴 목록이 표시된다
```

### US-A16: 메뉴 등록 🔴 Must
**As a** 관리자  
**I want to** 새로운 메뉴를 등록할 수 있다  
**So that** 매장의 메뉴판을 업데이트할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 메뉴 관리 화면에 있다
When "메뉴 추가" 버튼을 누른다
Then 메뉴 등록 폼이 표시된다

Given 메뉴 등록 폼이 표시되어 있다
When 메뉴명, 가격, 설명, 카테고리, 이미지 URL을 입력하고 저장한다
Then 새 메뉴가 등록된다
And 해당 카테고리의 메뉴 목록에 추가된다

Given 메뉴 등록 폼이 표시되어 있다
When 필수 필드(메뉴명, 가격, 카테고리)가 비어있다
Then 저장이 거부된다
And 필수 필드 에러 메시지가 표시된다

Given 메뉴 등록 폼이 표시되어 있다
When 가격이 0 이하이다
Then 저장이 거부된다
And 가격 범위 에러 메시지가 표시된다
```

### US-A17: 메뉴 수정 🔴 Must
**As a** 관리자  
**I want to** 기존 메뉴 정보를 수정할 수 있다  
**So that** 가격 변경이나 정보 업데이트를 할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 메뉴 목록을 보고 있다
When 특정 메뉴의 "수정" 버튼을 누른다
Then 수정 폼이 표시된다
And 현재 메뉴 정보가 미리 채워져 있다

Given 수정 폼이 표시되어 있다
When 정보를 변경하고 저장한다
Then 메뉴 정보가 업데이트된다
And 성공 메시지가 표시된다
```

### US-A18: 메뉴 삭제 🔴 Must
**As a** 관리자  
**I want to** 메뉴를 삭제할 수 있다  
**So that** 더 이상 판매하지 않는 메뉴를 제거할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 메뉴 목록을 보고 있다
When 특정 메뉴의 "삭제" 버튼을 누른다
Then 확인 팝업이 표시된다

Given 확인 팝업이 표시되어 있다
When "확인"을 누른다
Then 해당 메뉴가 삭제된다
And 메뉴 목록에서 제거된다
```

### US-A19: 메뉴 노출 순서 조정 🟡 Should
**As a** 관리자  
**I want to** 메뉴의 노출 순서를 조정할 수 있다  
**So that** 추천 메뉴나 인기 메뉴를 상단에 배치할 수 있다

**Acceptance Criteria:**
```gherkin
Given 관리자가 카테고리의 메뉴 목록을 보고 있다
When 메뉴를 드래그하여 순서를 변경한다
Then 메뉴 순서가 업데이트된다
And 고객 화면에서도 변경된 순서로 표시된다
```

---

# Story Summary

## 통계

| 구분 | Must | Should | Could | Won't | 합계 |
|------|------|--------|-------|-------|------|
| **Customer Stories** | 13 | 0 | 0 | 0 | 13 |
| **Admin Stories** | 17 | 2 | 0 | 0 | 19 |
| **합계** | 30 | 2 | 0 | 0 | 32 |

## 페르소나-스토리 매핑

| 페르소나 | 스토리 ID |
|----------|-----------|
| **고객 (Customer)** | US-C01 ~ US-C13 |
| **관리자 (Admin)** | US-A01 ~ US-A19 |

## INVEST 기준 검증

| 기준 | 설명 | 충족 여부 |
|------|------|----------|
| **Independent** | 각 스토리가 독립적으로 개발/테스트 가능 | ✅ |
| **Negotiable** | 세부 구현은 협의 가능 | ✅ |
| **Valuable** | 각 스토리가 사용자에게 가치 제공 | ✅ |
| **Estimable** | 개발 규모 추정 가능 | ✅ |
| **Small** | 적절한 크기로 분할됨 | ✅ |
| **Testable** | GWT 형식의 명확한 AC 보유 | ✅ |
