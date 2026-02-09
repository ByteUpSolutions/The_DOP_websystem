import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../core/services/community.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Criar Nova Comunidade</h2>
      <form (ngSubmit)="onSubmit()" class="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nome da Comunidade</label>
          <input
            id="name"
            type="text"
            [(ngModel)]="name"
            name="name"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            id="description"
            [(ngModel)]="description"
            name="description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div class="flex items-center">
          <input
            id="isPrivate"
            type="checkbox"
            [(ngModel)]="isPrivate"
            name="isPrivate"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="isPrivate" class="ml-2 block text-sm text-gray-900">Comunidade Privada</label>
        </div>
        <button
          type="submit"
          [disabled]="loading()"
          class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading() ? 'Criando...' : 'Criar Comunidade' }}
        </button>
      </form>
    </div>
  `,
})
export class CreateCommunityComponent {
  private communityService = inject(CommunityService);
  private router = inject(Router);

  name = '';
  description = '';
  isPrivate = false;
  loading = signal(false);

  onSubmit(): void {
    this.loading.set(true);
    this.communityService.createCommunity(this.name, this.description, this.isPrivate).subscribe({
      next: () => {
        alert('Comunidade criada com sucesso!');
        this.router.navigate(['/dashboard/my-communities']);
      },
      error: (err) => {
        alert('Falha ao criar comunidade: ' + (err.error?.message || 'Erro desconhecido'));
        this.loading.set(false);
      },
    });
  }
}
