import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { CommunityService } from './community.service';

/**
 * Testes de SQL Injection — CommunityService
 *
 * Verifica que payloads SQLi inseridos nos campos de nome e descrição
 * de comunidades são enviados ao backend corretamente e que respostas
 * de erro são propagadas sem causar falhas silenciosas no frontend.
 */

const SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1--",
    "'; DROP TABLE communities;--",
    "' UNION SELECT id, name, description FROM communities--",
    "admin'--",
    "'; UPDATE communities SET name='hacked' WHERE '1'='1';--",
    "' AND 1=0 UNION ALL SELECT null,null,null--",
];

describe('[Segurança] CommunityService — SQL Injection', () => {
    let service: CommunityService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunityService],
        });
        service = TestBed.inject(CommunityService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    // ─── createCommunity: campo name ──────────────────────────────────────────

    describe('createCommunity() — campo name com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar name=[${payload}] ao backend e propagar erro 400`, () => {
                let errorReceived = false;

                service
                    .createCommunity(payload, 'Descrição normal', false)
                    .subscribe({ error: () => (errorReceived = true) });

                const req = httpMock.expectOne('/api/communities');
                expect(req.request.method).toBe('POST');
                // O payload deve ser enviado sem modificação ao backend
                expect(req.request.body).toEqual({
                    name: payload,
                    description: 'Descrição normal',
                    isPrivate: false,
                });

                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
            });
        });
    });

    // ─── createCommunity: campo description ───────────────────────────────────

    describe('createCommunity() — campo description com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar description=[${payload}] ao backend e propagar erro 400`, () => {
                let errorReceived = false;

                service
                    .createCommunity('Comunidade Válida', payload, false)
                    .subscribe({ error: () => (errorReceived = true) });

                const req = httpMock.expectOne('/api/communities');
                expect(req.request.body).toEqual({
                    name: 'Comunidade Válida',
                    description: payload,
                    isPrivate: false,
                });

                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
            });
        });
    });

    // ─── Caso crítico: DROP TABLE com name e description ─────────────────────

    it('não deve provocar 500 ao enviar payload DROP TABLE nos dois campos', () => {
        const payload = "'; DROP TABLE communities;--";
        let errorStatus: number | undefined;

        service
            .createCommunity(payload, payload, true)
            .subscribe({
                error: (err) => {
                    errorStatus = err.status;
                },
            });

        const req = httpMock.expectOne('/api/communities');
        req.flush(
            { message: 'Dados inválidos' },
            { status: 400, statusText: 'Bad Request' }
        );

        // 500 indicaria que o payload "chegou no banco" sem ser tratado
        expect(errorStatus).not.toBe(500);
        expect(errorStatus).toBe(400);
    });

    // ─── Rotas com UUID — path variable injection ─────────────────────────────

    it('getCommunityById() deve enviar o ID exato para o endpoint (sem sanitização de path)', () => {
        // UUIDs são validados pelo tipo UUID do Spring — não há risco real mas documentamos o comportamento
        const validUuid = '7c9e6679-7425-40de-944b-e07fc1f90ae1';

        service.getCommunityById(validUuid).subscribe();

        const req = httpMock.expectOne(`/api/communities/${validUuid}`);
        expect(req.request.method).toBe('GET');
        req.flush({ id: validUuid, name: 'Test', description: 'Test', isPrivate: false });
    });

    it('getAllCommunities() deve fazer GET em /api/communities sem parâmetros', () => {
        service.getAllCommunities().subscribe();
        const req = httpMock.expectOne('/api/communities');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });
});
