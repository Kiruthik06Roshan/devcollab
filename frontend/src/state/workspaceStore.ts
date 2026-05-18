import { create } from 'zustand';

type WorkspaceState = {
  workspaceId: string | null;
  projectId: string | null;
  setWorkspaceId: (workspaceId: string | null) => void;
  setProjectId: (projectId: string | null) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: null,
  projectId: null,
  setWorkspaceId: (workspaceId) => set({ workspaceId }),
  setProjectId: (projectId) => set({ projectId })
}));