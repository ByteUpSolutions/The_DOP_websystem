
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { Post, Comment, CommentNode } from '../../../core/models/post.model';
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
          <p class="text-sm text-gray-500 mb-4">Postado por {{ post()?.author?.fullName }}</p>
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
          
          <!-- Main Comment Form -->
          <form (ngSubmit)="submitComment()" class="mb-6">
            <textarea [(ngModel)]="newCommentContent" name="newCommentContent" rows="3" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Adicione um comentário..."></textarea>
            <button type="submit" class="mt-2 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Comentar</button>
          </form>

          <!-- Recursive Comments List -->
          <ng-container *ngTemplateOutlet="commentTemplate; context: { $implicit: rootComments() }"></ng-container>
          
          <ng-template #commentTemplate let-comments>
            @for (comment of comments; track comment.id) {
              <div class="mt-4" [ngClass]="{'pl-4 border-l-2 border-gray-100': comment.parentCommentId}">
                <div class="bg-gray-50 p-3 rounded">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs text-gray-500 font-semibold">{{ comment.author.fullName }} <span class="font-normal text-gray-400">• {{ comment.createdAt | date:'short' }}</span></p>
                            <p class="mt-1 text-gray-800">{{ comment.content }}</p>
                        </div>
                        <button (click)="setReplyingTo(comment)" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Responder</button>
                    </div>

                    <!-- Reply Form -->
                    @if (replyingTo()?.id === comment.id) {
                        <div class="mt-2 pl-2 border-l-2 border-blue-200">
                            <form (ngSubmit)="submitReply(comment.id)">
                                <textarea [(ngModel)]="replyContent" name="replyContent" rows="2" class="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Sua resposta..."></textarea>
                                <div class="flex space-x-2 mt-2">
                                    <button type="submit" class="py-1 px-3 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">Responder</button>
                                    <button type="button" (click)="setReplyingTo(null)" class="py-1 px-3 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    }
                </div>

                <!-- Children -->
                @if (comment.children.length > 0) {
                   <div class="ml-2">
                       <ng-container *ngTemplateOutlet="commentTemplate; context: { $implicit: comment.children }"></ng-container>
                   </div>
                }
              </div>
            } @empty {
                @if (!post()?.id) { 
                    <!-- Don't show empty message if rendering children or loading -->
                } @else {
                     @if (rootComments().length === 0) {
                        <p class="text-gray-500">Nenhum comentário ainda.</p>
                     }
                }
            }
          </ng-template>

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
  rootComments = signal<CommentNode[]>([]);
  replyingTo = signal<CommentNode | null>(null);

  newCommentContent = '';
  replyContent = '';

  ngOnInit(): void {
    this.loadPost();
  }

  loadPost() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.postService.getPostById(id).subscribe(details => {
        this.post.set(details.post);
        this.rootComments.set(this.buildCommentTree(details.comments));
      });
    }
  }

  buildCommentTree(comments: Comment[]): CommentNode[] {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    // First pass: create nodes
    comments.forEach(c => {
      map.set(c.id, { ...c, children: [] });
    });

    // Second pass: link children
    comments.forEach(c => {
      const node = map.get(c.id)!;
      if (c.parentCommentId) {
        const parent = map.get(c.parentCommentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // If parent not found (should not happen with consistent data), treat as root
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // Sort by Date (newest first for roots? oldest first for conversation flow?)
    // Typically comments are oldest first.
    return roots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  vote(type: 'UP' | 'DOWN') {
    const postId = this.post()?.id;
    if (postId) {
      this.postService.voteOnPost(postId, type).subscribe({
        next: (updatedPost) => {
          this.post.set(updatedPost);
        },
        error: (_err) => {
        }
      });
    }
  }

  submitComment() {
    const postId = this.post()?.id;
    if (postId && this.newCommentContent.trim()) {
      this.postService.createComment(postId, this.newCommentContent).subscribe(() => {
        this.toastService.show('Comentário adicionado!', 'success');
        this.newCommentContent = '';
        this.loadPost();
      });
    }
  }

  setReplyingTo(comment: CommentNode | null) {
    this.replyingTo.set(comment);
    this.replyContent = '';
  }

  submitReply(parentCommentId: string) {
    const postId = this.post()?.id;
    if (postId && this.replyContent.trim()) {
      this.postService.createComment(postId, this.replyContent, parentCommentId).subscribe(() => {
        this.toastService.show('Resposta enviada!', 'success');
        this.replyingTo.set(null);
        this.loadPost();
      });
    }
  }
}
