package com.tableorder.domain.model;

public enum OrderStatus {
    PENDING,    // 대기중 (접수 대기)
    PREPARING,  // 준비중 (조리 중)
    COMPLETED   // 완료
}
