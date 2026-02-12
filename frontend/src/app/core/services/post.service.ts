import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = '/api';
  private http = inject(HttpClient);

  getPostsByCommunity(communityId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/communities/${communityId}/posts`);
  }

  getPostById(postId: string): Observable<any> { // Ajustar para o modelo de PostDetails
    return this.http.get<any>(`${this.apiUrl}/posts/${postId}`);
  }

  createPost(communityId: string, title: string, content: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/communities/${communityId}/posts`, { title, content });
  }

  createComment(postId: string, content: string, parentCommentId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/comments`, { content, parentCommentId });
  }

  voteOnPost(postId: string, type: 'UP' | 'DOWN'): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts/${postId}/vote`, { type });
  }
}
