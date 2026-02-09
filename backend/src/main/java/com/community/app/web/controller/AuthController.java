package com.community.app.web.controller;

import com.community.app.application.auth.AuthenticateUserUseCase;
import com.community.app.application.auth.RegisterUserUseCase;
import com.community.app.web.dto.LoginRequestDTO;
import com.community.app.web.dto.LoginResponseDTO;
import com.community.app.web.dto.RegisterRequestDTO;
import com.community.app.web.dto.UserResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final AuthenticateUserUseCase authenticateUserUseCase;

    public AuthController(RegisterUserUseCase registerUserUseCase, AuthenticateUserUseCase authenticateUserUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.authenticateUserUseCase = authenticateUserUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        var user = registerUserUseCase.execute(request.fullName(), request.email(), request.password());
        return ResponseEntity.ok(UserResponseDTO.fromDomain(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        var tokens = authenticateUserUseCase.execute(request.email(), request.password());
        
        LoginResponseDTO response = new LoginResponseDTO(
            tokens.accessToken(),
            tokens.chatToken(),
            UserResponseDTO.fromDomain(tokens.user())
        );
        
        return ResponseEntity.ok(response);
    }
}
