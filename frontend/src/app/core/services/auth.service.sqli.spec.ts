import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';

/**
 * Testes de SQL Injection — AuthService
 *
 * Objetivo: verificar que o serviço de autenticação envia os payloads
 * para o backend sem modificá-los (comportamento correto) e que,
 * quando o backend retorna um erro apropriado (401/400), nenhum token
 * inválido é persistido no estado local da aplicação.
 *
 * NOTA DE SEGURANÇA: O backend usa Spring Data JPA com prepared statements
 * parametrizados. Os payloads abaixo NÃO causam SQL Injection real;
 * estes testes documentam que o sistema os trata corretamente.
 */

const SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1--",
    "'; DROP TABLE users;--",
    "' UNION SELECT null,null,null--",
    "admin'--",
    "1' OR '1'='1' /*",
    '" OR "1"="1',
    "' OR ''='",
];

describe('[Segurança] AuthService — SQL Injection', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService],
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    // ─── Login: campo email ────────────────────────────────────────────────────

    describe('login() — campo email com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar o payload [${payload}] ao backend e não persistir tokens ao receber 401`, () => {
                let errorReceived = false;

                service.login(payload, 'senha_segura').subscribe({
                    error: () => {
                        errorReceived = true;
                    },
                });

                const req = httpMock.expectOne('/api/auth/login');
                expect(req.request.method).toBe('POST');
                // O frontend deve enviar o payload exato — sem sanitização — ao backend
                expect(req.request.body).toEqual({
                    email: payload,
                    password: 'senha_segura',
                });

                // Simula o backend rejeitando a tentativa com 401 Unauthorized
                req.flush(
                    { message: 'Credenciais inválidas' },
                    { status: 401, statusText: 'Unauthorized' }
                );

                // Nenhum token deve ser armazenado após uma resposta de erro
                expect(localStorage.getItem('accessToken')).toBeNull();
                expect(localStorage.getItem('chatToken')).toBeNull();
                expect(service.accessToken()).toBeNull();
                expect(service.currentUser()).toBeNull();
                expect(errorReceived).toBeTrue();
            });
        });
    });

    // ─── Login: campo password ─────────────────────────────────────────────────

    describe('login() — campo password com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar o payload [${payload}] ao backend e não persistir tokens ao receber 401`, () => {
                let errorReceived = false;

                service.login('usuario@valido.com', payload).subscribe({
                    error: () => {
                        errorReceived = true;
                    },
                });

                const req = httpMock.expectOne('/api/auth/login');
                expect(req.request.method).toBe('POST');
                expect(req.request.body).toEqual({
                    email: 'usuario@valido.com',
                    password: payload,
                });

                req.flush(
                    { message: 'Credenciais inválidas' },
                    { status: 401, statusText: 'Unauthorized' }
                );

                expect(localStorage.getItem('accessToken')).toBeNull();
                expect(service.accessToken()).toBeNull();
                expect(errorReceived).toBeTrue();
            });
        });
    });

    // ─── Register: campos fullName / email / password ──────────────────────────

    describe('register() — campos com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar fullName=[${payload}] ao backend e propagar erro 400`, () => {
                let errorReceived = false;

                service.register(payload, 'usuario@valido.com', 'senhaSegura123').subscribe({
                    error: () => {
                        errorReceived = true;
                    },
                });

                const req = httpMock.expectOne('/api/auth/register');
                expect(req.request.method).toBe('POST');
                expect(req.request.body).toEqual({
                    fullName: payload,
                    email: 'usuario@valido.com',
                    password: 'senhaSegura123',
                });

                // Simula o backend rejeitando o payload com 400 Bad Request
                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
                // Nenhum efeito colateral de autenticação deve ocorrer
                expect(service.accessToken()).toBeNull();
                expect(service.currentUser()).toBeNull();
            });

            it(`deve enviar email=[${payload}] ao backend e propagar erro 400`, () => {
                let errorReceived = false;

                service.register('Nome Válido', payload, 'senhaSegura123').subscribe({
                    error: () => {
                        errorReceived = true;
                    },
                });

                const req = httpMock.expectOne('/api/auth/register');
                expect(req.request.body).toEqual({
                    fullName: 'Nome Válido',
                    email: payload,
                    password: 'senhaSegura123',
                });

                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
            });

            it(`deve enviar password=[${payload}] ao backend e propagar erro 400`, () => {
                let errorReceived = false;

                service.register('Nome Válido', 'usuario@valido.com', payload).subscribe({
                    error: () => {
                        errorReceived = true;
                    },
                });

                const req = httpMock.expectOne('/api/auth/register');
                expect(req.request.body).toEqual({
                    fullName: 'Nome Válido',
                    email: 'usuario@valido.com',
                    password: payload,
                });

                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
                expect(service.accessToken()).toBeNull();
            });
        });
    });

    // ─── Caso de bypass total ──────────────────────────────────────────────────

    it('não deve autenticar usuário com payload SQLi clássico de bypass no email', () => {
        const bypassPayload = "' OR '1'='1";
        let successCalled = false;
        let errorCalled = false;

        service.login(bypassPayload, bypassPayload).subscribe({
            next: () => {
                successCalled = true;
            },
            error: () => {
                errorCalled = true;
            },
        });

        const req = httpMock.expectOne('/api/auth/login');
        // O backend (Spring Data JPA) recusa o payload — simula 401
        req.flush(
            { message: 'Credenciais inválidas' },
            { status: 401, statusText: 'Unauthorized' }
        );

        expect(successCalled).toBeFalse();
        expect(errorCalled).toBeTrue();
        expect(service.isAuthenticated()).toBeFalse();
    });
});
