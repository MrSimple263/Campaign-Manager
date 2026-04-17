import type { SafeUser } from "../../shared/types/index.js";

// Input types
export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Response types
export interface AuthResponse {
  token: string;
  user: SafeUser;
}

export interface UserResponse {
  user: SafeUser;
}
