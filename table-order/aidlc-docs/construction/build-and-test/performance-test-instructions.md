# Performance Test Instructions

## Purpose

성능 테스트를 통해 테이블오더 서비스가 예상 부하를 처리할 수 있는지 검증합니다.

---

## Performance Requirements

### Response Time (응답 시간)
| API | Target | P95 |
|-----|--------|-----|
| 메뉴 조회 | < 100ms | < 200ms |
| 주문 생성 | < 300ms | < 500ms |
| 주문 상태 변경 | < 200ms | < 300ms |
| 대시보드 조회 | < 500ms | < 1000ms |

### Throughput (처리량)
- **Target**: 100 requests/second (소규모 매장 기준)
- **Peak**: 200 requests/second (피크 시간대)

### Concurrent Users (동시 사용자)
- **Normal**: 50 concurrent users
- **Peak**: 100 concurrent users

### Error Rate
- **Target**: < 1%

---

## Performance Test Tools

### Recommended: k6 (경량, 스크립트 기반)

```bash
# Install k6
brew install k6  # macOS
# or
docker pull grafana/k6
```

### Alternative: Apache JMeter

```bash
# Install JMeter
brew install jmeter  # macOS
```

---

## Setup Performance Test Environment

### 1. Production-like Environment

```bash
# Start database with performance tuning
docker run -d \
  --name tableorder-db \
  -e POSTGRES_DB=tableorder \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_MAX_CONNECTIONS=200 \
  -p 5432:5432 \
  postgres:15-alpine

# Start backend with production settings
cd table-order-api
./gradlew bootRun --args='--spring.profiles.active=prod'
```

### 2. Seed Test Data

```bash
# Insert test data (categories, menus, tables)
psql -h localhost -U postgres -d tableorder << 'EOF'
-- Insert test store
INSERT INTO stores (identifier, name) VALUES ('perf-store', 'Performance Test Store');

-- Insert test tables
INSERT INTO store_tables (store_id, table_number, password)
SELECT 1, 'T' || generate_series(1, 50), '1234';

-- Insert test categories
INSERT INTO categories (store_id, name, display_order)
VALUES (1, 'Main', 1), (1, 'Side', 2), (1, 'Drink', 3);

-- Insert test menus
INSERT INTO menus (category_id, name, price, is_available, display_order)
SELECT 
  (id % 3) + 1,
  'Menu ' || id,
  10000 + (id * 1000),
  true,
  id
FROM generate_series(1, 100) AS id;
EOF
```

---

## k6 Load Test Scripts

### Script 1: Menu Browsing Load Test

**file: `k6/menu-load-test.js`**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

const BASE_URL = 'http://localhost:8080/api';

export function setup() {
  // Start a session
  const res = http.post(`${BASE_URL}/customer/sessions`, JSON.stringify({
    storeIdentifier: 'perf-store',
    tableNumber: 'T1',
    password: '1234',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  return { token: JSON.parse(res.body).sessionToken };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Get categories
  const catRes = http.get(`${BASE_URL}/customer/categories`, { headers });
  check(catRes, {
    'categories status 200': (r) => r.status === 200,
    'categories response time < 100ms': (r) => r.timings.duration < 100,
  });

  // Get menus for a random category
  const categoryId = Math.floor(Math.random() * 3) + 1;
  const menuRes = http.get(`${BASE_URL}/customer/categories/${categoryId}/menus`, { headers });
  check(menuRes, {
    'menus status 200': (r) => r.status === 200,
    'menus response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
```

### Script 2: Order Creation Stress Test

**file: `k6/order-stress-test.js`**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },   // Ramp up
    { duration: '5m', target: 20 },   // Sustained load
    { duration: '2m', target: 50 },   // Stress test
    { duration: '3m', target: 50 },   // Sustained stress
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:8080/api';

export function setup() {
  const sessions = [];
  for (let i = 1; i <= 20; i++) {
    const res = http.post(`${BASE_URL}/customer/sessions`, JSON.stringify({
      storeIdentifier: 'perf-store',
      tableNumber: `T${i}`,
      password: '1234',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    sessions.push({ token: JSON.parse(res.body).sessionToken, tableId: i });
  }
  return { sessions };
}

export default function (data) {
  const session = data.sessions[Math.floor(Math.random() * data.sessions.length)];
  const headers = {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };

  // Create order
  const orderRes = http.post(`${BASE_URL}/customer/orders`, JSON.stringify({
    items: [
      { menuId: Math.floor(Math.random() * 100) + 1, quantity: Math.floor(Math.random() * 3) + 1 },
      { menuId: Math.floor(Math.random() * 100) + 1, quantity: 1 },
    ],
  }), { headers });

  check(orderRes, {
    'order created': (r) => r.status === 201,
    'order response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(2);
}
```

---

## Run Performance Tests

### k6

```bash
# Menu browsing test
k6 run k6/menu-load-test.js

# Order stress test
k6 run k6/order-stress-test.js

# With output to JSON
k6 run --out json=results.json k6/menu-load-test.js
```

### JMeter (Alternative)

```bash
# CLI mode
jmeter -n -t performance-test.jmx -l results.jtl -e -o report/
```

---

## Analyze Performance Results

### k6 Output Example

```
     ✓ categories status 200
     ✓ categories response time < 100ms
     ✓ menus status 200
     ✓ menus response time < 100ms

     checks.........................: 100.00% ✓ 20000     ✗ 0
     http_req_duration..............: avg=45.2ms  min=12ms  med=38ms  max=234ms p(90)=78ms  p(95)=98ms
     http_req_failed................: 0.00%   ✓ 0         ✗ 10000
     http_reqs......................: 10000   166.67/s
     vus............................: 50      min=1       max=100
```

### Key Metrics to Monitor

| Metric | Description | Target |
|--------|-------------|--------|
| `http_req_duration` | 요청 처리 시간 | p95 < 200ms |
| `http_req_failed` | 실패율 | < 1% |
| `http_reqs` | 초당 요청 수 | > 100 req/s |
| `vus` | 가상 사용자 수 | 100 |

---

## Performance Optimization

성능 목표 미달성 시:

### 1. Database Optimization
- 인덱스 추가
- 쿼리 최적화
- Connection Pool 조정

### 2. Application Optimization
- 캐싱 추가 (Redis)
- N+1 쿼리 해결
- 비동기 처리

### 3. Infrastructure Optimization
- 수평 확장 (Replicas)
- 로드 밸런서 추가
- CDN 활용 (정적 파일)

---

## Cleanup

```bash
# Stop services
docker stop tableorder-db
docker rm tableorder-db
```
