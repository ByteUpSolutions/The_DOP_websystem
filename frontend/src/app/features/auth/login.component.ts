import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { ToastService } from "../../shared/toast/toast.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
          Entrar
        </h2>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <input
            [(ngModel)]="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            [(ngModel)]="password"
            name="password"
            type="password"
            placeholder="Senha"
            required
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {{ loading() ? "Entrando..." : "Acessar" }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm">
          Não tem conta?
          <a
            routerLink="/register"
            class="text-blue-600 font-semibold hover:underline"
            >Crie agora</a
          >
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  email = "";
  password = "";
  loading = signal(false);

  onSubmit() {
    this.loading.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(["/dashboard"]); // Redirecionar para o dashboard após login
      },
      error: (err) => {
        this.toastService.show("Falha no login: " + (err.error?.message || "Verifique seus dados"), "error");
        this.loading.set(false);
      },
    });
  }
}
