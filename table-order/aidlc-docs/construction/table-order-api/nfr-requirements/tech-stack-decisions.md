# Tech Stack Decisions - table-order-api

## Overview
table-order-api Unit의 기술 스택 결정 사항입니다.

---

## 1. Core Stack

### 1.1 Language & Runtime

| Component | Version | Rationale |
|-----------|---------|-----------|
| **Java** | 17 (LTS) | 장기 지원, 최신 기능 (Records, Sealed Classes) |
| **JVM** | Eclipse Temurin 17 | 무료, 활발한 커뮤니티 |

### 1.2 Framework

| Component | Version | Rationale |
|-----------|---------|-----------|
| **Spring Boot** | 3.2.x | 최신 안정 버전, Java 17+ 필수 |
| **Spring Framework** | 6.1.x | Spring Boot 3.2에 포함 |

---

## 2. Dependencies

### 2.1 Web & API

| Dependency | Group | Version | Purpose |
|------------|-------|---------|---------|
| spring-boot-starter-web | org.springframework.boot | 3.2.x | REST API, MVC |
| spring-boot-starter-validation | org.springframework.boot | 3.2.x | Bean Validation |
| springdoc-openapi-starter-webmvc-ui | org.springdoc | 2.3.x | OpenAPI 문서화 |

### 2.2 Security

| Dependency | Group | Version | Purpose |
|------------|-------|---------|---------|
| spring-boot-starter-security | org.springframework.boot | 3.2.x | Spring Security |
| jjwt-api | io.jsonwebtoken | 0.12.x | JWT 생성/검증 |
| jjwt-impl | io.jsonwebtoken | 0.12.x | JWT 구현체 |
| jjwt-jackson | io.jsonwebtoken | 0.12.x | JWT JSON 처리 |

### 2.3 Database

| Dependency | Group | Version | Purpose |
|------------|-------|---------|---------|
| spring-boot-starter-data-jpa | org.springframework.boot | 3.2.x | JPA/Hibernate |
| postgresql | org.postgresql | 42.7.x | PostgreSQL JDBC |
| HikariCP | com.zaxxer | 5.1.x | Connection Pool (Spring Boot 포함) |

### 2.4 Utilities

| Dependency | Group | Version | Purpose |
|------------|-------|---------|---------|
| lombok | org.projectlombok | 1.18.x | 보일러플레이트 감소 |
| mapstruct | org.mapstruct | 1.5.x | DTO 매핑 (Optional) |

### 2.5 Testing

| Dependency | Group | Version | Purpose |
|------------|-------|---------|---------|
| spring-boot-starter-test | org.springframework.boot | 3.2.x | 테스트 프레임워크 |
| spring-security-test | org.springframework.security | 6.2.x | Security 테스트 |
| testcontainers | org.testcontainers | 1.19.x | 통합 테스트 (PostgreSQL) |
| h2 | com.h2database | 2.2.x | 단위 테스트용 인메모리 DB |

### 2.6 Monitoring

| Dependency | Group | Version | Purpose |
|------------|-------|---------|---------|
| spring-boot-starter-actuator | org.springframework.boot | 3.2.x | 헬스체크, 메트릭 |
| micrometer-registry-prometheus | io.micrometer | 1.12.x | Prometheus 메트릭 (Optional) |

---

## 3. Build Configuration

### 3.1 Gradle (build.gradle)

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.2'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.tableorder'
version = '0.0.1-SNAPSHOT'

java {
    sourceCompatibility = '17'
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Web & API
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    
    // Security
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // Database
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'org.postgresql:postgresql'
    
    // Monitoring
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    
    // Utilities
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'org.testcontainers:junit-jupiter'
    testImplementation 'org.testcontainers:postgresql'
    testRuntimeOnly 'com.h2database:h2'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

### 3.2 Dependency Versions (BOM)

Spring Boot 3.2.x BOM이 대부분의 버전을 관리합니다. 명시적 버전 지정이 필요한 경우만 별도 선언.

---

## 4. Application Configuration

### 4.1 application.yml (공통)

```yaml
spring:
  application:
    name: table-order-api
  
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}

server:
  port: 8080
  shutdown: graceful

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      probes:
        enabled: true
```

### 4.2 application-local.yml (개발)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tableorder
    username: postgres
    password: postgres
    hikari:
      minimum-idle: 5
      maximum-pool-size: 10
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    com.tableorder: DEBUG
    org.hibernate.SQL: DEBUG

springdoc:
  swagger-ui:
    enabled: true

# JWT (개발용)
jwt:
  secret: dev-secret-key-at-least-256-bits-long-for-hs256
  expiration-hours: 16
```

### 4.3 application-prod.yml (운영)

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
    hikari:
      minimum-idle: 5
      maximum-pool-size: 15
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

logging:
  level:
    root: INFO
    com.tableorder: INFO

springdoc:
  swagger-ui:
    enabled: false

# JWT (운영용 - 환경변수)
jwt:
  secret: ${JWT_SECRET}
  expiration-hours: 16
```

---

## 5. Project Structure

```
table-order-api/
├── src/
│   └── main/
│       ├── java/com/tableorder/
│       │   ├── TableOrderApiApplication.java
│       │   ├── api/
│       │   │   ├── customer/
│       │   │   │   ├── controller/
│       │   │   │   │   ├── SessionController.java
│       │   │   │   │   ├── MenuController.java
│       │   │   │   │   └── OrderController.java
│       │   │   │   └── dto/
│       │   │   │       ├── request/
│       │   │   │       └── response/
│       │   │   └── admin/
│       │   │       ├── controller/
│       │   │       │   ├── AuthController.java
│       │   │       │   ├── DashboardController.java
│       │   │       │   ├── OrderManagementController.java
│       │   │       │   ├── TableManagementController.java
│       │   │       │   ├── MenuManagementController.java
│       │   │       │   ├── StoreController.java
│       │   │       │   └── SseController.java
│       │   │       └── dto/
│       │   │           ├── request/
│       │   │           └── response/
│       │   ├── application/
│       │   │   └── usecase/
│       │   │       ├── SessionUseCase.java
│       │   │       ├── MenuUseCase.java
│       │   │       ├── OrderUseCase.java
│       │   │       ├── TableUseCase.java
│       │   │       ├── StoreUseCase.java
│       │   │       ├── AdminAuthUseCase.java
│       │   │       └── OrderNotificationUseCase.java
│       │   ├── domain/
│       │   │   ├── entity/
│       │   │   │   ├── Store.java
│       │   │   │   ├── Table.java
│       │   │   │   ├── TableSession.java
│       │   │   │   ├── Category.java
│       │   │   │   ├── Menu.java
│       │   │   │   ├── Order.java
│       │   │   │   ├── OrderItem.java
│       │   │   │   ├── OrderHistory.java
│       │   │   │   ├── Admin.java
│       │   │   │   └── DailyOrderSequence.java
│       │   │   ├── repository/
│       │   │   │   ├── StoreRepository.java
│       │   │   │   ├── TableRepository.java
│       │   │   │   └── ... (기타 Repository)
│       │   │   └── vo/
│       │   │       ├── Money.java
│       │   │       └── OrderNumber.java
│       │   ├── infrastructure/
│       │   │   ├── persistence/
│       │   │   │   └── JpaXxxRepository.java
│       │   │   ├── security/
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   └── SessionAuthenticationFilter.java
│       │   │   ├── sse/
│       │   │   │   └── SseEmitterManager.java
│       │   │   └── config/
│       │   │       ├── CorsConfig.java
│       │   │       └── JpaConfig.java
│       │   └── common/
│       │       ├── exception/
│       │       │   ├── BusinessException.java
│       │       │   └── GlobalExceptionHandler.java
│       │       └── dto/
│       │           └── ErrorResponse.java
│       └── resources/
│           ├── application.yml
│           ├── application-local.yml
│           └── application-prod.yml
├── build.gradle
├── settings.gradle
└── Dockerfile
```

---

## 6. Containerization

### 6.1 Dockerfile

```dockerfile
# Build stage
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY gradle gradle
COPY build.gradle settings.gradle gradlew ./
COPY src src
RUN ./gradlew build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

# Non-root user
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -D appuser
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 6.2 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tableorder
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./table-order-api
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: local
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/tableorder
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 7. Code Quality

### 7.1 Checkstyle (Optional)

```groovy
// build.gradle
plugins {
    id 'checkstyle'
}

checkstyle {
    toolVersion = '10.12.5'
    configFile = file("${rootDir}/config/checkstyle/checkstyle.xml")
}
```

### 7.2 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Package | lowercase | `com.tableorder.domain.entity` |
| Class | PascalCase | `OrderUseCase` |
| Method | camelCase | `createOrder()` |
| Constant | UPPER_SNAKE | `MAX_LOGIN_ATTEMPTS` |
| Variable | camelCase | `orderNumber` |

---

## 8. Version Summary

| Component | Version |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.2.x |
| PostgreSQL Driver | 42.7.x |
| JJWT | 0.12.x |
| Lombok | 1.18.x |
| Testcontainers | 1.19.x |
| Springdoc OpenAPI | 2.3.x |

---

## 9. Decision Rationale

### 9.1 Why Spring Boot 3.2?

- Java 17+ 필수 → 최신 언어 기능 활용
- Native 이미지 지원 개선 (향후 GraalVM 고려)
- Spring Framework 6.x의 성능 개선
- Virtual Threads 지원 (필요 시 활성화)

### 9.2 Why PostgreSQL?

- 오픈소스, 무료
- JSON 타입 지원 (OrderHistory 저장)
- AWS RDS 지원
- 확장성 (Read Replica, Partitioning)

### 9.3 Why JWT for Authentication?

- Stateless 인증 (서버 세션 불필요)
- 수평 확장 용이
- 표준 기반 (RFC 7519)
- Spring Security 통합 용이

