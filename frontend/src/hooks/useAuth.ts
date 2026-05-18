import { useAuthStore } from '@/state/authStore';

export function useAuth() {
  return useAuthStore();
}