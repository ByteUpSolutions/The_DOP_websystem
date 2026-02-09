'''
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Criar Novo Post</h2>
      <form (ngSubmit)="onSubmit()" class="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Título</label>
          <input
            id="title"
            type="text"
            [(ngModel)]="title"
            name="title"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700">Conteúdo</label>
          <textarea
            id="content"
            [(ngModel)]="content"
            name="content"
            rows="5"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <button
          type="submit"
          [disabled]="loading()"
          class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading() ? 'Publicando...' : 'Publicar Post' }}
        </button>
      </form>
    </div>
  `
})
export class CreatePostComponent {
  private postService = inject(PostService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  title = '';
  content = '';
  loading = signal(false);
  communityId: string | null = null;

  ngOnInit() {
    this.communityId = this.route.snapshot.paramMap.get('communityId');
  }

  onSubmit(): void {
    if (!this.communityId) {
        this.toastService.show('ID da comunidade não encontrado!', 'error');
        return;
    }
    this.loading.set(true);
    this.postService.createPost(this.communityId, this.title, this.content).subscribe({
      next: (post) => {
        this.toastService.show('Post criado com sucesso!', 'success');
        this.router.navigate(['/dashboard/post', post.id]);
      },
      error: (err) => {
        this.toastService.show('Falha ao criar post: ' + (err.error?.message || 'Erro desconhecido'), 'error');
        this.loading.set(false);
      },
    });
  }
}
'''
