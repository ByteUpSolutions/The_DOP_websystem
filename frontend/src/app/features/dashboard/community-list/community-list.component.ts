import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../core/services/community.service';
import { Community, Membership } from '../../../core/models/community.model';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-community-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Todas as Comunidades</h2>
      <div *ngIf="loading()" class="text-center text-gray-500">Carregando comunidades...</div>
      <div *ngIf="error()" class="text-center text-red-500">{{ error() }}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let community of communities()" class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-xl font-semibold">{{ community.name }}</h3>
          <p class="text-gray-600">{{ community.description }}</p>
          <button *ngIf="!isMember(community.id)" (click)="joinCommunity(community.id)" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Entrar
          </button>
          <a *ngIf="isMember(community.id)" [routerLink]="['/dashboard/community', community.id]" class="mt-2 inline-block bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded cursor-pointer">
            Abrir
          </a>
        </div>
      </div>
      <div *ngIf="communities().length === 0 && !loading() && !error()" class="text-center text-gray-500">
        Nenhuma comunidade encontrada.
      </div>
    </div>
  `,
})
export class CommunityListComponent implements OnInit {
  private communityService = inject(CommunityService);

  communities = signal<Community[]>([]);
  myCommunityIds = signal<Set<string>>(new Set());
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCommunities();
    this.loadMyCommunities();
  }

  loadCommunities(): void {
    this.loading.set(true);
    this.error.set(null);
    this.communityService.getAllCommunities().subscribe({
      next: (data: Community[]) => {
        this.communities.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Falha ao carregar comunidades: ' + (err.error?.message || 'Erro desconhecido'));
        this.loading.set(false);
      },
    });
  }

  loadMyCommunities(): void {
    this.communityService.getMyCommunities().subscribe({
      next: (memberships: Membership[]) => {
        const ids = new Set(memberships.map((m: Membership) => m.community.id));
        this.myCommunityIds.set(ids);
      },
      error: (err: any) => console.error('Erro ao carregar minhas comunidades', err)
    });
  }

  isMember(communityId: string): boolean {
    return this.myCommunityIds().has(communityId);
  }

  joinCommunity(communityId: string): void {
    this.communityService.joinCommunity(communityId).subscribe({
      next: () => {
        alert('Você entrou na comunidade!');
        alert('Você entrou na comunidade!');
        this.loadMyCommunities(); // Atualiza a lista de memberships
        this.loadCommunities(); // Recarregar a lista para atualizar o estado
      },
      error: (err) => {
        alert('Falha ao entrar na comunidade: ' + (err.error?.message || 'Erro desconhecido'));
      },
    });
  }
}
