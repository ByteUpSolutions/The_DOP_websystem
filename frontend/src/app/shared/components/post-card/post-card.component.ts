import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../core/models/post.model';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white shadow rounded-lg p-4 mb-4">
      <div class="flex items-center mb-2">
        <span class="text-sm text-gray-500">Postado por {{ post.author.fullName }}</span>
      </div>
      <h3 class="text-xl font-bold mb-2">
        <a [routerLink]="['/dashboard/post', post.id]" class="hover:underline">{{ post.title }}</a>
      </h3>
      <p class="text-gray-700 mb-4">{{ post.content | slice:0:200 }}...</p>
      <div class="flex items-center text-gray-500">
        <button (click)="vote('UP')" class="flex items-center space-x-1 hover:text-green-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
          <span>{{ post.upvotes }}</span>
        </button>
        <button (click)="vote('DOWN')" class="flex items-center space-x-1 ml-4 hover:text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          <span>{{ post.downvotes }}</span>
        </button>
        <a [routerLink]="['/dashboard/post', post.id]" class="flex items-center space-x-1 ml-4 hover:text-blue-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.54 15.253 3 13.683 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          <span>Comentários</span>
        </a>
      </div>
    </div>
  `
})
export class PostCardComponent {
  @Input() post!: Post;
  private postService = inject(PostService);

  vote(type: 'UP' | 'DOWN') {
    this.postService.voteOnPost(this.post.id, type).subscribe({
      next: (updatedPost: Post) => {
        this.post = updatedPost;
      },
      error: (error: unknown) => {
        console.error('Error voting on post:', error);
      }
    });
  }
}
