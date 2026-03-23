export interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  fullName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatarUrl: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
