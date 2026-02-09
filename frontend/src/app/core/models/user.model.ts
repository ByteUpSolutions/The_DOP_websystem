export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  firebaseUid?: string;
}

export interface AuthTokens {
  accessToken: string;
  chatToken: string;
  user: User;
}
