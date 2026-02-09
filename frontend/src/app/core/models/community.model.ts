export interface Community {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Membership {
  id: string;
  user: User;
  community: Community;
  role: string;
  joinedAt: string;
}

import { User } from './user.model';
