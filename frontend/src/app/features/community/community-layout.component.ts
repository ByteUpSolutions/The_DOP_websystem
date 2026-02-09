import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { CommunityService } from '../../core/services/community.service';
import { Community } from '../../core/models/community.model';
import { ChatWindowComponent } from '../chat/chat-window.component';
import { FeedComponent } from './feed/feed.component';

@Component({
  selector: 'app-community-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ChatWindowComponent, FeedComponent],
  template: `
    <div class="p-4">
      @if (community()) {
        <header class="mb-4 border-b pb-4">
          <h1 class="text-3xl font-bold">{{ community()?.name }}</h1>
          <p class="text-gray-600">{{ community()?.description }}</p>
        </header>

        <div class="flex border-b mb-4">
          <button (click)="activeTab.set('feed')" 
                  [ngClass]="{'border-b-2 border-blue-600 text-blue-600': activeTab() === 'feed'}"
                  class="py-2 px-4 font-semibold text-gray-500 hover:text-blue-600 focus:outline-none">
            Feed
          </button>
          <button (click)="activeTab.set('chat')" 
                  [ngClass]="{'border-b-2 border-blue-600 text-blue-600': activeTab() === 'chat'}"
                  class="py-2 px-4 font-semibold text-gray-500 hover:text-blue-600 focus:outline-none">
            Chat
          </button>
        </div>

        <div>
          @if (activeTab() === 'feed') {
            <app-feed [communityId]="communityId()" />
          } @else if (activeTab() === 'chat') {
            <app-chat-window [communityId]="communityId()" />
          }
        </div>

      } @else {
        <p>Carregando comunidade...</p>
      }
    </div>
  `
})
export class CommunityLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private communityService = inject(CommunityService);

  communityId = signal<string>('');
  community = signal<Community | null>(null);
  activeTab = signal<'feed' | 'chat'>('feed');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.communityId.set(id);
      this.communityService.getCommunityById(id).subscribe(community => {
        this.community.set(community);
      });
    }
  }
}
