import { useEffect, useMemo } from 'react';
import { createSocket } from '@/services/realtime/socket';

export function useSocket(token?: string | null) {
  const socket = useMemo(() => createSocket(token ?? undefined), [token]);

  useEffect(() => () => {
    socket.disconnect();
  }, [socket]);

  return socket;
}