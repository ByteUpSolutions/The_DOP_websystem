import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PostCardComponent } from './post-card.component';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { of } from 'rxjs';

describe('PostCardComponent', () => {
    let component: PostCardComponent;
    let fixture: ComponentFixture<PostCardComponent>;
    let postServiceSpy: jasmine.SpyObj<PostService>;

    const mockPost: Post = {
        id: 'post-id-123',
        title: 'Título do Post de Teste',
        content: 'Conteúdo do post para teste unitário.',
        author: {
            id: 'user-id',
            fullName: 'Autor Teste',
            email: 'autor@test.com',
            role: 'USER',
            avatarUrl: null
        },
        communityId: 'community-id',
        upvotes: 5,
        downvotes: 1,
        createdAt: new Date().toISOString()
    } as any;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('PostService', ['voteOnPost']);

        await TestBed.configureTestingModule({
            imports: [PostCardComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: PostService, useValue: spy }]
        }).compileComponents();

        postServiceSpy = TestBed.inject(PostService) as jasmine.SpyObj<PostService>;
        fixture = TestBed.createComponent(PostCardComponent);
        component = fixture.componentInstance;
        component.post = mockPost;
        fixture.detectChanges();
    });

    it('deve ser criado sem erros', () => {
        expect(component).toBeTruthy();
    });

    it('deve exibir o título do post', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Título do Post de Teste');
    });

    it('deve exibir o nome do autor', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Autor Teste');
    });

    it('deve chamar voteOnPost com tipo UP ao clicar no botão de upvote', () => {
        postServiceSpy.voteOnPost.and.returnValue(of({ ...mockPost, upvotes: 6 } as any));

        component.vote('UP');

        expect(postServiceSpy.voteOnPost).toHaveBeenCalledWith('post-id-123', 'UP');
    });

    it('deve chamar voteOnPost com tipo DOWN ao clicar no botão de downvote', () => {
        postServiceSpy.voteOnPost.and.returnValue(of({ ...mockPost, downvotes: 2 } as any));

        component.vote('DOWN');

        expect(postServiceSpy.voteOnPost).toHaveBeenCalledWith('post-id-123', 'DOWN');
    });
});
