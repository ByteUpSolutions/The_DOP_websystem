import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
          Criar Conta
        </h2>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Nome Completo</label
            >
            <input
              [(ngModel)]="fullName"
              name="fullName"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              [(ngModel)]="email"
              name="email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Senha</label>
            <input
              [(ngModel)]="password"
              name="password"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {{ loading() ? "Criando..." : "Cadastrar" }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?
          <a routerLink="/login" class="text-blue-600 hover:text-blue-500"
            >Faça login</a
          >
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = "";
  email = "";
  password = "";
  loading = signal(false);

  onSubmit() {
    this.loading.set(true);
    this.authService.register(this.fullName, this.email, this.password).subscribe({
      next: () => {
        alert("Usuário criado com sucesso!");
        this.router.navigate(["/login"]); // Redireciona para o login após o registro
      },
      error: (err) => {
        alert(
          "Erro ao criar usuário: " +
            (err.error?.message || "Erro desconhecido"),
        );
        this.loading.set(false);
      },
    });
  }
}
