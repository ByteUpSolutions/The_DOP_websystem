import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from "./features/dashboard/dashboard.component";
import { CommunityLayoutComponent } from "./features/community/community-layout.component";
import { CreatePostComponent } from "./features/post/create-post/create-post.component";
import { PostDetailComponent } from "./features/post/post-detail/post-detail.component";

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard],
    children: [
      { path: 'community/:id', component: CommunityLayoutComponent },
      { path: 'community/:communityId/create-post', component: CreatePostComponent },
      { path: 'post/:id', component: PostDetailComponent },
      { path: '', redirectTo: 'communities', pathMatch: 'full' },
      { path: 'communities', loadComponent: () => import('./features/dashboard/community-list/community-list.component').then(m => m.CommunityListComponent) },
      { path: 'my-communities', loadComponent: () => import('./features/dashboard/my-communities/my-communities.component').then(m => m.MyCommunitiesComponent) },
      { path: 'create-community', loadComponent: () => import('./features/dashboard/create-community/create-community.component').then(m => m.CreateCommunityComponent) },
      { path: 'profile', loadComponent: () => import('./features/dashboard/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'chat/:communityId', loadComponent: () => import('./features/chat/chat-window.component').then(m => m.ChatWindowComponent) },
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' } // Wildcard para rotas não encontradas
];
