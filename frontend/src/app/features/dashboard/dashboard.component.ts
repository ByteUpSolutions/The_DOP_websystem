import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NavbarComponent],
  template: `
    <div class="flex flex-col h-screen bg-gray-100">
      <!-- Top Navbar -->
      <app-navbar></app-navbar>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-800 text-white flex flex-col">
          <!-- Navigation Links -->
          <nav class="flex-1 p-4 space-y-2 mt-4">
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
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-auto p-4">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  authService = inject(AuthService);
}
