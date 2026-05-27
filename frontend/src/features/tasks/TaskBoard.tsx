import { useEffect, useMemo, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/common/Skeleton';
import { createTask, deleteTask, moveTask, updateTask } from '@/services/api/tasks';
import { fetchProjectBoard } from '@/services/api/projects';
import { getApiErrorMessage } from '@/services/api/client';
import { fetchNotifications } from '@/services/api/notifications';
import { Avatar } from '@/components/ui/avatar';
import type { BoardResponse, Task, TaskPriority, TaskStatus } from '@/types/entities';

const columns: Array<{ id: TaskStatus; title: string; accent: string }> = [
  { id: 'todo', title: 'To Do', accent: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', accent: 'bg-cyan-400' },
  { id: 'in_review', title: 'In Review', accent: 'bg-amber-400' },
  { id: 'done', title: 'Done', accent: 'bg-emerald-400' }
];

const priorityStyles: Record<TaskPriority, string> = {
  low: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  medium: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  high: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  urgent: 'border-rose-400/30 bg-rose-400/10 text-rose-200'
};

type TaskFormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string;
  dueDate: string;
};

const emptyFormState: TaskFormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  labels: '',
  dueDate: ''
};

function toTaskFormState(task?: Task | null): TaskFormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'todo',
    priority: task?.priority ?? 'medium',
    labels: task?.labels?.join(', ') ?? '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : ''
  };
}

function parseLabels(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDueDate(value?: string | null) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString();
}

export function TaskBoard({ projectId }: { projectId: string }) {
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyFormState);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetchProjectBoard(projectId);
        setBoard(response);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [projectId]);

  const socket = useSocket();
  const auth = useAuth();

  const [presence, setPresence] = useState<{ users: Array<{ id: string; name: string; avatarUrl?: string; connections?: number }>; count: number } | null>(null);
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  useEffect(() => {
    if (!board) return;

    try {
      socket.connect();
      const projId = board.project._id ?? board.project.id;
      socket.emit('project:join', projId);
      socket.emit('workspace:join', board.project.workspace);

      const handleTaskUpdated = (payload: { projectId: string; taskId: string }) => {
        if (payload.projectId !== projId) return;
        void fetchProjectBoard(projectId).then((response) => setBoard(response)).catch(() => {});
      };

      const handleTaskMoved = (payload: { projectId: string; taskId: string }) => {
        if (payload.projectId !== projId) return;
        void fetchProjectBoard(projectId).then((response) => setBoard(response)).catch(() => {});
      };

      const handlePresence = (payload: { workspaceId: string; users: Array<any>; count: number }) => {
        setPresence({ users: payload.users, count: payload.count });
      };

      const handleNotification = (payload: any) => {
        toast('New notification');
        // refresh notifications
        void fetchNotifications().then((res) => setNotifications(res.notifications)).catch(() => {});
      };

      const handleActivity = (payload: { workspaceId: string }) => {
        toast('Activity in workspace');
      };

      socket.on('board:task-updated', handleTaskUpdated);
      socket.on('board:task-moved', handleTaskMoved);
      socket.on('presence:update', handlePresence);
      socket.on('notification:new', handleNotification);
      socket.on('activity:new', handleActivity);

      return () => {
        try {
          socket.emit('project:leave', projId);
          socket.emit('workspace:leave', board.project.workspace);
          socket.off('board:task-updated', handleTaskUpdated);
          socket.off('board:task-moved', handleTaskMoved);
          socket.off('presence:update', handlePresence);
          socket.off('notification:new', handleNotification);
          socket.off('activity:new', handleActivity);
          socket.disconnect();
        } catch (err) {
          // ignore
        }
      };
    } catch (err) {
      // ignore
    }
  }, [board, projectId, socket]);

  function openCreate(status: TaskStatus) {
    setEditingTask(null);
    setForm({ ...emptyFormState, status });
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm(toTaskFormState(task));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
    setForm(emptyFormState);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      labels: parseLabels(form.labels),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      assigneeIds: [] as string[]
    };

    try {
      if (editingTask) {
        const response = await updateTask(editingTask.id, payload);
        setBoard((current) => mergeTask(current, response.task));
        toast.success('Task updated');
      } else {
        const response = await createTask(projectId, payload);
        setBoard((current) => mergeTask(current, response.task));
        toast.success('Task created');
      }

      closeModal();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id);
      setBoard((current) => removeTaskFromBoard(current, task.id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !board) return;

    const activeTask = board.tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overId = String(over.id);
    const targetStatus = columns.some((column) => column.id === overId)
      ? (overId as TaskStatus)
      : (board.tasks.find((task) => task.id === overId)?.status ?? activeTask.status);

    if (targetStatus === activeTask.status) {
      return;
    }

    const nextColumns = moveTaskLocally(board.columns, activeTask, targetStatus);
    setBoard({
      ...board,
      columns: nextColumns,
      tasks: flattenColumns(nextColumns)
    });

    try {
      await moveTask(activeTask.id, { status: targetStatus, order: nextColumns[targetStatus].length - 1 });
      toast.success('Task moved');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      const response = await fetchProjectBoard(projectId);
      setBoard(response);
    }
    setActiveId(null);
  }

  function handleDragStart(event: any) {
    setActiveId(String(event.active.id));
  }

  const taskCount = useMemo(() => board?.tasks.length ?? 0, [board]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <Skeleton key={column.id} className="h-[36rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-surface/40">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-400">Kanban board</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">{board?.project.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Drag tasks between columns, edit details in a modal, and persist every change to MongoDB.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {presence && presence.users.length ? (
                <div className="flex -space-x-2">
                  {presence.users.slice(0, 4).map((u) => (
                    <Avatar key={u.id} className="h-8 w-8 border border-white/10 text-xs">{(u.name || 'U').split(' ').map((p: string) => p[0]).slice(0,2).join('').toUpperCase()}</Avatar>
                  ))}
                </div>
              ) : null}
              <Badge>{taskCount} tasks</Badge>
            </div>
            <Button onClick={() => openCreate('todo')}>
              <Plus className="mr-2 h-4 w-4" />
              New task
            </Button>
            <Button variant="ghost" className="relative">
              Notifications
              {unreadCount ? <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px]">{unreadCount}</span> : null}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              columnId={column.id}
              title={column.title}
              accent={column.accent}
              tasks={board?.columns[column.id] ?? []}
              onAdd={() => openCreate(column.id)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>

      <DragOverlay dropAnimation={{ duration: 120 }}>
        {activeId ? (
          (() => {
            const activeTask = board?.tasks.find((t) => t.id === activeId);
            return activeTask ? (
              <div className="pointer-events-none w-[20rem] rounded-2xl border border-border bg-surface/90 p-4 shadow-2xl transform-gpu scale-105">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="font-medium text-text">{activeTask.title}</div>
                    {activeTask.description ? <p className="text-sm leading-6 text-muted">{activeTask.description}</p> : null}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="text-xs text-slate-500">1 assignee placeholder</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()
        ) : null}
      </DragOverlay>

      {modalOpen ? (
        <TaskModal
          projectName={board?.project.name ?? 'Project'}
          form={form}
          setForm={setForm}
          isSaving={isSaving}
          onClose={closeModal}
          onSubmit={handleSave}
          editing={Boolean(editingTask)}
        />
      ) : null}
    </div>
  );
}

function TaskColumn({
  columnId,
  title,
  accent,
  tasks,
  onAdd,
  onEdit,
  onDelete
}: {
  columnId: TaskStatus;
  title: string;
  accent: string;
  tasks: Task[];
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <Card ref={setNodeRef} className={`min-h-[32rem] border-border ${isOver ? 'bg-surface/90' : 'bg-surface/40'}`}>
      <CardHeader className="border-border/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
            <span className="text-sm font-semibold text-text">{title}</span>
          </div>
          <Badge>{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <Button variant="secondary" className="w-full justify-start" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add task
        </Button>
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-6 text-center text-sm text-muted">
            Drop tasks here or create a new one.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="rounded-2xl border border-border bg-surface/80 p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <button {...listeners} className="mt-1 text-muted hover:text-text">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-text">{task.title}</div>
              <div className="mt-1 text-xs text-muted">Due {formatDueDate(task.dueDate)}</div>
            </div>
            <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
          </div>
          {task.description ? <p className="text-sm leading-6 text-muted">{task.description}</p> : null}
          {task.labels.length ? (
            <div className="flex flex-wrap gap-2">
              {task.labels.map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-500">1 assignee placeholder</div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(task)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskModal({
  projectName,
  form,
  setForm,
  isSaving,
  onClose,
  onSubmit,
  editing
}: {
  projectName: string;
  form: TaskFormState;
  setForm: Dispatch<SetStateAction<TaskFormState>>;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  editing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <Card className="w-full max-w-2xl border-border bg-surface shadow-soft">
        <CardHeader className="border-border/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-muted">{projectName}</div>
              <h2 className="text-2xl font-semibold text-text">{editing ? 'Edit task' : 'Create task'}</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text">Title</label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Implement invite flow" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text">Description</label>
              <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Add context for the team..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text">Column</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition-all duration-200"
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text">Priority</label>
                <select
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition-all duration-200"
                >
                  {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text">Labels</label>
                <Input value={form.labels} onChange={(event) => setForm((current) => ({ ...current, labels: event.target.value }))} placeholder="frontend, api" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text">Due date</label>
                <Input value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} type="date" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save task'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function mergeTask(board: BoardResponse | null, task: Task) {
  if (!board) {
    return board;
  }

  const nextColumns = { ...board.columns };
  for (const status of Object.keys(nextColumns) as TaskStatus[]) {
    nextColumns[status] = nextColumns[status].filter((item) => item.id !== task.id);
  }

  nextColumns[task.status] = [...nextColumns[task.status], task];

  return {
    ...board,
    tasks: flattenColumns(nextColumns),
    columns: nextColumns
  };
}

function removeTaskFromBoard(board: BoardResponse | null, taskId: string) {
  if (!board) {
    return board;
  }

  const nextColumns = { ...board.columns };
  for (const status of Object.keys(nextColumns) as TaskStatus[]) {
    nextColumns[status] = nextColumns[status].filter((task) => task.id !== taskId);
  }

  return {
    ...board,
    tasks: flattenColumns(nextColumns),
    columns: nextColumns
  };
}

function moveTaskLocally(columnsState: Record<TaskStatus, Task[]>, task: Task, status: TaskStatus) {
  const nextColumns = { ...columnsState };
  for (const columnKey of Object.keys(nextColumns) as TaskStatus[]) {
    nextColumns[columnKey] = nextColumns[columnKey].filter((item) => item.id !== task.id);
  }

  nextColumns[status] = [...nextColumns[status], { ...task, status }];

  return nextColumns;
}

function flattenColumns(columnsState: Record<TaskStatus, Task[]>) {
  return (['todo', 'in_progress', 'in_review', 'done'] as TaskStatus[]).flatMap((status) => columnsState[status]);
}