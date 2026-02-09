package com.community.app.infrastructure.security;

public interface JwtServicePort {
    String generateToken(String subject);
    String getSubjectFromToken(String token);
    boolean validateToken(String token);
}
