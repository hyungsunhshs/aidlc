package com.tableorder.common.security;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Getter
public class SessionAuthentication extends AbstractAuthenticationToken {
    
    private final Long sessionId;
    private final Long tableId;
    private final Long storeId;
    
    public SessionAuthentication(Long sessionId, Long tableId, Long storeId) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        this.sessionId = sessionId;
        this.tableId = tableId;
        this.storeId = storeId;
        setAuthenticated(true);
    }
    
    @Override
    public Object getCredentials() {
        return null;
    }
    
    @Override
    public Object getPrincipal() {
        return this;
    }
}
