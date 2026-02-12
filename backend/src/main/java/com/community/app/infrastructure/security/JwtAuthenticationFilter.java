package com.community.app.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtServicePort jwtService;

    public JwtAuthenticationFilter(JwtServicePort jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("Processing Auth Filter for URI: " + request.getRequestURI());

        // 1. Pega o cabeçalho Authorization
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No Bearer token found.");
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extrai o token (remove o prefixo "Bearer ")
        String token = authHeader.substring(7);

        // 3. Valida o token e autentica o usuário
        try {
            boolean isValid = jwtService.validateToken(token);
            System.out.println("Token validation result: " + isValid);

            if (isValid) {
                String email = jwtService.getSubjectFromToken(token);
                System.out.println("Authenticated user: " + email);

                // Cria o objeto de autenticação do Spring (simples, sem roles complexas por
                // enquanto)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.emptyList());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 4. "Carimba" a requisição como autenticada
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Se houver erro na validação (expirado, malformado), apenas ignora e segue
            // como anônimo.
            // Isso permite que rotas públicas funcionem mesmo com token podre.
            // Rotas privadas vão barrar depois no SecurityFilterChain.
            System.out.println("Token validation failed with exception: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}