package com.tableorder.application.dto.table;

import com.tableorder.domain.model.StoreTable;

import java.util.List;

public record TableResponse(
    Long id,
    String tableNumber,
    boolean isActive
) {
    public static TableResponse from(StoreTable table) {
        return new TableResponse(
            table.getId(),
            table.getTableNumber(),
            table.isActive()
        );
    }
    
    public static List<TableResponse> fromList(List<StoreTable> tables) {
        return tables.stream()
            .map(TableResponse::from)
            .toList();
    }
}
