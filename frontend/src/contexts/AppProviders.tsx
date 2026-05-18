import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/state/authStore';

export function AppProviders({ children }: PropsWithChildren) {
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    void bootstrapSession();
  }, []);

  return (
    <>
      {children}
      <Toaster richColors position="top-right" theme="dark" />
    </>
  );
}