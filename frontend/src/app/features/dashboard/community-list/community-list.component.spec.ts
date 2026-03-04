import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunityListComponent } from './community-list.component';
import { CommunityService } from '../../../core/services/community.service';
import { Community } from '../../../core/models/community.model';
import { of } from 'rxjs';

describe('CommunityListComponent', () => {
    let component: CommunityListComponent;
    let fixture: ComponentFixture<CommunityListComponent>;
    let communityServiceSpy: jasmine.SpyObj<CommunityService>;

    const mockCommunities: Community[] = [
        { id: 'c1', name: 'Dev Talk', description: 'Comunidade de devs' } as Community,
        { id: 'c2', name: 'Angular Brasil', description: 'Angular em português' } as Community
    ];

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('CommunityService', [
            'getAllCommunities',
            'getMyCommunities',
            'joinCommunity'
        ]);
        spy.getAllCommunities.and.returnValue(of(mockCommunities));
        spy.getMyCommunities.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [CommunityListComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: CommunityService, useValue: spy }]
        }).compileComponents();

        communityServiceSpy = TestBed.inject(CommunityService) as jasmine.SpyObj<CommunityService>;
        fixture = TestBed.createComponent(CommunityListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('deve ser criado sem erros', () => {
        expect(component).toBeTruthy();
    });

    it('deve carregar e exibir a lista de comunidades ao inicializar', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Dev Talk');
        expect(compiled.textContent).toContain('Angular Brasil');
    });

    it('deve exibir "Carregando comunidades..." quando loading() é true', () => {
        component.loading.set(true);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Carregando comunidades...');
    });

    it('deve exibir botão "Entrar" para comunidades onde o usuário não é membro', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const buttons = compiled.querySelectorAll('button');
        const joinButton = Array.from(buttons).find(b => b.textContent?.trim() === 'Entrar');
        expect(joinButton).toBeTruthy();
    });

    it('deve chamar isMember() e retornar false para comunidade não associada', () => {
        expect(component.isMember('c1')).toBeFalse();
    });
});
