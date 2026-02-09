import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthTokens, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  currentUser = signal<User | null>(null);
  accessToken = signal<string | null>(null);
  chatToken = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadTokens();
  }

  private loadTokens(): void {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedChatToken = localStorage.getItem('chatToken');
    const storedUser = localStorage.getItem('currentUser');

    if (storedAccessToken && storedChatToken && storedUser) {
      this.accessToken.set(storedAccessToken);
      this.chatToken.set(storedChatToken);
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  private saveTokens(authTokens: AuthTokens): void {
    localStorage.setItem('accessToken', authTokens.accessToken);
    localStorage.setItem('chatToken', authTokens.chatToken);
    localStorage.setItem('currentUser', JSON.stringify(authTokens.user));
    this.accessToken.set(authTokens.accessToken);
    this.chatToken.set(authTokens.chatToken);
    this.currentUser.set(authTokens.user);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('chatToken');
    localStorage.removeItem('currentUser');
    this.accessToken.set(null);
    this.chatToken.set(null);
    this.currentUser.set(null);
  }

  register(fullName: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { fullName, email, password });
  }

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => this.saveTokens(response))
    );
  }

  logout(): void {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken();
  }
}
