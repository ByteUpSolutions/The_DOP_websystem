package com.community.app.application.auth;

import com.community.app.domain.user.User;
import com.community.app.domain.user.UserRepository;
import com.community.app.infrastructure.security.PasswordEncoderPort;
import com.community.app.infrastructure.firebase.FirebaseServicePort;
import org.springframework.stereotype.Service;

@Service
public class RegisterUserUseCase {
    private final UserRepository userRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final FirebaseServicePort firebaseService;

    public RegisterUserUseCase(UserRepository userRepository, PasswordEncoderPort passwordEncoder, FirebaseServicePort firebaseService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.firebaseService = firebaseService;
    }

    public User execute(String fullName, String email, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        String firebaseUid = firebaseService.createUser(email, rawPassword, fullName);
        String passwordHash = passwordEncoder.encode(rawPassword);

        User newUser = User.createNew(fullName, email, passwordHash, firebaseUid);
        return userRepository.save(newUser);
    }
}
