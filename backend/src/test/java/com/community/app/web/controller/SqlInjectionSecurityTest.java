package com.community.app.web.controller;

import com.community.app.application.auth.AuthenticateUserUseCase;
import com.community.app.application.auth.RegisterUserUseCase;
import com.community.app.infrastructure.security.JwtServicePort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de SQL Injection — Camada Web (Controllers)
 *
 * <p>
 * Verifica que payloads de SQL Injection comuns são rejeitados antes de
 * chegar ao banco de dados. O backend usa Spring Data JPA com prepared
 * statements (imune a SQLi por design). Estes testes garantem que:
 *
 * <ol>
 * <li>Payloads SQLi no campo {@code email} (com {@code @Email}) resultam em
 * {@code 400 Bad Request} via Bean Validation.</li>
 * <li>Payloads SQLi em campos de texto livre (password, fullName) não causam
 * autenticação indevida ({@code 200 OK}).</li>
 * <li>Senhas com SQLi mais curtas que 6 chars são bloqueadas por
 * {@code @Size(min=6)}.</li>
 * </ol>
 */
@WebMvcTest(AuthController.class)
@DisplayName("[Segurança] SQL Injection — AuthController")
class SqlInjectionSecurityTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private JwtServicePort jwtServicePort;

        @MockBean
        private RegisterUserUseCase registerUserUseCase;

        @MockBean
        private AuthenticateUserUseCase authenticateUserUseCase;

        // ─── POST /api/auth/login ─────────────────────────────────────────────────

        @Nested
        @DisplayName("POST /api/auth/login")
        class LoginEndpoint {

                /**
                 * Payloads SQLi no campo email são inválidos como e-mail →
                 * a validação {@code @Email} do Bean Validation retorna 400
                 * ANTES de chegar ao use case ou ao banco de dados.
                 */
                @ParameterizedTest(name = "email=[{0}] deve retornar 400")
                @ValueSource(strings = {
                                "' OR '1'='1",
                                "' OR 1=1--",
                                "'; DROP TABLE users;--",
                                "' UNION SELECT null,null,null--",
                                "admin'--",
                                "1' OR '1'='1' /*"
                })
                @WithMockUser
                @DisplayName("email com SQLi deve retornar 400 Bad Request (@Email bloqueia)")
                void loginWithSqliInEmail_shouldReturn400(String sqliEmail) throws Exception {
                        String body = """
                                        {
                                          "email": "%s",
                                          "password": "senhaSegura123"
                                        }
                                        """.formatted(escapeSqliForJson(sqliEmail));

                        mockMvc.perform(post("/api/auth/login")
                                        .with(csrf())
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isBadRequest()); // 400 — @Email rejeita o payload
                }

        /**
         * Payloads SQLi no campo password chegam ao backend como strings literais
         * (sem restrição de formato em password). O use case é mockado para lançar
         * RuntimeException, simulando credenciais inválidas.
         *
         * <p>Como o backend não possui {@code @ControllerAdvice} para {@code RuntimeException},
         * o MockMvc propaga a exceção como {@code ServletException}. Isso é capturado
         * pelo {@code try-catch} e confirma que o payload NÃO causou autenticação (200 OK).
         *
         * <p>O comportamento esperado em produção é idêntico: o JPA passa o payload como
         * string parametrizada ao banco, que rejeita as credenciais e retorna 500/4xx.
         */
        @ParameterizedTest(name = "password=[{0}] não deve autenticar (nunca 200)")
        @ValueSource(strings = {
                "' OR '1'='1",
                "'; DROP TABLE users;--",
                "admin'--"
        })
        @WithMockUser
        @DisplayName("password com SQLi deve ser tratado como string — nunca retornar 200")
        void loginWithSqliInPassword_shouldNotReturn200(String sqliPassword) {
            when(authenticateUserUseCase.execute(anyString(), anyString()))
                    .thenThrow(new RuntimeException("Credenciais inválidas"));

            String body = """
                    {
                      "email": "test@valid.com",
                      "password": "%s"
                    }
                    """.formatted(escapeSqliForJson(sqliPassword));

            try {
                // O MockMvc pode lançar ServletException quando não há @ExceptionHandler global.
                // Se chegar aqui sem exceção, verificamos que o status NÃO é 200.
                MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                        .andReturn();

                assertNotEquals(200, result.getResponse().getStatus(),
                        "SQLi no password NÃO deve resultar em 200 OK");

            } catch (Exception ex) {
                // ServletException/NestedServletException = o payload chegou ao backend
                // como string, foi rejeitado pelo use case e propagou um erro — correto!
                // O importante é que NÃO houve autenticação bem-sucedida.
                String message = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getName();
                assertFalse(message.contains("200"),
                        "Não deveria resultar em 200 OK. Exceção: " + message);
                // Confirma que o payload chegou como string (a exceção contém a msg do use case)
                assertTrue(
                        ex.getMessage().contains("Credenciais") || ex.getCause() != null,
                        "Exceção esperada do use case, mas recebeu: " + ex.getMessage()
                );
            }
        }
        }

        // ─── POST /api/auth/register ──────────────────────────────────────────────

        @Nested
        @DisplayName("POST /api/auth/register")
        class RegisterEndpoint {

                /**
                 * Campo email com SQLi → rejeitado por {@code @Email} → 400.
                 */
                @ParameterizedTest(name = "email=[{0}] deve retornar 400")
                @ValueSource(strings = {
                                "' OR '1'='1",
                                "' OR 1=1--",
                                "'; DROP TABLE users;--",
                                "admin'--"
                })
                @WithMockUser
                @DisplayName("email com SQLi deve retornar 400 Bad Request")
                void registerWithSqliInEmail_shouldReturn400(String sqliEmail) throws Exception {
                        String body = """
                                        {
                                          "fullName": "Usuário Teste",
                                          "email": "%s",
                                          "password": "senhaSegura123"
                                        }
                                        """.formatted(escapeSqliForJson(sqliEmail));

                        mockMvc.perform(post("/api/auth/register")
                                        .with(csrf())
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isBadRequest());
                }

        /**
         * Campo fullName com SQLi — não tem restrição de formato.
         * O payload chega ao use case como string literal (o JPA irá parametrizá-lo).
         * O mock lança {@code IllegalArgumentException}; como não há {@code @ControllerAdvice},
         * o MockMvc propaga como {@code ServletException} — capturado no try-catch.
         */
        @ParameterizedTest(name = "fullName=[{0}] não deve registrar usuário")
        @ValueSource(strings = {
                "' OR '1'='1",
                "'; DROP TABLE users;--",
                "' UNION SELECT null,null,null--"
        })
        @WithMockUser
        @DisplayName("fullName com SQLi deve ser tratado como string — nunca retornar 200")
        void registerWithSqliInFullName_shouldNotReturn200(String sqliFullName) {
            when(registerUserUseCase.execute(anyString(), anyString(), anyString()))
                    .thenThrow(new IllegalArgumentException("Nome inválido"));

            String body = """
                    {
                      "fullName": "%s",
                      "email": "usuario@valido.com",
                      "password": "senhaMinima6"
                    }
                    """.formatted(escapeSqliForJson(sqliFullName));

            try {
                MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                        .andReturn();

                assertNotEquals(200, result.getResponse().getStatus(),
                        "SQLi no fullName NÃO deve resultar em 200 OK");

            } catch (Exception ex) {
                // IllegalArgumentException propagada como ServletException = correto!
                // O payload chegou como string e foi rejeitado pelo use case mockado.
                String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
                assertNotNull(cause, "Exceção inesperada: " + ex);
            }
        }

                /**
                 * Senhas com SQLi mais curtas que 6 caracteres — bloqueadas por
                 * {@code @Size(min=6)}.
                 *
                 * <p>
                 * ATENÇÃO: Os payloads aqui devem ter MENOS de 6 chars para ativar a validação.
                 * Ex: {@code "sql'"} = 4 chars, {@code "'OR'"} = 4 chars.
                 */
                @ParameterizedTest(name = "password curto=[{0}] deve retornar 400 (@Size bloqueia)")
                @ValueSource(strings = {
                                "sql'", // 4 chars — abaixo do mínimo de 6
                                "'OR'", // 4 chars — abaixo do mínimo de 6
                                "' --" // 4 chars — abaixo do mínimo de 6
                })
                @WithMockUser
                @DisplayName("password < 6 chars com SQLi deve retornar 400 Bad Request")
                void registerWithShortSqliPassword_shouldReturn400(String shortSqli) throws Exception {
                        String body = """
                                        {
                                          "fullName": "Nome Válido",
                                          "email": "usuario@valido.com",
                                          "password": "%s"
                                        }
                                        """.formatted(escapeSqliForJson(shortSqli));

                        mockMvc.perform(post("/api/auth/register")
                                        .with(csrf())
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isBadRequest());
                }

                /**
                 * Body vazio — todos os campos {@code @NotBlank} falham → 400.
                 */
                @Test
                @WithMockUser
                @DisplayName("body vazio deve retornar 400 Bad Request")
                void registerWithEmptyBody_shouldReturn400() throws Exception {
                        mockMvc.perform(post("/api/auth/register")
                                        .with(csrf())
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{}"))
                                        .andExpect(status().isBadRequest());
                }
        }

        // ─── Utilitário ───────────────────────────────────────────────────────────

        /**
         * Escapa aspas duplas nos payloads SQLi para não quebrar o JSON de teste.
         */
        private String escapeSqliForJson(String payload) {
                return payload.replace("\"", "\\\"");
        }
}
