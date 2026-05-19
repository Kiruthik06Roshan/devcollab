export const socketEvents = {
  workspaceJoin: 'workspace:join',
  workspaceLeave: 'workspace:leave',
  projectJoin: 'project:join',
  projectLeave: 'project:leave',
  taskUpdated: 'board:task-updated',
  taskMoved: 'board:task-moved',
  presenceUpdate: 'presence:update',
  notificationNew: 'notification:new',
  activityNew: 'activity:new'
} as const;