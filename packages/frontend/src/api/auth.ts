import client from "./client";

import type { AuthResponse } from "../types";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>("/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await client.post("/auth/logout");
};
