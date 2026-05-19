/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  gender: string;
  interestedIn: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

export interface NearbyUsersResponse {
  success: boolean;
  users: (UserProfile & { distance: number })[];
}
