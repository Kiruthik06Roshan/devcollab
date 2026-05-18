import type http from 'node:http';
import { Server } from 'socket.io';
import { env } from './env';
import { registerSocketHandlers } from '../socket/handlers';

let socketServer: Server | null = null;

export function attachSocketServer(server: http.Server) {
  socketServer = new Server(server, {
    cors: {
      origin: env.socketCorsOrigin,
      credentials: true
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