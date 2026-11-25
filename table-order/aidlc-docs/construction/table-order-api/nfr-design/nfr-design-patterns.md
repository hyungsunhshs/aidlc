# NFR Design Patterns - table-order-api

## Overview
table-order-api Unit에 적용되는 설계 패턴입니다.

---

## 1. Security Patterns

### 1.1 Authentication Pattern

#### JWT Authentication (Admin API)

```
┌──────────┐     ┌──────────────────┐     ┌──────────────┐
│  Client  │────▶│ JwtAuthFilter    │────▶│  Controller  │
└──────────┘     └────────┬─────────┘     └──────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ JwtTokenProvider │
                 │ - validate()     │
                 │ - extractClaims()│
                 └──────────────────┘
```

```java
// JwtAuthenticationFilter.java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain chain) {
        String token = extractToken(request);
        
        if (token != null && jwtTokenProvider.validateToken(token)) {
            Authentication auth = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        chain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
```

#### Session Token Authentication (Customer API)

```java
// SessionAuthenticationFilter.java
@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) {
        String token = extractToken(request);
        
        if (token != null && jwtTokenProvider.validateSessionToken(token)) {
            SessionAuthentication auth = jwtTokenProvider.getSessionAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        chain.doFilter(request, response);
    }
}
```

### 1.2 Authorization Pattern

#### Store-Scoped Access Control

```java
// StoreSecurityAspect.java
@Aspect
@Component
public class StoreSecurityAspect {
    
    @Before("@annotation(StoreScoped)")
    public void enforceStoreScope(JoinPoint joinPoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userStoreId = extractStoreId(auth);
        
        // 메서드 파라미터에서 storeId 추출하여 비교
        Long requestStoreId = extractStoreIdFromArgs(joinPoint.getArgs());
        
        if (!userStoreId.equals(requestStoreId)) {
            throw new AccessDeniedException("다른 매장의 데이터에 접근할 수 없습니다");
        }
    }
}

// 사용 예시
@StoreScoped
public List<Order> getOrders(Long storeId) {
    return orderRepository.findByStoreId(storeId);
}
```

### 1.3 Password Security Pattern

```java
// PasswordEncoder 설정
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12); // cost factor 12
}

// 사용
String hashedPassword = passwordEncoder.encode(plainPassword);
boolean matches = passwordEncoder.matches(plainPassword, hashedPassword);
```

---

## 2. Error Handling Patterns

### 2.1 Flat Exception Pattern

단일 BusinessException 클래스와 에러 코드 enum으로 모든 비즈니스 예외를 처리합니다.

```java
// ErrorCode.java
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Session
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "세션을 찾을 수 없습니다"),
    SESSION_EXPIRED(HttpStatus.BAD_REQUEST, "세션이 만료되었습니다"),
    SESSION_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 활성화된 세션이 있습니다"),
    
    // Authentication
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다"),
    ACCOUNT_LOCKED(HttpStatus.TOO_MANY_REQUESTS, "계정이 잠겼습니다. 15분 후 다시 시도해주세요"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    
    // Order
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "주문을 찾을 수 없습니다"),
    INVALID_ORDER_STATUS_TRANSITION(HttpStatus.BAD_REQUEST, "잘못된 주문 상태 변경입니다"),
    EMPTY_ORDER_ITEMS(HttpStatus.BAD_REQUEST, "주문 항목이 없습니다"),
    
    // Menu
    MENU_NOT_FOUND(HttpStatus.NOT_FOUND, "메뉴를 찾을 수 없습니다"),
    MENU_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "주문할 수 없는 메뉴입니다"),
    
    // Table
    TABLE_NOT_FOUND(HttpStatus.NOT_FOUND, "테이블을 찾을 수 없습니다"),
    DUPLICATE_TABLE_NUMBER(HttpStatus.CONFLICT, "이미 등록된 테이블 번호입니다"),
    
    // Category
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다"),
    
    // Store
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "매장을 찾을 수 없습니다"),
    DUPLICATE_STORE_IDENTIFIER(HttpStatus.CONFLICT, "이미 사용 중인 매장 식별자입니다"),
    
    // Validation
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다"),
    
    // Internal
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다");
    
    private final HttpStatus httpStatus;
    private final String message;
}

// BusinessException.java
@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
    
    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }
    
    public HttpStatus getHttpStatus() {
        return errorCode.getHttpStatus();
    }
    
    public String getCode() {
        return errorCode.name();
    }
}
```

### 2.2 Global Exception Handler Pattern

```java
// GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("Business exception: code={}, message={}", e.getCode(), e.getMessage());
        
        return ResponseEntity
            .status(e.getHttpStatus())
            .body(new ErrorResponse(e.getCode(), e.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        
        return ResponseEntity
            .badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", message));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("ACCESS_DENIED", "접근 권한이 없습니다"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception e) {
        log.error("Unexpected exception", e);
        
        return ResponseEntity
            .internalServerError()
            .body(new ErrorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다"));
    }
}

// ErrorResponse.java
public record ErrorResponse(
    String code,
    String message
) {}
```

---

## 3. Data Transformation Patterns

### 3.1 Manual DTO Mapping Pattern

Controller 레이어에서 Entity ↔ DTO 변환을 직접 수행합니다.

```java
// MenuResponse.java
public record MenuResponse(
    Long id,
    String name,
    BigDecimal price,
    String description,
    String imageUrl,
    Integer displayOrder,
    boolean isAvailable
) {
    public static MenuResponse from(Menu menu) {
        return new MenuResponse(
            menu.getId(),
            menu.getName(),
            menu.getPrice(),
            menu.getDescription(),
            menu.getImageUrl(),
            menu.getDisplayOrder(),
            menu.isAvailable()
        );
    }
    
    public static List<MenuResponse> fromList(List<Menu> menus) {
        return menus.stream()
            .map(MenuResponse::from)
            .toList();
    }
}

// CreateOrderRequest.java
public record CreateOrderRequest(
    @NotEmpty(message = "주문 항목은 필수입니다")
    List<@Valid OrderItemRequest> items
) {
    public List<OrderItemCommand> toCommands() {
        return items.stream()
            .map(item -> new OrderItemCommand(item.menuId(), item.quantity()))
            .toList();
    }
}
```

### 3.2 Response Builder Pattern

복잡한 응답 객체 생성을 위한 빌더 패턴 적용:

```java
// OrderDetailResponse.java
@Builder
public record OrderDetailResponse(
    Long orderId,
    String orderNumber,
    String status,
    BigDecimal totalAmount,
    LocalDateTime createdAt,
    List<OrderItemResponse> items,
    TableInfo table
) {
    public static OrderDetailResponse from(Order order, Table table) {
        return OrderDetailResponse.builder()
            .orderId(order.getId())
            .orderNumber(order.getOrderNumber())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())
            .createdAt(order.getCreatedAt())
            .items(order.getItems().stream()
                .map(OrderItemResponse::from)
                .toList())
            .table(new TableInfo(table.getId(), table.getTableNumber()))
            .build();
    }
}
```

---

## 4. Validation Patterns

### 4.1 Two-Layer Validation Pattern

#### Layer 1: Controller (형식 검증)

```java
// Controller Layer - Bean Validation
@PostMapping("/orders")
public ResponseEntity<CreateOrderResponse> createOrder(
    @Valid @RequestBody CreateOrderRequest request,
    @AuthenticationPrincipal SessionAuthentication auth
) {
    // @Valid가 형식 검증 수행
    // - @NotEmpty, @Size, @Min, @Max 등
    return ResponseEntity.ok(orderUseCase.createOrder(auth.getSessionId(), request));
}
```

#### Layer 2: UseCase (비즈니스 규칙 검증)

```java
// UseCase Layer - Business Rule Validation
@Service
@Transactional
public class OrderUseCase {
    
    public CreateOrderResponse createOrder(Long sessionId, CreateOrderRequest request) {
        // 비즈니스 규칙 검증
        TableSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
        
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.SESSION_EXPIRED);
        }
        
        // 메뉴 가용성 검증
        for (OrderItemCommand item : request.toCommands()) {
            Menu menu = menuRepository.findById(item.menuId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
            
            if (menu.isDeleted() || !menu.isAvailable()) {
                throw new BusinessException(ErrorCode.MENU_NOT_AVAILABLE, 
                    "주문할 수 없는 메뉴입니다: " + menu.getName());
            }
        }
        
        // 비즈니스 로직 수행...
    }
}
```

### 4.2 Custom Validator Pattern

복잡한 검증 로직을 위한 커스텀 Validator:

```java
// TablePasswordValidator.java
public class TablePasswordValidator implements ConstraintValidator<ValidTablePassword, String> {
    
    private static final Pattern PATTERN = Pattern.compile("^\\d{4}$");
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        return PATTERN.matcher(value).matches();
    }
}

// 사용
public record CreateTableRequest(
    @NotBlank String tableNumber,
    @ValidTablePassword String password
) {}
```

---

## 5. Transaction Patterns

### 5.1 UseCase Transaction Pattern

트랜잭션은 UseCase(Application Service) 레이어에서 관리합니다.

```java
@Service
@Transactional(readOnly = true)  // 기본: 읽기 전용
public class OrderUseCase {
    
    // 조회 메서드 - 읽기 전용 트랜잭션
    public List<OrderResponse> getOrders(Long sessionId) {
        return orderRepository.findBySessionId(sessionId).stream()
            .map(OrderResponse::from)
            .toList();
    }
    
    // 변경 메서드 - 쓰기 트랜잭션
    @Transactional
    public CreateOrderResponse createOrder(Long sessionId, CreateOrderRequest request) {
        // 트랜잭션 내에서 실행
        // ...
    }
    
    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
        // 트랜잭션 내에서 실행
        // ...
    }
}
```

### 5.2 Pessimistic Lock Pattern

주문 번호 생성 시 동시성 제어:

```java
// DailyOrderSequenceRepository.java
public interface DailyOrderSequenceRepository extends JpaRepository<DailyOrderSequence, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM DailyOrderSequence s WHERE s.storeId = :storeId AND s.orderDate = :date")
    Optional<DailyOrderSequence> findByStoreIdAndDateWithLock(
        @Param("storeId") Long storeId, 
        @Param("date") LocalDate date
    );
}

// OrderUseCase.java
@Transactional
public String generateOrderNumber(Long storeId) {
    LocalDate today = LocalDate.now();
    
    DailyOrderSequence sequence = sequenceRepository
        .findByStoreIdAndDateWithLock(storeId, today)
        .orElseGet(() -> new DailyOrderSequence(storeId, today, 0));
    
    int nextSequence = sequence.getLastSequence() + 1;
    sequence.setLastSequence(nextSequence);
    sequenceRepository.save(sequence);
    
    return String.format("%s-%03d", 
        today.format(DateTimeFormatter.BASIC_ISO_DATE), 
        nextSequence);
}
```

---

## 6. SSE (Server-Sent Events) Pattern

### 6.1 In-Memory SSE Management Pattern

```java
// SseEmitterManager.java
@Component
@Slf4j
public class SseEmitterManager {
    
    private static final Long SSE_TIMEOUT = 30 * 60 * 1000L; // 30분
    
    // storeId -> List<SseEmitter>
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    
    public SseEmitter createEmitter(Long storeId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        emitters.computeIfAbsent(storeId, k -> new CopyOnWriteArrayList<>())
            .add(emitter);
        
        emitter.onCompletion(() -> removeEmitter(storeId, emitter));
        emitter.onTimeout(() -> removeEmitter(storeId, emitter));
        emitter.onError(e -> removeEmitter(storeId, emitter));
        
        // 초기 연결 확인 이벤트
        sendEvent(emitter, "connect", Map.of("message", "connected"));
        
        return emitter;
    }
    
    public void broadcast(Long storeId, String eventName, Object data) {
        List<SseEmitter> storeEmitters = emitters.get(storeId);
        if (storeEmitters == null || storeEmitters.isEmpty()) {
            return;
        }
        
        List<SseEmitter> deadEmitters = new ArrayList<>();
        
        for (SseEmitter emitter : storeEmitters) {
            try {
                sendEvent(emitter, eventName, data);
            } catch (Exception e) {
                deadEmitters.add(emitter);
                log.warn("Failed to send SSE event to emitter", e);
            }
        }
        
        storeEmitters.removeAll(deadEmitters);
    }
    
    private void sendEvent(SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                .name(eventName)
                .data(data));
        } catch (IOException e) {
            throw new RuntimeException("SSE send failed", e);
        }
    }
    
    private void removeEmitter(Long storeId, SseEmitter emitter) {
        List<SseEmitter> storeEmitters = emitters.get(storeId);
        if (storeEmitters != null) {
            storeEmitters.remove(emitter);
        }
    }
}
```

### 6.2 SSE Event Publishing Pattern

```java
// OrderNotificationUseCase.java
@Service
@RequiredArgsConstructor
public class OrderNotificationUseCase {
    
    private final SseEmitterManager sseEmitterManager;
    
    public void notifyNewOrder(Order order, Long storeId) {
        OrderEvent event = OrderEvent.builder()
            .orderId(order.getId())
            .orderNumber(order.getOrderNumber())
            .tableNumber(order.getSession().getTable().getTableNumber())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())
            .items(mapToEventItems(order.getItems()))
            .createdAt(order.getCreatedAt())
            .build();
        
        sseEmitterManager.broadcast(storeId, "NEW_ORDER", event);
    }
    
    public void notifyOrderStatusChanged(Order order, Long storeId) {
        // ...
        sseEmitterManager.broadcast(storeId, "ORDER_STATUS_CHANGED", event);
    }
    
    public void notifyOrderDeleted(Long orderId, Long storeId) {
        sseEmitterManager.broadcast(storeId, "ORDER_DELETED", 
            Map.of("orderId", orderId));
    }
}
```

---

## 7. Logging Patterns

### 7.1 Structured Logging Pattern

```java
// 비즈니스 이벤트 로깅
@Slf4j
@Service
public class OrderUseCase {
    
    @Transactional
    public CreateOrderResponse createOrder(Long sessionId, CreateOrderRequest request) {
        // ... 주문 생성 로직
        
        log.info("Order created: orderId={}, sessionId={}, tableId={}, totalAmount={}, itemCount={}",
            order.getId(), 
            sessionId, 
            session.getTable().getId(),
            order.getTotalAmount(),
            order.getItems().size());
        
        return CreateOrderResponse.from(order);
    }
}

// 보안 이벤트 로깅
@Slf4j
@Service
public class AdminAuthUseCase {
    
    public AdminLoginResponse login(AdminLoginRequest request) {
        try {
            // ... 로그인 로직
            
            log.info("Admin login success: storeId={}, username={}", 
                store.getId(), request.username());
            
        } catch (BusinessException e) {
            log.warn("Admin login failed: storeId={}, username={}, reason={}",
                store.getId(), request.username(), e.getCode());
            throw e;
        }
    }
}
```

### 7.2 Request/Response Logging Pattern

```java
// RequestLoggingFilter.java
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        
        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("HTTP {} {} - {} ({}ms)",
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                duration);
        }
    }
}
```

---

## 8. Scheduled Task Patterns

### 8.1 Session Expiry Pattern

```java
// SessionExpiryScheduler.java
@Component
@Slf4j
@RequiredArgsConstructor
public class SessionExpiryScheduler {
    
    private final TableSessionRepository sessionRepository;
    
    @Scheduled(fixedRate = 300000) // 5분마다
    @Transactional
    public void expireSessions() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(16);
        
        List<TableSession> expiredSessions = sessionRepository
            .findByStatusAndStartedAtBefore(SessionStatus.ACTIVE, threshold);
        
        for (TableSession session : expiredSessions) {
            session.setStatus(SessionStatus.EXPIRED);
            log.info("Session expired: sessionId={}, tableId={}", 
                session.getId(), session.getTable().getId());
        }
        
        if (!expiredSessions.isEmpty()) {
            log.info("Expired {} sessions", expiredSessions.size());
        }
    }
}
```

### 8.2 Heartbeat Pattern (SSE)

```java
// SseHeartbeatScheduler.java
@Component
@RequiredArgsConstructor
public class SseHeartbeatScheduler {
    
    private final SseEmitterManager sseEmitterManager;
    
    @Scheduled(fixedRate = 30000) // 30초마다
    public void sendHeartbeat() {
        sseEmitterManager.broadcastToAll("heartbeat", 
            Map.of("timestamp", Instant.now().toString()));
    }
}
```

