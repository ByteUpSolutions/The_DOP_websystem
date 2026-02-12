import { User } from './user.model';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  communityId: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  parentCommentId?: string | null;
}

export interface CommentNode extends Comment {
  children: CommentNode[];
}
