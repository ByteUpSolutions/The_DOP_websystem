import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { PostService } from './post.service';

/**
 * Testes de SQL Injection — PostService
 *
 * Verifica que payloads de SQLi inseridos nos campos de texto de posts
 * e comentários são enviados corretamente ao backend e que respostas de
 * erro do servidor são propagadas adequadamente para a UI tratar.
 */

const SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1--",
    "'; DROP TABLE posts;--",
    "'; DROP TABLE comments;--",
    "' UNION SELECT id, content, null FROM posts--",
    "<script>alert('xss')</script>",  // XSS embutido junto a SQLi
    "1'; INSERT INTO posts(title) VALUES('hacked');--",
];

const VALID_COMMUNITY_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_POST_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae1';

describe('[Segurança] PostService — SQL Injection', () => {
    let service: PostService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PostService],
        });
        service = TestBed.inject(PostService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    // ─── createPost: título ────────────────────────────────────────────────────

    describe('createPost() — campo title com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar title=[${payload}] e propagar erro 400 do backend`, () => {
                let errorReceived = false;

                service
                    .createPost(VALID_COMMUNITY_ID, payload, 'Conteúdo normal')
                    .subscribe({ error: () => (errorReceived = true) });

                const req = httpMock.expectOne(
                    `/api/communities/${VALID_COMMUNITY_ID}/posts`
                );
                expect(req.request.method).toBe('POST');
                // Verificação principal: o payload deve chegar ao backend sem alteração
                expect(req.request.body).toEqual({
                    title: payload,
                    content: 'Conteúdo normal',
                });

                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
            });
        });
    });

    // ─── createPost: conteúdo ─────────────────────────────────────────────────

    describe('createPost() — campo content com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar content=[${payload}] e propagar erro 400 do backend`, () => {
                let errorReceived = false;

                service
                    .createPost(VALID_COMMUNITY_ID, 'Título Normal', payload)
                    .subscribe({ error: () => (errorReceived = true) });

                const req = httpMock.expectOne(
                    `/api/communities/${VALID_COMMUNITY_ID}/posts`
                );
                expect(req.request.body).toEqual({
                    title: 'Título Normal',
                    content: payload,
                });

                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
            });
        });
    });

    // ─── createComment: conteúdo ──────────────────────────────────────────────

    describe('createComment() — campo content com payloads SQLi', () => {
        SQL_INJECTION_PAYLOADS.forEach((payload) => {
            it(`deve enviar content=[${payload}] no comentário e propagar erro 400`, () => {
                let errorReceived = false;

                service
                    .createComment(VALID_POST_ID, payload)
                    .subscribe({ error: () => (errorReceived = true) });

                const req = httpMock.expectOne(`/api/posts/${VALID_POST_ID}/comments`);
                expect(req.request.method).toBe('POST');
                // parentCommentId deve ser undefined (não enviado) quando não informado
                expect(req.request.body).toEqual({
                    content: payload,
                    parentCommentId: undefined,
                });

                req.flush(
                    { message: 'Dados inválidos' },
                    { status: 400, statusText: 'Bad Request' }
                );

                expect(errorReceived).toBeTrue();
            });
        });
    });

    // ─── createComment com parentCommentId de SQLi ────────────────────────────

    it('deve enviar parentCommentId com payload SQLi e propagar erro 400', () => {
        const sqliId = "' OR '1'='1";
        let errorReceived = false;

        service
            .createComment(VALID_POST_ID, 'Comentário válido', sqliId)
            .subscribe({ error: () => (errorReceived = true) });

        const req = httpMock.expectOne(`/api/posts/${VALID_POST_ID}/comments`);
        expect(req.request.body).toEqual({
            content: 'Comentário válido',
            parentCommentId: sqliId,
        });

        req.flush(
            { message: 'ID inválido' },
            { status: 400, statusText: 'Bad Request' }
        );

        expect(errorReceived).toBeTrue();
    });

    // ─── Caso: ambos os campos com SQLi ───────────────────────────────────────

    it('deve enviar title e content com SQLi e não causar 500 (Backend deve retornar 400)', () => {
        const sqliPayload = "'; DROP TABLE posts;--";
        let errorReceived = false;

        service
            .createPost(VALID_COMMUNITY_ID, sqliPayload, sqliPayload)
            .subscribe({
                error: (err) => {
                    // O código de status NÃO deve ser 500 (Internal Server Error)
                    expect(err.status).not.toBe(500);
                    expect(err.status).toBe(400);
                    errorReceived = true;
                }
            });

        const req = httpMock.expectOne(
            `/api/communities/${VALID_COMMUNITY_ID}/posts`
        );
        req.flush(
            { message: 'Dados inválidos' },
            { status: 400, statusText: 'Bad Request' }
        );

        expect(errorReceived).toBeTrue();
    });
});
