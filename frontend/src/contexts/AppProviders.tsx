import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/state/authStore';

export function AppProviders({ children }: PropsWithChildren) {
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    void bootstrapSession();
  }, []);

  return (
    <>
      {children}
      <Toaster richColors position="top-right" theme="dark" />
    </>
  );
}