import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Create Post Form -->
      <div class="bg-white p-4 rounded-lg shadow space-y-4">
        <input 
          [(ngModel)]="newPostTitle" 
          placeholder="Título do post"
          class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <textarea 
          [(ngModel)]="newPostContent" 
          placeholder="No que você está pensando?"
          class="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        ></textarea>
        <div class="flex justify-end">
          <button 
            (click)="createPost()"
            [disabled]="!newPostTitle || !newPostContent"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publicar
          </button>
        </div>
      </div>

      <!-- Feed Header -->
      <h2 class="text-2xl font-bold mb-4">Feed da Comunidade</h2>

      <!-- Post List -->
      @for (post of posts(); track post.id) {
        <app-post-card [post]="post" />
      } @empty {
        <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>Nenhum post encontrado. Seja o primeiro a publicar!</p>
        </div>
      }
    </div>
  `
})
export class FeedComponent implements OnInit {
  @Input() communityId!: string;
  private postService = inject(PostService);
  posts = signal<Post[]>([]);

  newPostContent = '';
  newPostTitle = '';

  createPost() {
    if (!this.newPostTitle || !this.newPostContent) return;

    this.postService.createPost(this.communityId, this.newPostTitle, this.newPostContent)
      .subscribe((newPost: Post) => {
        this.posts.update((posts: Post[]) => [newPost, ...posts]);
        this.newPostTitle = '';
        this.newPostContent = '';
      });
  }

  ngOnInit(): void {
    if (this.communityId) {
      this.loadPosts();
    }
  }

  loadPosts() {
    this.postService.getPostsByCommunity(this.communityId).subscribe(posts => {
      this.posts.set(posts);
    });
  }
}
