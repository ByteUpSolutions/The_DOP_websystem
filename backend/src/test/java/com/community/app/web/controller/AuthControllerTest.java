package com.community.app.web.controller;

import com.community.app.application.auth.AuthenticateUserUseCase;
import com.community.app.application.auth.RegisterUserUseCase;
import com.community.app.domain.user.User;
import com.community.app.infrastructure.security.JwtServicePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController")
class AuthControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private JwtServicePort jwtServicePort;

  @MockBean
  private RegisterUserUseCase registerUserUseCase;

  @MockBean
  private AuthenticateUserUseCase authenticateUserUseCase;

  private User buildMockUser() {
    return new User(UUID.randomUUID(), "Test User", "test@example.com",
        "hash", "USER", "firebase-uid", null, LocalDateTime.now(), true);
  }

  @Test
  @WithMockUser
  @DisplayName("POST /api/auth/register deve retornar 200 OK com dados do usuário")
  void shouldReturnOkWhenRegisteringNewUser() throws Exception {
    User mockUser = buildMockUser();
    when(registerUserUseCase.execute("Test User", "test@example.com", "password123"))
        .thenReturn(mockUser);

    String body = """
        {
          "fullName": "Test User",
          "email": "test@example.com",
          "password": "password123"
        }
        """;

    mockMvc.perform(post("/api/auth/register")
        .with(csrf())
        .contentType(MediaType.APPLICATION_JSON)
        .content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("test@example.com"))
        .andExpect(jsonPath("$.fullName").value("Test User"));
  }

  @Test
  @WithMockUser
  @DisplayName("POST /api/auth/login deve retornar 200 OK com accessToken e chatToken")
  void shouldReturnOkWithTokensWhenLoginIsSuccessful() throws Exception {
    User mockUser = buildMockUser();
    AuthenticateUserUseCase.AuthTokens tokens = new AuthenticateUserUseCase.AuthTokens("jwt_token_123",
        "firebase_token_456", mockUser);

    when(authenticateUserUseCase.execute("test@example.com", "password123"))
        .thenReturn(tokens);

    String body = """
        {
          "email": "test@example.com",
          "password": "password123"
        }
        """;

    mockMvc.perform(post("/api/auth/login")
        .with(csrf())
        .contentType(MediaType.APPLICATION_JSON)
        .content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").value("jwt_token_123"))
        .andExpect(jsonPath("$.chatToken").value("firebase_token_456"))
        .andExpect(jsonPath("$.user.email").value("test@example.com"));
  }

  @Test
  @WithMockUser
  @DisplayName("POST /api/auth/register com body inválido deve retornar 400 Bad Request")
  void shouldReturnBadRequestWhenRegisterBodyIsInvalid() throws Exception {
    String invalidBody = """
        {
          "fullName": "",
          "email": "not-an-email",
          "password": ""
        }
        """;

    mockMvc.perform(post("/api/auth/register")
        .with(csrf())
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidBody))
        .andExpect(status().isBadRequest());
  }
}
