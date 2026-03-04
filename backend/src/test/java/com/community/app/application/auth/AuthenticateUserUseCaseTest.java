package com.community.app.application.auth;

import com.community.app.domain.user.User;
import com.community.app.domain.user.UserRepository;
import com.community.app.infrastructure.firebase.FirebaseServicePort;
import com.community.app.infrastructure.security.JwtServicePort;
import com.community.app.infrastructure.security.PasswordEncoderPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticateUserUseCase")
class AuthenticateUserUseCaseTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoderPort passwordEncoder;

    @Mock
    private JwtServicePort jwtService;

    @Mock
    private FirebaseServicePort firebaseService;

    @InjectMocks
    private AuthenticateUserUseCase useCase;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User(
                UUID.randomUUID(),
                "Test User",
                "test@example.com",
                "hashed_password",
                "USER",
                "firebase-uid-123",
                null,
                LocalDateTime.now(),
                true);
    }

    @Test
    @DisplayName("deve retornar AuthTokens quando credenciais são válidas")
    void shouldReturnAuthTokensWhenCredentialsAreValid() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("raw_password", "hashed_password")).thenReturn(true);
        when(jwtService.generateToken("test@example.com")).thenReturn("jwt_token");
        when(firebaseService.createCustomToken("firebase-uid-123")).thenReturn("firebase_token");

        AuthenticateUserUseCase.AuthTokens result = useCase.execute("test@example.com", "raw_password");

        assertThat(result).isNotNull();
        assertThat(result.accessToken()).isEqualTo("jwt_token");
        assertThat(result.chatToken()).isEqualTo("firebase_token");
        assertThat(result.user().email()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("deve lançar exceção quando usuário não é encontrado")
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute("unknown@example.com", "any_password"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("deve lançar exceção quando senha está incorreta")
    void shouldThrowExceptionWhenPasswordIsWrong() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong_password", "hashed_password")).thenReturn(false);

        assertThatThrownBy(() -> useCase.execute("test@example.com", "wrong_password"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Invalid credentials");
    }
}
