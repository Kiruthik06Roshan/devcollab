import type { Server, Socket } from 'socket.io';
import { socketEvents } from './events';

function registerConnectionHandlers(socket: Socket) {
  socket.on(socketEvents.workspaceJoin, (workspaceId: string) => {
    socket.join(`workspace:${workspaceId}`);
  });

  socket.on(socketEvents.workspaceLeave, (workspaceId: string) => {
    socket.leave(`workspace:${workspaceId}`);
  });

  socket.on(socketEvents.projectJoin, (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on(socketEvents.presenceUpdate, (payload: { workspaceId: string; status: string }) => {
    socket.to(`workspace:${payload.workspaceId}`).emit(socketEvents.presenceUpdate, payload);
  });

  socket.on(socketEvents.taskUpdated, (payload: { projectId: string; taskId: string }) => {
    socket.to(`project:${payload.projectId}`).emit(socketEvents.taskUpdated, payload);
  });

  socket.on(socketEvents.taskMoved, (payload: { projectId: string; taskId: string }) => {
    socket.to(`project:${payload.projectId}`).emit(socketEvents.taskMoved, payload);
  });

  socket.on(socketEvents.notificationNew, (payload: { userId: string }) => {
    socket.to(`user:${payload.userId}`).emit(socketEvents.notificationNew, payload);
  });

  socket.on(socketEvents.activityNew, (payload: { workspaceId: string }) => {
    socket.to(`workspace:${payload.workspaceId}`).emit(socketEvents.activityNew, payload);
  });
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    registerConnectionHandlers(socket);
  });
}