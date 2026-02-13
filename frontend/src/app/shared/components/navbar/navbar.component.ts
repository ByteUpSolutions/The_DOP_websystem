
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <nav class="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between fixed top-0 w-full z-50">
      <!-- Logo / Brand -->
      <div class="flex items-center">
        <a routerLink="/dashboard" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            C
          </div>
          <span class="text-xl font-bold text-gray-800 hidden sm:block">Community App</span>
        </a>
      </div>

      <!-- Search Bar (Center) -->
      <div class="flex-1 max-w-2xl mx-4">
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            placeholder="Pesquisar no Community App"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          />
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-4">
        @if (currentUser(); as user) {
          <div class="relative">
            <button 
              (click)="toggleUserMenu()"
              class="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-md transition-colors focus:outline-none"
            >
              <div class="flex flex-col items-end hidden md:block">
                <span class="text-sm font-medium text-gray-700">{{ user.fullName }}</span>
                <span class="text-xs text-gray-500">Online</span>
              </div>
              <!-- Avatar Placeholder -->
              <div class="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {{ getInitials(user.fullName) }}
              </div>
              <svg class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="isUserMenuOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            @if (isUserMenuOpen()) {
              <div 
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-down" 
                (mouseleave)="isUserMenuOpen.set(false)"
              >
                <div class="px-4 py-2 border-b border-gray-100 md:hidden">
                  <p class="text-sm font-medium text-gray-900">{{ user.fullName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                </div>
                
                <a routerLink="/dashboard/profile" (click)="isUserMenuOpen.set(false)" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Meu Perfil
                </a>
                
                <button (click)="logout()" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sair
                </button>
              </div>
            }
          </div>
        }
      </div>
    </nav>
    <!-- Spacer for fixed navbar -->
    <div class="h-16"></div>
  `,
    styles: [`
    .animate-fade-in-down {
      animation: fadeInDown 0.2s ease-out;
    }
    @keyframes fadeInDown {
      0% {
        opacity: 0;
        transform: translateY(-10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class NavbarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    currentUser = this.authService.currentUser;
    searchQuery = '';
    isUserMenuOpen = signal(false);

    toggleUserMenu() {
        this.isUserMenuOpen.update((v: boolean) => !v);
    }

    logout() {
        this.authService.logout();
        this.isUserMenuOpen.set(false);
    }

    onSearch() {
        if (this.searchQuery.trim()) {
            // Implementar lógica de busca real ou navegação para página de resultados
            console.log('Searching for:', this.searchQuery);
            // Exemplo: this.router.navigate(['/dashboard/search'], { queryParams: { q: this.searchQuery } });
        }
    }

    getInitials(name: string | undefined): string {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
}
