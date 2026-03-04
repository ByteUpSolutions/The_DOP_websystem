package com.community.app.application.auth;

import com.community.app.domain.user.User;
import com.community.app.domain.user.UserRepository;
import com.community.app.infrastructure.firebase.FirebaseServicePort;
import com.community.app.infrastructure.security.PasswordEncoderPort;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RegisterUserUseCase")
class RegisterUserUseCaseTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoderPort passwordEncoder;

    @Mock
    private FirebaseServicePort firebaseService;

    @InjectMocks
    private RegisterUserUseCase useCase;

    @Test
    @DisplayName("deve registrar novo usuário com sucesso e salvar no repositório")
    void shouldRegisterNewUserSuccessfully() {
        User savedUser = new User(UUID.randomUUID(), "João Silva", "joao@example.com",
                "hashed_pass", "USER", "firebase-uid-new", null, LocalDateTime.now(), true);

        when(userRepository.findByEmail("joao@example.com")).thenReturn(Optional.empty());
        when(firebaseService.createUser("joao@example.com", "123456", "João Silva"))
                .thenReturn("firebase-uid-new");
        when(passwordEncoder.encode("123456")).thenReturn("hashed_pass");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = useCase.execute("João Silva", "joao@example.com", "123456");

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo("joao@example.com");
        assertThat(result.fullName()).isEqualTo("João Silva");
        assertThat(result.role()).isEqualTo("USER");

        verify(firebaseService).createUser("joao@example.com", "123456", "João Silva");
        verify(passwordEncoder).encode("123456");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("deve lançar exceção quando e-mail já está cadastrado")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        User existingUser = new User(UUID.randomUUID(), "Existing", "joao@example.com",
                "hash", "USER", "fuid", null, LocalDateTime.now(), true);

        when(userRepository.findByEmail("joao@example.com")).thenReturn(Optional.of(existingUser));

        assertThatThrownBy(() -> useCase.execute("João Silva", "joao@example.com", "123456"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User already exists");
    }
}
