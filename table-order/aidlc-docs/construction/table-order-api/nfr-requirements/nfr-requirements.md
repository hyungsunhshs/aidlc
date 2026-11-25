# NFR Requirements - table-order-api

## Overview
table-order-api Unit의 Non-Functional Requirements 상세 명세입니다.

---

## 1. Performance Requirements (성능)

### 1.1 Response Time

| Metric | Target | Measurement |
|--------|--------|-------------|
| API 응답 시간 (P95) | < 500ms | 95번째 백분위 |
| API 응답 시간 (P99) | < 1000ms | 99번째 백분위 |
| SSE 이벤트 전달 | < 2초 | 주문 생성 → 관리자 화면 표시 |

### 1.2 Throughput

| Metric | Target | Notes |
|--------|--------|-------|
| 동시 접속 | 50 테이블 | 단일 매장 기준 |
| 초당 요청 | ~100 TPS | 피크 시간 기준 |
| SSE 연결 | 최대 10개 | 관리자 디바이스 수 |

### 1.3 Database Performance

| Config | Value | Rationale |
|--------|-------|-----------|
| Connection Pool Size | 10-20 | MVP 단일 인스턴스 |
| Connection Timeout | 30초 | 기본값 |
| Idle Timeout | 10분 | 리소스 효율성 |
| Max Lifetime | 30분 | 커넥션 순환 |

```yaml
# application.yml
spring:
  datasource:
    hikari:
      minimum-idle: 5
      maximum-pool-size: 15
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

---

## 2. Security Requirements (보안)

### 2.1 Authentication & Authorization

| Requirement | Implementation |
|-------------|----------------|
| 관리자 인증 | JWT (16시간 유효) |
| 테이블 세션 | Session Token (16시간 유효) |
| 비밀번호 저장 | bcrypt (cost factor 12) |
| 로그인 시도 제한 | 5회 실패 시 15분 잠금 |

### 2.2 Data Protection

| Requirement | Implementation |
|-------------|----------------|
| 전송 암호화 | TLS 1.2+ (HTTPS 강제) |
| 저장 암호화 | AWS RDS 암호화 (AES-256) |
| S3 암호화 | SSE-S3 (Server-Side Encryption) |
| 민감 데이터 | 비밀번호 해시, JWT 서명키 보호 |

### 2.3 HTTP Security Headers

```java
// SecurityConfig.java
http.headers(headers -> headers
    .contentSecurityPolicy(csp -> csp
        .policyDirectives("default-src 'self'; frame-ancestors 'none'"))
    .frameOptions(frame -> frame.deny())
    .xssProtection(xss -> xss.disable()) // CSP가 더 강력
    .contentTypeOptions(Customizer.withDefaults()) // X-Content-Type-Options: nosniff
    .httpStrictTransportSecurity(hsts -> hsts
        .includeSubDomains(true)
        .maxAgeInSeconds(31536000))
);
```

| Header | Value |
|--------|-------|
| Content-Security-Policy | `default-src 'self'; frame-ancestors 'none'` |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` |
| Cache-Control | `no-store` (인증 응답) |

### 2.4 CORS Configuration

```java
// CorsConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "https://customer.tableorder.example.com",
        "https://admin.tableorder.example.com"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

### 2.5 Input Validation

| Category | Validation |
|----------|------------|
| String 필드 | 길이 제한, 특수문자 필터링 |
| 숫자 필드 | 범위 검증 (min/max) |
| ID 필드 | 존재 여부 검증 |
| Enum 필드 | 허용 값 검증 |

```java
// Request DTO Example
public record CreateOrderRequest(
    @NotEmpty(message = "주문 항목은 필수입니다")
    @Size(max = 50, message = "주문 항목은 50개 이하여야 합니다")
    List<@Valid OrderItemRequest> items
) {}

public record OrderItemRequest(
    @NotNull(message = "메뉴 ID는 필수입니다")
    Long menuId,
    
    @Min(value = 1, message = "수량은 1 이상이어야 합니다")
    @Max(value = 99, message = "수량은 99 이하여야 합니다")
    Integer quantity
) {}
```

### 2.6 SQL Injection Prevention

- JPA/Hibernate 파라미터 바인딩 사용
- Native Query 사용 금지 (필요 시 NamedParameterJdbcTemplate)
- 동적 쿼리는 Criteria API 또는 QueryDSL 사용

---

## 3. Availability Requirements (가용성)

### 3.1 Uptime Target

| Metric | Target | Downtime/Month |
|--------|--------|----------------|
| 가용성 | 99% | ~7.3시간 |

### 3.2 Health Check Endpoints

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when_authorized
      probes:
        enabled: true
  health:
    livenessState:
      enabled: true
    readinessState:
      enabled: true
```

| Endpoint | Purpose | K8s Probe |
|----------|---------|-----------|
| `/actuator/health/liveness` | 애플리케이션 생존 여부 | livenessProbe |
| `/actuator/health/readiness` | 트래픽 수신 가능 여부 | readinessProbe |
| `/actuator/health` | 전체 헬스 상태 | - |

### 3.3 Kubernetes Probe Configuration

```yaml
# deployment.yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 5
  failureThreshold: 3
```

### 3.4 Graceful Shutdown

```yaml
# application.yml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

---

## 4. Scalability Requirements (확장성)

### 4.1 Current Scale (MVP)

| Resource | Target |
|----------|--------|
| Application Instances | 1 (단일 Pod) |
| Database | 단일 RDS 인스턴스 |
| 테이블 수 | 1-50 |
| 매장 수 | 1 |

### 4.2 Horizontal Scaling Considerations

MVP 이후 확장 시 고려사항:

| Component | Scaling Strategy |
|-----------|------------------|
| Application | HPA (Horizontal Pod Autoscaler) |
| Database | Read Replica 추가 |
| SSE | Redis Pub/Sub로 인스턴스 간 동기화 |
| Session | Redis Session Store 도입 |

---

## 5. Reliability Requirements (신뢰성)

### 5.1 Error Handling

```java
// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return ResponseEntity
            .status(e.getHttpStatus())
            .body(new ErrorResponse(e.getCode(), e.getMessage()));
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ConstraintViolationException e) {
        return ResponseEntity
            .badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity
            .internalServerError()
            .body(new ErrorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다"));
    }
}
```

### 5.2 Error Response Format (Simple)

```json
{
  "code": "SESSION_EXPIRED",
  "message": "세션이 만료되었습니다. 주문 시작 버튼을 눌러 새 세션을 시작해주세요."
}
```

### 5.3 Transaction Management

```java
// UseCase Layer에서 트랜잭션 관리
@Service
@Transactional(readOnly = true)
public class OrderUseCase {
    
    @Transactional
    public CreateOrderResponse createOrder(Long sessionId, CreateOrderRequest request) {
        // 트랜잭션 내에서 실행
    }
}
```

| Strategy | Implementation |
|----------|----------------|
| 기본 격리 수준 | READ_COMMITTED |
| 읽기 전용 조회 | `@Transactional(readOnly = true)` |
| 타임아웃 | 30초 |

---

## 6. Logging & Monitoring (로깅 및 모니터링)

### 6.1 Logging Configuration

```yaml
# application.yml
logging:
  level:
    root: INFO
    com.tableorder: INFO
    org.springframework.web: INFO
    org.hibernate.SQL: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

| Level | Usage |
|-------|-------|
| ERROR | 예외, 시스템 오류 |
| WARN | 비정상적이지만 복구 가능한 상황 |
| INFO | 주요 비즈니스 이벤트 (주문 생성, 로그인 등) |
| DEBUG | 개발/디버깅용 (운영에서 비활성화) |

### 6.2 Log Retention

| Environment | Retention |
|-------------|-----------|
| Development | 7일 |
| Production | 30일 |

### 6.3 Structured Logging

```java
// 비즈니스 이벤트 로깅
log.info("Order created: orderId={}, sessionId={}, totalAmount={}", 
    order.getId(), sessionId, order.getTotalAmount());

// 보안 이벤트 로깅
log.warn("Login failed: storeId={}, username={}, attempts={}", 
    storeId, username, failedAttempts);
```

### 6.4 Metrics (Actuator)

```yaml
management:
  metrics:
    tags:
      application: table-order-api
    export:
      prometheus:
        enabled: true
```

| Metric | Description |
|--------|-------------|
| `http_server_requests_seconds` | API 응답 시간 |
| `hikaricp_connections_active` | 활성 DB 커넥션 |
| `jvm_memory_used_bytes` | JVM 메모리 사용량 |

---

## 7. Rate Limiting (API 속도 제한)

### 7.1 Configuration

| API | Rate Limit | Rationale |
|-----|------------|-----------|
| Customer API | 제한 없음 | 내부 태블릿, 별도 제한 불필요 |
| Admin API | 제한 없음 | 관리자 디바이스 한정 |
| Login API | 5회/15분 | 브루트포스 방지 (애플리케이션 레벨) |

### 7.2 Future Consideration

MVP 이후 필요 시 Spring Cloud Gateway 또는 Bucket4j로 Rate Limiting 도입 가능.

---

## 8. Caching Strategy (캐싱 전략)

### 8.1 MVP Caching

| Data | Cache | TTL |
|------|-------|-----|
| 메뉴 목록 | 없음 (MVP) | - |
| 카테고리 목록 | 없음 (MVP) | - |

MVP에서는 캐싱 없이 직접 DB 조회. 성능 이슈 발생 시 Spring Cache + Redis 도입.

### 8.2 Browser Caching

```java
// 정적 리소스 캐싱
@GetMapping("/api/customer/menus/{id}/image")
public ResponseEntity<Resource> getMenuImage(@PathVariable Long id) {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
        .body(resource);
}
```

---

## 9. API Documentation (API 문서화)

### 9.1 OpenAPI/Swagger

```yaml
# application.yml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    enabled: true  # 개발 환경만
```

### 9.2 Documentation Requirements

| Item | Required |
|------|----------|
| Endpoint 설명 | Yes |
| Request/Response 예시 | Yes |
| Error 코드 목록 | Yes |
| 인증 방식 설명 | Yes |

---

## 10. Compliance Summary

### Security Extension Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 데이터 암호화 (저장/전송) | ✅ | TLS 1.2+, RDS 암호화, S3 SSE |
| 접근 로깅 | ✅ | 구조화된 로깅, 보안 이벤트 기록 |
| HTTP 보안 헤더 | ✅ | CSP, HSTS, X-Frame-Options |
| 입력 검증 | ✅ | Bean Validation, 파라미터 바인딩 |
| 최소 권한 원칙 | ✅ | 매장별 데이터 격리 |
| 인증/인가 | ✅ | JWT, bcrypt, 세션 관리 |
| 브루트포스 방지 | ✅ | 로그인 시도 제한 |

