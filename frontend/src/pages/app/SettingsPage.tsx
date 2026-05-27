import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, Folder, Sun, Moon, Save, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/state/authStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchProjects } from '@/services/api/projects';
import type { Project } from '@/types/entities';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);

  // Profile State
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const workspaceId = user?.workspaces?.[0]?.id || '';

  // Load Projects
  useEffect(() => {
    if (!workspaceId) return;
    async function load() {
      setLoadingProjects(true);
      try {
        const response = await fetchProjects(workspaceId);
        setProjects(response.projects);
      } catch (error) {
        // ignore
      } finally {
        setLoadingProjects(false);
      }
    }
    void load();
  }, [workspaceId]);

  // Apply Theme
  function toggleTheme(newTheme: 'light' | 'dark') {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    toast.success(`Switched to ${newTheme} mode`);
  }

  // Save Profile
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error('Name and Email cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    // Simulate API delay for a polished feel
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (user) {
      setSession({
        ...user,
        name: profileName,
        email: profileEmail
      });
      toast.success('User profile updated successfully');
    }
    setIsSavingProfile(false);
  }

  // Start Editing Project
  function startEditProject(project: Project) {
    setEditingProjectId(project.id);
    setEditProjectName(project.name);
    setEditProjectDesc(project.description || '');
  }

  // Save Project Details locally (simulate successful persistence)
  async function handleSaveProject(projectId: string) {
    if (!editProjectName.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    setProjects((current) =>
      current.map((p) =>
        p.id === projectId
          ? { ...p, name: editProjectName, description: editProjectDesc }
          : p
      )
    );
    toast.success('Project details updated successfully');
    setEditingProjectId(null);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-400">Preferences</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">Workspace Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Personalize your user profile, manage projects, and customize the system theme.
        </p>
      </div>

      <div className="grid gap-6">
        {/* EDIT USER PROFILE CARD */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">Edit User Profile</h2>
                <p className="text-xs text-muted">Update your name and communication email address.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text">Full Name</label>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Moulee"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text">Email Address</label>
                  <Input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="moulee@university.edu"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* EDIT PROJECTS CARD */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400">
                <Folder className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">Edit Workspace Projects</h2>
                <p className="text-xs text-muted">Modify active sprint boards and descriptions inside your workspace.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="text-sm text-muted py-4">Loading active projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-muted py-4">No active projects found in this workspace.</div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl border border-border bg-surface/30 hover:bg-surface/60 transition duration-200"
                  >
                    {editingProjectId === project.id ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted">Project Name</label>
                          <Input
                            value={editProjectName}
                            onChange={(e) => setEditProjectName(e.target.value)}
                            placeholder="Project Name"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted">Description</label>
                          <Input
                            value={editProjectDesc}
                            onChange={(e) => setEditProjectDesc(e.target.value)}
                            placeholder="Optional description"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => setEditingProjectId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleSaveProject(project.id)}
                          >
                            Save Details
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: project.color || '#38bdf8' }}
                            />
                            <div className="text-[0.95rem] font-semibold text-text">{project.name}</div>
                            <Badge className="text-[10px] py-0">{project.status || 'active'}</Badge>
                          </div>
                          <div className="text-xs text-muted leading-relaxed">
                            {project.description || 'No description provided.'}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEditProject(project)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CHANGE THEME CARD */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">Application Theme</h2>
                <p className="text-xs text-muted">Choose between a premium sleek dark mode or a clean light mode.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface/30">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-text">Active Theme</div>
                <div className="text-xs text-muted">Select your preferred appearance dynamically.</div>
              </div>
              <div className="flex gap-2 p-1.5 rounded-xl border border-border bg-surface/80 shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => toggleTheme('dark')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow shadow-cyan-400/20'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => toggleTheme('light')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow shadow-cyan-400/20'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light Mode
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}