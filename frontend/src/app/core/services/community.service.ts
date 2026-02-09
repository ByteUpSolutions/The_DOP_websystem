import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Community, Membership } from '../models/community.model';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = '/api/communities';
  private http = inject(HttpClient);

  getAllCommunities(): Observable<Community[]> {
    return this.http.get<Community[]>(this.apiUrl);
  }

  getCommunityById(id: string): Observable<Community> {
    return this.http.get<Community>(`${this.apiUrl}/${id}`);
  }

  getMyCommunities(): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/my`);
  }

  createCommunity(name: string, description: string, isPrivate: boolean): Observable<Community> {
    return this.http.post<Community>(this.apiUrl, { name, description, isPrivate });
  }

  joinCommunity(communityId: string): Observable<Membership> {
    return this.http.post<Membership>(`${this.apiUrl}/${communityId}/join`, {});
  }

  leaveCommunity(communityId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${communityId}/leave`);
  }

  getCommunityMembers(communityId: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/${communityId}/members`);
  }

  getCommunityDetails(communityId: string): Observable<Community> {
    return this.http.get<Community>(`${this.apiUrl}/${communityId}`);
  }
}
