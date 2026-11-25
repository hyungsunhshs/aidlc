package com.tableorder.common.security;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Getter
public class AdminAuthentication extends AbstractAuthenticationToken {
    
    private final Long adminId;
    private final Long storeId;
    private final String username;
    
    public AdminAuthentication(Long adminId, Long storeId, String username) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        this.adminId = adminId;
        this.storeId = storeId;
        this.username = username;
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
