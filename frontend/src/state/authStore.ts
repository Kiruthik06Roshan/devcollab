import { create } from 'zustand';
import { getCurrentUser } from '@/services/api/auth';
import type { AuthUser } from '@/types/entities';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
  bootstrapSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  isAuthenticated: false,
  setSession: (user) => set({ user, status: 'authenticated', isAuthenticated: true }),
  clearSession: () => set({ user: null, status: 'unauthenticated', isAuthenticated: false }),
  bootstrapSession: async () => {
    try {
      const response = await getCurrentUser();
      set({ user: response.user, status: 'authenticated', isAuthenticated: true });
    } catch {
      set({ user: null, status: 'unauthenticated', isAuthenticated: false });
    }
  }
}));