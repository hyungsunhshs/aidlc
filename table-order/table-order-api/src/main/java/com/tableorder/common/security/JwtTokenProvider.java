package com.tableorder.common.security;

import com.tableorder.domain.model.Admin;
import com.tableorder.domain.model.TableSession;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration-hours}")
    private int expirationHours;
    
    private SecretKey key;
    
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
    
    public String createAdminToken(Admin admin) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + (long) expirationHours * 3600 * 1000);
        
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
    
    public String createSessionToken(TableSession session) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 16L * 3600 * 1000); // 16시간
        
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
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
    
    public Claims getClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
    
    public boolean isAdminToken(String token) {
        try {
            Claims claims = getClaims(token);
            return "admin".equals(claims.getSubject());
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isSessionToken(String token) {
        try {
            Claims claims = getClaims(token);
            return "session".equals(claims.getSubject());
        } catch (Exception e) {
            return false;
        }
    }
    
    public Long getAdminId(String token) {
        return getClaims(token).get("adminId", Long.class);
    }
    
    public Long getStoreId(String token) {
        return getClaims(token).get("storeId", Long.class);
    }
    
    public Long getSessionId(String token) {
        return getClaims(token).get("sessionId", Long.class);
    }
    
    public Long getTableId(String token) {
        return getClaims(token).get("tableId", Long.class);
    }
}
