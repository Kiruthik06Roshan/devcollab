import type { Server, Socket } from 'socket.io';
import { socketEvents } from './events.js';

type PresenceEntry = { sockets: Set<string>; user: { id: string; name: string; avatarUrl?: string } };

const workspacePresence = new Map<string, Map<string, PresenceEntry>>();

function emitPresenceUpdate(io: Server, workspaceId: string) {
  const map = workspacePresence.get(workspaceId) ?? new Map();
  const users = Array.from(map.values()).map((entry) => ({ id: entry.user.id, name: entry.user.name, avatarUrl: entry.user.avatarUrl, connections: entry.sockets.size }));
  io.to(`workspace:${workspaceId}`).emit(socketEvents.presenceUpdate, { workspaceId, users, count: users.length });
}

function addPresence(io: Server, workspaceId: string, user: { id: string; name: string; avatarUrl?: string }, socketId: string) {
  let map = workspacePresence.get(workspaceId);
  if (!map) {
    map = new Map();
    workspacePresence.set(workspaceId, map);
  }

  let entry = map.get(user.id);
  if (!entry) {
    entry = { sockets: new Set(), user };
    map.set(user.id, entry);
  }

  entry.sockets.add(socketId);
  emitPresenceUpdate(io, workspaceId);
}

function removePresence(io: Server, workspaceId: string, userId: string, socketId: string) {
  const map = workspacePresence.get(workspaceId);
  if (!map) return;

  const entry = map.get(userId);
  if (!entry) return;

  entry.sockets.delete(socketId);
  if (entry.sockets.size === 0) {
    map.delete(userId);
  }

  emitPresenceUpdate(io, workspaceId);
}

function registerConnectionHandlers(io: Server, socket: Socket) {
  // track joined workspaces per socket for cleanup
  (socket.data as any).joinedWorkspaces = new Set<string>();

  socket.on(socketEvents.workspaceJoin, (workspaceId: string) => {
    socket.join(`workspace:${workspaceId}`);
    (socket.data as any).joinedWorkspaces.add(workspaceId);

    const user = socket.data.user as { id?: string; name?: string; avatarUrl?: string } | undefined;
    if (user && user.id) {
      addPresence(io, workspaceId, { id: user.id, name: user.name ?? 'Unknown', avatarUrl: user.avatarUrl ?? '' }, socket.id);
    }
  });

  socket.on(socketEvents.workspaceLeave, (workspaceId: string) => {
    socket.leave(`workspace:${workspaceId}`);
    (socket.data as any).joinedWorkspaces.delete(workspaceId);

    const user = socket.data.user as { id?: string } | undefined;
    if (user && user.id) {
      removePresence(io, workspaceId, user.id, socket.id);
    }
  });

  socket.on(socketEvents.projectJoin, (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on(socketEvents.projectLeave, (projectId: string) => {
    socket.leave(`project:${projectId}`);
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

  socket.on('disconnect', () => {
    const joined: Set<string> = (socket.data as any).joinedWorkspaces ?? new Set();
    const user = socket.data.user as { id?: string } | undefined;
    if (user && user.id) {
      for (const workspaceId of Array.from(joined)) {
        removePresence(io, workspaceId, user.id, socket.id);
      }
    }
  });
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    registerConnectionHandlers(io, socket);
  });
}