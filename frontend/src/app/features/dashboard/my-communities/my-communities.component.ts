import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../core/services/community.service';
import { Membership } from '../../../core/models/community.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-communities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Minhas Comunidades</h2>
      <div *ngIf="loading()" class="text-center text-gray-500">Carregando suas comunidades...</div>
      <div *ngIf="error()" class="text-center text-red-500">{{ error() }}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let membership of memberships()" class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-xl font-semibold">{{ membership.community.name }}</h3>
          <p class="text-gray-600">{{ membership.community.description }}</p>
          <div class="mt-4 flex justify-between items-center">
             <span class="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
               {{ membership.role }}
             </span>
             <div class="space-x-2">
                <a [routerLink]="['/dashboard/chat', membership.community.id]" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Chat
                </a>
                <button (click)="leaveCommunity(membership.community.id)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                  Sair
                </button>
             </div>
          </div>
        </div>
      </div>
      <div *ngIf="memberships().length === 0 && !loading() && !error()" class="text-center text-gray-500">
        Você não faz parte de nenhuma comunidade.
      </div>
    </div>
  `,
})
export class MyCommunitiesComponent implements OnInit {
  private communityService = inject(CommunityService);

  memberships = signal<Membership[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadMyCommunities();
  }

  loadMyCommunities(): void {
    this.loading.set(true);
    this.error.set(null);
    this.communityService.getMyCommunities().subscribe({
      next: (data) => {
        this.memberships.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Falha ao carregar suas comunidades: ' + (err.error?.message || 'Erro desconhecido'));
        this.loading.set(false);
      },
    });
  }

  leaveCommunity(communityId: string): void {
    this.communityService.leaveCommunity(communityId).subscribe({
      next: () => {
        alert('Você saiu da comunidade!');
        this.loadMyCommunities(); // Recarregar a lista para atualizar o estado
      },
      error: (err) => {
        alert('Falha ao sair da comunidade: ' + (err.error?.message || 'Erro desconhecido'));
      },
    });
  }
}
