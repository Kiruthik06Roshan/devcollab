import type http from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { registerSocketHandlers } from '../socket/handlers.js';
import { UserModel } from '../models/user.model.js';
import { getDatabaseMode, memoryDb } from '../services/memoryDb.js';

let socketServer: Server | null = null;

function parseCookie(header?: string) {
  if (!header) return {} as Record<string, string>;
  return header.split(';').map((s) => s.trim()).reduce((acc: Record<string, string>, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

export function attachSocketServer(server: http.Server) {
  socketServer = new Server(server, {
    cors: {
      origin: env.socketCorsOrigin,
      credentials: true
    }
  });

  // Authenticate sockets and attach user info to socket.data.user
  socketServer.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth && (socket.handshake.auth as any).token) ?? (parseCookie(socket.handshake.headers.cookie)[env.jwtCookieName]);
      if (!token) return next();

      const payload = jwt.verify(token, env.jwtSecret) as { sub?: string; role?: string };
      const userId = payload.sub ?? undefined;
      if (!userId) return next();

      if (getDatabaseMode() === 'memory') {
        const user = memoryDb.users.find((u) => u.id === userId);
        socket.data.user = user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl ?? '' } : undefined;
        return next();
      }

      const user = await UserModel.findById(userId).select('name avatarUrl');
      if (user) {
        socket.data.user = { id: user.id, name: user.name, avatarUrl: user.avatarUrl ?? '' };
      }

      return next();
    } catch (err) {
      // don't block connection for auth errors — allow unauthenticated sockets
      return next();
    }
  });

  registerSocketHandlers(socketServer);

  return socketServer;
}

export function getSocketServer() {
  if (!socketServer) {
    throw new Error('Socket server has not been initialized');
  }

  return socketServer;
}