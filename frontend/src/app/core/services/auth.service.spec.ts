import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthTokens } from '../models/user.model';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    const mockAuthTokens: AuthTokens = {
        accessToken: 'mock-jwt-token',
        chatToken: 'mock-firebase-token',
        user: {
            id: 'user-id-123',
            fullName: 'Test User',
            email: 'test@example.com',
            role: 'USER',
            avatarUrl: null
        }
    };

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    describe('login()', () => {
        it('deve fazer POST para /api/auth/login e salvar tokens no localStorage', () => {
            service.login('test@example.com', 'password123').subscribe(tokens => {
                expect(tokens.accessToken).toBe('mock-jwt-token');
                expect(tokens.chatToken).toBe('mock-firebase-token');
            });

            const req = httpMock.expectOne('/api/auth/login');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password123' });
            req.flush(mockAuthTokens);

            expect(localStorage.getItem('accessToken')).toBe('mock-jwt-token');
            expect(localStorage.getItem('chatToken')).toBe('mock-firebase-token');
        });

        it('deve definir o sinal currentUser após o login', () => {
            service.login('test@example.com', 'password123').subscribe();

            const req = httpMock.expectOne('/api/auth/login');
            req.flush(mockAuthTokens);

            expect(service.currentUser()?.email).toBe('test@example.com');
            expect(service.currentUser()?.fullName).toBe('Test User');
        });
    });

    describe('logout()', () => {
        it('deve limpar tokens do localStorage e zerar os sinais', () => {
            // Simula estado logado
            localStorage.setItem('accessToken', 'some-token');
            localStorage.setItem('chatToken', 'some-firebase-token');
            localStorage.setItem('currentUser', JSON.stringify(mockAuthTokens.user));

            service.logout();

            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('chatToken')).toBeNull();
            expect(service.currentUser()).toBeNull();
            expect(service.accessToken()).toBeNull();
            expect(service.chatToken()).toBeNull();
        });
    });

    describe('isAuthenticated()', () => {
        it('deve retornar false quando não há accessToken', () => {
            expect(service.isAuthenticated()).toBeFalse();
        });

        it('deve retornar true quando accessToken está presente', () => {
            service.login('test@example.com', 'password123').subscribe();
            const req = httpMock.expectOne('/api/auth/login');
            req.flush(mockAuthTokens);

            expect(service.isAuthenticated()).toBeTrue();
        });
    });
});
