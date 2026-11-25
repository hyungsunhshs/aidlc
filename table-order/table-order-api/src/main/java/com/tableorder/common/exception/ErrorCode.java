package com.tableorder.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    // Session
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "세션을 찾을 수 없습니다"),
    SESSION_EXPIRED(HttpStatus.BAD_REQUEST, "세션이 만료되었습니다"),
    SESSION_NOT_ACTIVE(HttpStatus.BAD_REQUEST, "활성 세션이 아닙니다"),
    
    // Authentication
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다"),
    ACCOUNT_LOCKED(HttpStatus.TOO_MANY_REQUESTS, "계정이 잠겼습니다. 15분 후 다시 시도해주세요"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    ADMIN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "관리자 정보를 찾을 수 없습니다"),
    
    // Order
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "주문을 찾을 수 없습니다"),
    INVALID_ORDER_STATUS_TRANSITION(HttpStatus.BAD_REQUEST, "잘못된 주문 상태 변경입니다"),
    EMPTY_ORDER_ITEMS(HttpStatus.BAD_REQUEST, "주문 항목이 없습니다"),
    
    // Menu
    MENU_NOT_FOUND(HttpStatus.NOT_FOUND, "메뉴를 찾을 수 없습니다"),
    MENU_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "주문할 수 없는 메뉴입니다"),
    
    // Category
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다"),
    
    // Table
    TABLE_NOT_FOUND(HttpStatus.NOT_FOUND, "테이블을 찾을 수 없습니다"),
    TABLE_NOT_ACTIVE(HttpStatus.BAD_REQUEST, "비활성 테이블입니다"),
    DUPLICATE_TABLE_NUMBER(HttpStatus.CONFLICT, "이미 등록된 테이블 번호입니다"),
    NO_ACTIVE_SESSION(HttpStatus.BAD_REQUEST, "활성 세션이 없습니다"),
    
    // Store
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "매장을 찾을 수 없습니다"),
    DUPLICATE_STORE_IDENTIFIER(HttpStatus.CONFLICT, "이미 사용 중인 매장 식별자입니다"),
    
    // Validation
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다"),
    
    // Access
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다"),
    
    // Internal
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다");
    
    private final HttpStatus httpStatus;
    private final String message;
}
