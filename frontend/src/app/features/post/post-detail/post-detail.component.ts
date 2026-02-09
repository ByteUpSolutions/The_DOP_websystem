'''
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { Post, Comment } from '../../../core/models/post.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      @if (post()) {
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h1 class="text-3xl font-bold mb-2">{{ post()?.title }}</h1>
          <p class="text-sm text-gray-500 mb-4">Postado por {{ post()?.author.fullName }}</p>
          <p class="text-gray-800">{{ post()?.content }}</p>
          <div class="flex items-center text-gray-500 mt-4">
            <button (click)="vote('UP')" class="flex items-center space-x-1 hover:text-green-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
              <span>{{ post()?.upvotes }}</span>
            </button>
            <button (click)="vote('DOWN')" class="flex items-center space-x-1 ml-4 hover:text-red-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              <span>{{ post()?.downvotes }}</span>
            </button>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4">Comentários</h2>
          <form (ngSubmit)="submitComment()" class="mb-6">
            <textarea [(ngModel)]="newCommentContent" name="newCommentContent" rows="3" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Adicione um comentário..."></textarea>
            <button type="submit" class="mt-2 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Comentar</button>
          </form>

          @for (comment of comments(); track comment.id) {
            <div class="border-t py-4">
              <p class="text-sm text-gray-500">{{ comment.author.fullName }}</p>
              <p>{{ comment.content }}</p>
            </div>
          } @empty {
            <p>Nenhum comentário ainda.</p>
          }
        </div>

      } @else {
        <p>Carregando post...</p>
      }
    </div>
  `
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private toastService = inject(ToastService);

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  newCommentContent = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.postService.getPostById(id).subscribe(details => {
        this.post.set(details.post);
        this.comments.set(details.comments);
      });
    }
  }

  vote(type: 'UP' | 'DOWN') {
    const postId = this.post()?.id;
    if (postId) {
      this.postService.voteOnPost(postId, type).subscribe(() => {
        // Optimistic UI update
        this.post.update(p => {
            if (!p) return null;
            if (type === 'UP') p.upvotes++;
            if (type === 'DOWN') p.downvotes++;
            return p;
        });
      });
    }
  }

  submitComment() {
    const postId = this.post()?.id;
    if (postId && this.newCommentContent.trim()) {
      this.postService.createComment(postId, this.newCommentContent).subscribe(() => {
        this.toastService.show('Comentário adicionado!', 'success');
        this.newCommentContent = '';
        // Refresh comments
        this.postService.getPostById(postId).subscribe(details => this.comments.set(details.comments));
      });
    }
  }
}
'''
