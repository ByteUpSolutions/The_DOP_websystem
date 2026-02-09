import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Meu Perfil</h2>
      
      <div *ngIf="authService.currentUser() as user" class="bg-white p-6 rounded-lg shadow max-w-lg">
        <div class="flex items-center space-x-4 mb-6">
          <div class="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold uppercase">
            {{ user.fullName.charAt(0) }}
          </div>
          <div>
            <h3 class="text-xl font-semibold">{{ user.fullName }}</h3>
            <p class="text-gray-600">{{ user.email }}</p>
            <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
               {{ user.role }}
            </span>
          </div>
        </div>

        <div class="border-t pt-4">
          <h4 class="text-sm font-semibold text-gray-500 uppercase mb-2">Detalhes da Conta</h4>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div class="sm:col-span-1">
              <dt class="text-sm font-medium text-gray-500">ID do Usuário</dt>
              <dd class="mt-1 text-sm text-gray-900 break-all">{{ user.id }}</dd>
            </div>
            <div class="sm:col-span-1" *ngIf="user.avatarUrl">
                <dt class="text-sm font-medium text-gray-500">Avatar</dt>
                <dd class="mt-1"><img [src]="user.avatarUrl" class="w-8 h-8 rounded-full shadow-sm"></dd>
            </div>
          </dl>
        </div>
      </div>

      <div *ngIf="!authService.currentUser()" class="text-center text-red-500">
        Usuário não autenticado.
      </div>
    </div>
  `,
})
export class ProfileComponent {
  authService = inject(AuthService);
}
