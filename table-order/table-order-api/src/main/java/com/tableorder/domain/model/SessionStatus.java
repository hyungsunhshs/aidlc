package com.tableorder.domain.model;

public enum SessionStatus {
    ACTIVE,     // 활성 (이용 중)
    COMPLETED,  // 완료 (이용 완료)
    EXPIRED     // 만료 (16시간 경과)
}
