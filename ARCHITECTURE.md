# DevCollab Architecture

## Product Direction

DevCollab is a dark-mode-first collaboration SaaS for student developer teams. The UI language should feel close to Linear, Notion, GitHub, and Slack: crisp spacing, restrained color, dense information hierarchy, and fast navigation.

## Workspace Layout

```text
devcollab/
  frontend/
    src/
      components/
      contexts/
      features/
      hooks/
      lib/
      pages/
      services/
      state/
      styles/
      types/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      modules/
      routes/
      services/
      socket/
      types/
      utils/
```

## Frontend Route Map

Public routes:

- `/`
- `/login`
- `/signup`
- `/pricing`

Protected routes:

- `/dashboard`
- `/workspace/:workspaceId`
- `/workspace/:workspaceId/projects`
- `/project/:projectId/board`
- `/project/:projectId/list`
- `/project/:projectId/calendar`
- `/project/:projectId/wiki`
- `/project/:projectId/snippets`
- `/project/:projectId/activity`
- `/notifications`
- `/profile/:userId`
- `/settings`

## Frontend Layers

### Shells

- `PublicShell` for marketing/auth pages
- `AppShell` for authenticated dashboard pages
- `ProtectedRoute` for JWT-gated route access

### Layout System

- `TopNav` for global search, workspace switcher, notifications, and profile
- `SidebarNav` for workspace/project navigation
- `CommandPalette` placeholder for fast actions
- `PageHeader` and `EmptyState` for consistent page scaffolding

### State Strategy

Recommended default: Zustand for app/session/UI state. Keep server data in service layer hooks and future query cache.

Suggested stores:

- `authStore` - session, token, profile, auth guards
- `uiStore` - sidebar state, command palette state, theme state
- `workspaceStore` - selected workspace and active project context

### API Layer

Keep a thin service boundary:

- `api/client.ts` - shared HTTP wrapper
- `api/auth.ts`
- `api/workspaces.ts`
- `api/projects.ts`
- `api/tasks.ts`
- `api/snippets.ts`
- `api/wiki.ts`
- `api/notifications.ts`
- `api/ai.ts`

### Real-Time Layer

- `services/realtime/socket.ts` creates the client connection
- namespace/event-driven sync for board updates, presence, activity, notifications

## Backend Layers

### API Organization

Express should be split into small modules with one route entry per domain:

- `auth`
- `workspaces`
- `projects`
- `tasks`
- `snippets`
- `wiki`
- `activity`
- `notifications`
- `ai`

### Shared Infrastructure

- `config/env.ts` for typed environment loading
- `config/db.ts` for Mongo connection
- `config/socket.ts` for Socket.IO bootstrapping
- `middleware/auth.ts` for JWT verification
- `middleware/error.ts` for normalized API errors
- `middleware/validate.ts` for request validation

### Data Model Plan

Core Mongoose entities:

- `User`
- `Workspace`
- `Project`
- `Task`
- `Comment`
- `Snippet`
- `WikiPage`
- `Notification`
- `ActivityLog`

### Socket.IO Plan

Core events:

- `workspace:join`
- `workspace:leave`
- `project:join`
- `board:task-updated`
- `board:task-moved`
- `presence:update`
- `notification:new`
- `activity:new`

## Kanban Foundation

Prepare the system for:

- drag-and-drop columns
- task card previews
- task detail modal
- comments
- labels
- assignees
- priorities
- attachments

Column model:

- `todo`
- `in_progress`
- `in_review`
- `done`

## AI Abstraction Plan

AI should be behind a service boundary so vendor-specific code stays isolated.

Planned capabilities:

- task breakdown generation
- sprint summaries
- blocker detection
- standup reports
- code review assistance

## Recommended npm Packages

### Frontend

- `react`, `react-dom`
- `react-router-dom`
- `zustand`
- `socket.io-client`
- `tailwindcss`, `postcss`, `autoprefixer`
- `clsx`, `tailwind-merge`
- `lucide-react`
- `@radix-ui/*` via shadcn/ui when primitives are expanded

### Backend

- `express`
- `mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `cors`
- `helmet`
- `cookie-parser`
- `dotenv`
- `socket.io`
- `zod` or `joi`
- `morgan`
- `express-rate-limit`

### Dev Tooling

- `typescript`
- `tsx`
- `eslint`
- `prettier`
- `nodemon` or `concurrently` if you prefer a single command runner

## Suggested UI Hierarchy

1. `AppShell`
2. `SidebarNav`
3. `TopNav`
4. `WorkspaceHeader`
5. `PageHeader`
6. `MetricsCards`
7. `PrimaryWorkspaceSurface`
8. `SecondaryPanels`
9. `CommandPalette`

## Delivery Phases

1. Foundation and routing
2. Auth and session handling
3. Workspace and project navigation
4. Kanban board and task operations
5. Wiki/snippets/activity surfaces
6. Socket.IO presence and live sync
7. AI abstraction layer integration
8. Notifications and profile/settings polish
9. Billing/plans and deployment hardening