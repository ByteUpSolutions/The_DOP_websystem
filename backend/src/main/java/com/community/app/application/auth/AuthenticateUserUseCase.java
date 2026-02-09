package com.community.app.application.auth;

import com.community.app.domain.user.User;
import com.community.app.domain.user.UserRepository;
import com.community.app.infrastructure.security.PasswordEncoderPort;
import com.community.app.infrastructure.security.JwtServicePort;
import com.community.app.infrastructure.firebase.FirebaseServicePort;
import org.springframework.stereotype.Service;

@Service
public class AuthenticateUserUseCase {
    private final UserRepository userRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final JwtServicePort jwtService;
    private final FirebaseServicePort firebaseService;

    public AuthenticateUserUseCase(UserRepository userRepository, PasswordEncoderPort passwordEncoder, JwtServicePort jwtService, FirebaseServicePort firebaseService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.firebaseService = firebaseService;
    }

    public AuthTokens execute(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, user.passwordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtService.generateToken(user.email());
        String chatToken = firebaseService.createCustomToken(user.firebaseUid());

        return new AuthTokens(accessToken, chatToken, user);
    }

    public record AuthTokens(String accessToken, String chatToken, User user) {}
}
