# Logical Components - table-order-api

## Overview
table-order-api Unit의 논리 컴포넌트 및 인프라 요소 설계입니다.

---

## 1. Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           table-order-api                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Cross-Cutting Concerns                          │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │   │
│  │  │  Security  │ │  Logging   │ │ Exception  │ │ Validation │       │   │
│  │  │  Filters   │ │  Filter    │ │  Handler   │ │            │       │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Presentation Layer                              │   │
│  │  ┌────────────────────────┐  ┌────────────────────────┐            │   │
│  │  │    Customer Module     │  │     Admin Module       │            │   │
│  │  │  ┌──────────────────┐  │  │  ┌──────────────────┐  │            │   │
│  │  │  │ SessionController│  │  │  │  AuthController  │  │            │   │
│  │  │  │ MenuController   │  │  │  │ DashboardController│ │            │   │
│  │  │  │ OrderController  │  │  │  │ OrderMgmtController│ │            │   │
│  │  │  └──────────────────┘  │  │  │ TableMgmtController│ │            │   │
│  │  │                        │  │  │ MenuMgmtController │ │            │   │
│  │  │                        │  │  │ StoreController   │  │            │   │
│  │  │                        │  │  │ SseController     │  │            │   │
│  │  │                        │  │  └──────────────────┘  │            │   │
│  │  └────────────────────────┘  └────────────────────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                        │                                    │
│                                        ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Application Layer                               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │   │
│  │  │ SessionUseCase│ │  MenuUseCase │ │ OrderUseCase │                │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘                │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │   │
│  │  │ TableUseCase │ │ StoreUseCase │ │AdminAuthUseCase│               │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘                │   │
│  │  ┌────────────────────┐                                            │   │
│  │  │OrderNotificationUseCase│                                        │   │
│  │  └────────────────────┘                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                        │                                    │
│                                        ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       Domain Layer                                  │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │  Entities: Store, Table, TableSession, Category, Menu,       │  │   │
│  │  │            Order, OrderItem, OrderHistory, Admin,            │  │   │
│  │  │            DailyOrderSequence                                │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │  Repository Interfaces                                       │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                        │                                    │
│                                        ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Infrastructure Layer                             │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │   │
│  │  │    JPA     │ │  Security  │ │    SSE     │ │  Scheduler │       │   │
│  │  │Repositories│ │  Config    │ │  Manager   │ │            │       │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌────────────┐      ┌────────────┐      ┌────────────┐
            │ PostgreSQL │      │   AWS S3   │      │   AWS EKS  │
            │  (RDS)     │      │  (Images)  │      │ (Runtime)  │
            └────────────┘      └────────────┘      └────────────┘
```

---

## 2. Cross-Cutting Components

### 2.1 Security Filter Chain

```
Request
   │
   ▼
┌─────────────────────────────┐
│   CorsFilter                │  ← CORS 정책 적용
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│   RequestLoggingFilter      │  ← 요청/응답 로깅
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│ SessionAuthenticationFilter │  ← Customer API 인증 (/api/customer/**)
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│   JwtAuthenticationFilter   │  ← Admin API 인증 (/api/admin/**)
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│   ExceptionTranslationFilter│  ← 보안 예외 처리
└─────────────────────────────┘
   │
   ▼
Controller
```

### 2.2 Security Configuration

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/admin/auth/login").permitAll()
                .requestMatchers("/api/customer/sessions").permitAll()
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                // Customer API - Session 인증 필요
                .requestMatchers("/api/customer/**").authenticated()
                // Admin API - JWT 인증 필요
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().denyAll()
            )
            .addFilterBefore(sessionAuthFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter(), SessionAuthenticationFilter.class)
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'"))
                .frameOptions(frame -> frame.deny()))
            .build();
    }
}
```

### 2.3 Global Exception Handler

```java
// 위치: common/exception/GlobalExceptionHandler.java
// 역할: 모든 예외를 일관된 형식으로 처리
// 처리 대상:
//   - BusinessException → 비즈니스 예외
//   - MethodArgumentNotValidException → 검증 예외
//   - AccessDeniedException → 접근 거부
//   - Exception → 예상치 못한 예외
```

### 2.4 Validation Configuration

```java
// ValidationConfig.java
@Configuration
public class ValidationConfig {
    
    @Bean
    public Validator validator() {
        return Validation.byDefaultProvider()
            .configure()
            .messageInterpolator(new LocaleContextMessageInterpolator(
                new ResourceBundleMessageInterpolator()))
            .buildValidatorFactory()
            .getValidator();
    }
}
```

---

## 3. Infrastructure Components

### 3.1 JPA Configuration

```java
// JpaConfig.java
@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.tableorder.infrastructure.persistence")
public class JpaConfig {
    
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.of("system");
    }
}
```

### 3.2 JWT Token Provider

```java
// JwtTokenProvider.java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration-hours}")
    private int expirationHours;
    
    private Key key;
    
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
    
    // Admin JWT 생성
    public String createAdminToken(Admin admin) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationHours * 3600 * 1000);
        
        return Jwts.builder()
            .subject("admin")
            .claim("adminId", admin.getId())
            .claim("storeId", admin.getStore().getId())
            .claim("username", admin.getUsername())
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
    }
    
    // Session Token 생성
    public String createSessionToken(TableSession session) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 16 * 3600 * 1000);
        
        return Jwts.builder()
            .subject("session")
            .claim("sessionId", session.getId())
            .claim("tableId", session.getTable().getId())
            .claim("storeId", session.getTable().getStore().getId())
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
    }
    
    // 토큰 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith((SecretKey) key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    // Claims 추출
    public Claims getClaims(String token) {
        return Jwts.parser()
            .verifyWith((SecretKey) key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
```

### 3.3 SSE Emitter Manager

```java
// SseEmitterManager.java
// 역할: SSE 연결 관리 및 이벤트 브로드캐스트
// 구조: ConcurrentHashMap<storeId, CopyOnWriteArrayList<SseEmitter>>
// 기능:
//   - createEmitter(storeId): 새 SSE 연결 생성
//   - broadcast(storeId, event, data): 매장별 이벤트 브로드캐스트
//   - broadcastToAll(event, data): 전체 브로드캐스트 (heartbeat용)
```

### 3.4 Scheduler Configuration

```java
// SchedulerConfig.java
@Configuration
@EnableScheduling
public class SchedulerConfig {
    
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("scheduler-");
        scheduler.initialize();
        return scheduler;
    }
}

// Scheduled Tasks:
// - SessionExpiryScheduler: 5분마다 만료 세션 처리
// - SseHeartbeatScheduler: 30초마다 SSE heartbeat 전송
```

---

## 4. Data Flow Diagrams

### 4.1 Customer Order Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│ Customer │────▶│ OrderController│───▶│ OrderUseCase │────▶│ Repositories│
│   App    │     │              │     │              │     │            │
└──────────┘     └──────────────┘     └──────────────┘     └────────────┘
                                              │
                                              ▼
                                      ┌──────────────────┐
                                      │OrderNotification │
                                      │   UseCase        │
                                      └────────┬─────────┘
                                               │
                                               ▼
                                      ┌──────────────────┐
                                      │ SseEmitterManager│
                                      └────────┬─────────┘
                                               │
                                               ▼
                                      ┌──────────────────┐
                                      │   Admin App      │
                                      └──────────────────┘
```

### 4.2 Admin Dashboard Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin   │────▶│ SseController │────▶│SseEmitterMgr │
│   App    │     └──────────────┘     └──────────────┘
│          │                                  │
│          │◀─────────────────────────────────┘
│          │         (SSE Events)
└──────────┘

Events:
- NEW_ORDER: 새 주문 도착
- ORDER_STATUS_CHANGED: 주문 상태 변경
- ORDER_DELETED: 주문 삭제됨
- heartbeat: 연결 유지
```

---

## 5. Component Dependencies

### 5.1 Layer Dependencies (Allowed)

```
Presentation ──────▶ Application ──────▶ Domain
      │                   │                 ▲
      │                   │                 │
      └───────────────────┴─────────────────┘
                          │
                          ▼
                   Infrastructure
```

### 5.2 Module Dependencies

| Component | Depends On |
|-----------|------------|
| **SessionController** | SessionUseCase |
| **MenuController** | MenuUseCase |
| **OrderController** | OrderUseCase |
| **AuthController** | AdminAuthUseCase |
| **DashboardController** | OrderUseCase, TableUseCase |
| **SseController** | SseEmitterManager |
| **SessionUseCase** | TableRepository, SessionRepository, JwtTokenProvider |
| **OrderUseCase** | OrderRepository, MenuRepository, SessionRepository, OrderNotificationUseCase |
| **MenuUseCase** | MenuRepository, CategoryRepository |
| **AdminAuthUseCase** | AdminRepository, StoreRepository, JwtTokenProvider |
| **OrderNotificationUseCase** | SseEmitterManager |

---

## 6. Configuration Summary

### 6.1 Application Properties

| Property | Dev | Prod |
|----------|-----|------|
| `server.port` | 8080 | 8080 |
| `spring.datasource.hikari.maximum-pool-size` | 10 | 15 |
| `logging.level.com.tableorder` | DEBUG | INFO |
| `springdoc.swagger-ui.enabled` | true | false |
| `jwt.expiration-hours` | 16 | 16 |

### 6.2 External Dependencies

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **PostgreSQL** | 주 데이터베이스 | `spring.datasource.*` |
| **AWS S3** | 이미지 저장소 | `aws.s3.bucket`, `aws.region` |

---

## 7. Deployment Architecture (K8s)

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS EKS Cluster                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Namespace: table-order               │   │
│  │                                                         │   │
│  │  ┌─────────────────┐    ┌─────────────────┐            │   │
│  │  │   Deployment    │    │    Service      │            │   │
│  │  │  table-order-api│◀───│  (ClusterIP)    │            │   │
│  │  │  replicas: 1    │    │  port: 8080     │            │   │
│  │  └─────────────────┘    └─────────────────┘            │   │
│  │          │                      ▲                       │   │
│  │          │                      │                       │   │
│  │          ▼                      │                       │   │
│  │  ┌─────────────────┐    ┌─────────────────┐            │   │
│  │  │   ConfigMap     │    │    Ingress      │◀── ALB    │   │
│  │  │   (app config)  │    │  (path routing) │            │   │
│  │  └─────────────────┘    └─────────────────┘            │   │
│  │                                                         │   │
│  │  ┌─────────────────┐                                   │   │
│  │  │     Secret      │                                   │   │
│  │  │ (DB, JWT keys)  │                                   │   │
│  │  └─────────────────┘                                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AWS RDS       │
                    │   PostgreSQL    │
                    └─────────────────┘
```

---

## 8. Component Checklist

### 8.1 Cross-Cutting

- [x] SecurityConfig - 보안 필터 체인
- [x] CorsConfig - CORS 설정
- [x] GlobalExceptionHandler - 전역 예외 처리
- [x] RequestLoggingFilter - 요청 로깅
- [x] JwtAuthenticationFilter - JWT 인증
- [x] SessionAuthenticationFilter - 세션 인증

### 8.2 Infrastructure

- [x] JpaConfig - JPA 설정
- [x] JwtTokenProvider - JWT 생성/검증
- [x] SseEmitterManager - SSE 관리
- [x] SchedulerConfig - 스케줄러 설정
- [x] SessionExpiryScheduler - 세션 만료 처리
- [x] SseHeartbeatScheduler - SSE heartbeat

### 8.3 Application (Use Cases)

- [x] SessionUseCase - 세션 관리
- [x] MenuUseCase - 메뉴 조회/관리
- [x] OrderUseCase - 주문 생성/관리
- [x] TableUseCase - 테이블 관리
- [x] StoreUseCase - 매장 관리
- [x] AdminAuthUseCase - 관리자 인증
- [x] OrderNotificationUseCase - 주문 알림

