import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div>
      <h2 class="text-2xl font-bold mb-4">Feed da Comunidade</h2>
      @for (post of posts(); track post.id) {
        <app-post-card [post]="post" />
      } @empty {
        <p>Nenhum post encontrado.</p>
      }
    </div>
  `
})
export class FeedComponent implements OnInit {
  @Input() communityId!: string;
  private postService = inject(PostService);
  posts = signal<Post[]>([]);

  ngOnInit(): void {
    if (this.communityId) {
      this.postService.getPostsByCommunity(this.communityId).subscribe(posts => {
        this.posts.set(posts);
      });
    }
  }
}
