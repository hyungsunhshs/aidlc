# Integration Test Instructions

## Purpose

통합 테스트는 여러 컴포넌트와 서비스 간의 상호작용을 검증합니다.
테이블오더 서비스에서는 다음 통합 시나리오를 테스트합니다:

1. **Frontend ↔ Backend API**: REST API 통신
2. **Backend ↔ Database**: 데이터 영속성
3. **SSE (Server-Sent Events)**: 실시간 업데이트

---

## Setup Integration Test Environment

### 1. Start Required Services

```bash
# Start PostgreSQL
docker run -d \
  --name tableorder-db \
  -e POSTGRES_DB=tableorder \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for DB
sleep 5

# Start Backend API
cd table-order-api
./gradlew bootRun &
API_PID=$!

# Wait for API to start
sleep 10
curl -s http://localhost:8080/actuator/health | grep UP

# Start Frontend (dev mode for integration testing)
cd ../customer-ordering-app
npm run dev &
CUSTOMER_PID=$!

cd ../store-management-app
npm run dev &
ADMIN_PID=$!
```

### 2. Verify Services Are Running

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Frontend dev servers
curl http://localhost:5173  # customer-ordering-app
curl http://localhost:5174  # store-management-app
```

---

## Integration Test Scenarios

### Scenario 1: Customer Session Flow (고객 세션 플로우)

**Description**: 고객이 테이블에서 세션을 시작하고 메뉴를 조회하는 플로우

**Test Steps**:
```bash
# 1. 테이블 비밀번호로 세션 시작
curl -X POST http://localhost:8080/api/customer/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "storeIdentifier": "store-001",
    "tableNumber": "A1",
    "password": "1234"
  }'
# Expected: 200 OK, sessionToken 반환

# 2. 세션 토큰으로 카테고리 조회
curl http://localhost:8080/api/customer/categories \
  -H "Authorization: Bearer <sessionToken>"
# Expected: 200 OK, 카테고리 목록

# 3. 카테고리별 메뉴 조회
curl http://localhost:8080/api/customer/categories/1/menus \
  -H "Authorization: Bearer <sessionToken>"
# Expected: 200 OK, 메뉴 목록
```

**Expected Results**:
- 세션 토큰이 발급됨
- 토큰으로 API 호출 가능
- 메뉴 데이터 정상 반환

---

### Scenario 2: Order Creation Flow (주문 생성 플로우)

**Description**: 고객이 장바구니에서 주문을 생성하는 플로우

**Test Steps**:
```bash
# 1. 주문 생성
curl -X POST http://localhost:8080/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <sessionToken>" \
  -d '{
    "items": [
      {"menuId": 1, "quantity": 2},
      {"menuId": 2, "quantity": 1}
    ]
  }'
# Expected: 201 Created, orderId, orderNumber 반환

# 2. 주문 내역 조회
curl http://localhost:8080/api/customer/orders \
  -H "Authorization: Bearer <sessionToken>"
# Expected: 200 OK, 주문 목록에 새 주문 포함
```

**Expected Results**:
- 주문 번호 형식: `YYYYMMDD-NNN`
- 총 금액이 정확히 계산됨
- 주문 상태: `PENDING`

---

### Scenario 3: Admin Order Management (관리자 주문 관리)

**Description**: 관리자가 주문 상태를 변경하는 플로우

**Test Steps**:
```bash
# 1. 관리자 로그인
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "storeIdentifier": "store-001",
    "username": "admin",
    "password": "admin123"
  }'
# Expected: 200 OK, accessToken 반환

# 2. 대시보드 조회
curl http://localhost:8080/api/admin/dashboard/tables \
  -H "Authorization: Bearer <accessToken>"
# Expected: 200 OK, 테이블별 주문 현황

# 3. 주문 상태 변경 (PENDING → PREPARING)
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"status": "PREPARING"}'
# Expected: 200 OK

# 4. 주문 상태 변경 (PREPARING → COMPLETED)
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"status": "COMPLETED"}'
# Expected: 200 OK
```

**Expected Results**:
- 상태 순서 강제: PENDING → PREPARING → COMPLETED
- 고객 주문 내역에서 상태 변경 반영

---

### Scenario 4: Real-time SSE Updates (실시간 업데이트)

**Description**: 새 주문 시 관리자 대시보드에 실시간 반영

**Test Steps**:
```bash
# 1. 관리자 SSE 연결 (별도 터미널)
curl -N http://localhost:8080/api/admin/events \
  -H "Authorization: Bearer <accessToken>"

# 2. 고객이 새 주문 생성 (다른 터미널)
curl -X POST http://localhost:8080/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <sessionToken>" \
  -d '{"items": [{"menuId": 1, "quantity": 1}]}'

# 3. SSE 연결에서 NEW_ORDER 이벤트 수신 확인
# Expected: data: {"type": "NEW_ORDER", "tableId": 1, ...}
```

**Expected Results**:
- SSE 연결 유지됨
- 새 주문 시 2초 이내 이벤트 수신
- 이벤트에 주문 정보 포함

---

### Scenario 5: Menu Management (메뉴 관리)

**Description**: 관리자가 메뉴를 등록/수정/삭제하고 고객 앱에 반영

**Test Steps**:
```bash
# 1. 카테고리 생성
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"name": "신메뉴"}'

# 2. 메뉴 등록
curl -X POST http://localhost:8080/api/admin/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "categoryId": 1,
    "name": "새로운 김치찌개",
    "price": 12000,
    "description": "더 맛있어진 김치찌개"
  }'

# 3. 고객 앱에서 메뉴 조회
curl http://localhost:8080/api/customer/categories/1/menus \
  -H "Authorization: Bearer <sessionToken>"
# Expected: 새 메뉴가 목록에 포함

# 4. 메뉴 품절 처리
curl -X POST http://localhost:8080/api/admin/menus/1/toggle-availability \
  -H "Authorization: Bearer <accessToken>"

# 5. 고객 앱에서 품절 확인
curl http://localhost:8080/api/customer/categories/1/menus \
  -H "Authorization: Bearer <sessionToken>"
# Expected: isAvailable: false
```

---

## Automated Integration Tests

### Backend Integration Tests (Spring Boot)

```bash
cd table-order-api

# Run integration tests (uses @SpringBootTest)
./gradlew integrationTest

# Or with specific profile
./gradlew integrationTest -Dspring.profiles.active=test
```

### API Contract Tests (Optional)

사용 가능한 도구:
- **Pact**: Consumer-driven contract testing
- **Spring Cloud Contract**: Spring 생태계 통합

---

## Cleanup

```bash
# Stop frontend dev servers
kill $CUSTOMER_PID $ADMIN_PID

# Stop backend
kill $API_PID

# Stop and remove database container
docker stop tableorder-db
docker rm tableorder-db
```

---

## Troubleshooting

### API Returns 401 Unauthorized
- 토큰이 만료되었는지 확인
- 토큰 형식 확인: `Bearer <token>`

### SSE Connection Drops
- 네트워크 타임아웃 설정 확인
- 프록시 설정 확인 (nginx 등)

### Database Connection Failed
- Docker 컨테이너 상태 확인
- 포트 충돌 확인: `lsof -i :5432`
