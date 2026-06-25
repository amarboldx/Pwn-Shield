package com.amarbold.pwdmanager.pwnguard.security.filter;

import com.amarbold.pwdmanager.pwnguard.account.model.UserAccount;
import com.amarbold.pwdmanager.pwnguard.account.repository.UserRepository;
import com.amarbold.pwdmanager.pwnguard.security.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtCookieFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtCookieFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Check pockets for cookies
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<Cookie> jwtCookie = Arrays.stream(cookies)
                .filter(c -> "pg_token".equals(c.getName()))
                .findFirst();

        if (jwtCookie.isEmpty() || jwtCookie.get().getValue().isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = jwtCookie.get().getValue();

        try {
            // 2. Cryptographically verify the cookie signature
            if (jwtService.isTokenValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {

                String userIdStr = jwtService.extractUserId(token);
                UUID userId = UUID.fromString(userIdStr);

                Optional<UserAccount> userOpt = userRepository.findById(userId);

                if (userOpt.isPresent()) {
                    UserAccount user = userOpt.get();

                    // 3. Issue the Spring VIP Wristband
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            null
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ignored) {
        }

        filterChain.doFilter(request, response);
    }
}