package com.tableorder.common.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        
        String token = extractToken(request);
        log.info("JwtFilter - Request URI: {}, Token present: {}", request.getRequestURI(), StringUtils.hasText(token));
        
        if (StringUtils.hasText(token)) {
            boolean isValid = jwtTokenProvider.validateToken(token);
            log.info("JwtFilter - Token validation result: {}", isValid);
            
            if (isValid) {
                boolean isAdmin = jwtTokenProvider.isAdminToken(token);
                boolean isSession = jwtTokenProvider.isSessionToken(token);
                log.info("JwtFilter - isAdminToken: {}, isSessionToken: {}", isAdmin, isSession);
                
                if (isAdmin) {
                    Claims claims = jwtTokenProvider.getClaims(token);
                    Long adminId = claims.get("adminId", Long.class);
                    Long storeId = claims.get("storeId", Long.class);
                    String username = claims.get("username", String.class);
                    log.info("JwtFilter - Admin claims - adminId: {}, storeId: {}, username: {}", adminId, storeId, username);
                    
                    AdminAuthentication auth = new AdminAuthentication(adminId, storeId, username);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.info("JwtFilter - AdminAuthentication set in SecurityContext, auth.authenticated={}", auth.isAuthenticated());
                } else if (isSession) {
                    Claims claims = jwtTokenProvider.getClaims(token);
                    SessionAuthentication auth = new SessionAuthentication(
                        claims.get("sessionId", Long.class),
                        claims.get("tableId", Long.class),
                        claims.get("storeId", Long.class)
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.info("JwtFilter - SessionAuthentication set in SecurityContext");
                }
            }
        } else {
            log.info("JwtFilter - No token found in request");
        }
        
        chain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        // 1. Try Authorization header first
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        
        // 2. Fall back to query parameter (for SSE connections)
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam;
        }
        
        return null;
    }
}
