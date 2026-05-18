import { api } from './client';
import type { AuthUser } from '@/types/entities';

type AuthResponse = {
  user: AuthUser;
  message: string;
};

export function signIn(payload: { email: string; password: string }) {
  return api.post<AuthResponse>('/auth/login', payload).then((response) => response.data);
}

export function signUp(payload: { name: string; email: string; password: string }) {
  return api.post<AuthResponse>('/auth/signup', payload).then((response) => response.data);
}

export function getCurrentUser() {
  return api.get<{ user: AuthUser }>('/auth/me').then((response) => response.data);
}

export function logout() {
  return api.post('/auth/logout').then((response) => response.data);
}