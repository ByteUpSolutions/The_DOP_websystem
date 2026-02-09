import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-800 text-white flex flex-col">
        <div class="p-4 text-2xl font-bold border-b border-gray-700">
          Community App
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <a routerLink="/dashboard/communities" routerLinkActive="bg-gray-700" class="block px-4 py-2 rounded hover:bg-gray-700">
            Comunidades
          </a>
          <a routerLink="/dashboard/my-communities" routerLinkActive="bg-gray-700" class="block px-4 py-2 rounded hover:bg-gray-700">
            Minhas Comunidades
          </a>
          <a routerLink="/dashboard/create-community" routerLinkActive="bg-gray-700" class="block px-4 py-2 rounded hover:bg-gray-700">
            Criar Comunidade
          </a>
          <a routerLink="/dashboard/profile" routerLinkActive="bg-gray-700" class="block px-4 py-2 rounded hover:bg-gray-700">
            Meu Perfil
          </a>
        </nav>
        <div class="p-4 border-t border-gray-700">
          <button (click)="logout()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Sair
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-white shadow p-4 flex justify-between items-center">
          <h1 class="text-xl font-semibold text-gray-800">Dashboard</h1>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Bem-vindo, {{ authService.currentUser()?.fullName || 'Usuário' }}</span>
          </div>
        </header>
        <div class="flex-1 overflow-auto p-4">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    // Redirecionar para a página de login
    // (A rota de login deve ser configurada no app.routes.ts)
  }
}
