import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/Skeleton';
import { createWorkspace, fetchWorkspaces } from '@/services/api/workspaces';
import { getApiErrorMessage } from '@/services/api/client';
import type { Workspace } from '@/types/entities';
import { useAuthStore } from '@/state/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);
  const user = useAuthStore((state) => state.user);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetchWorkspaces();
        setWorkspaces(response.workspaces);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleCreateWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await createWorkspace({ name, description });
      toast.success('Workspace created');
      setName('');
      setDescription('');
      setWorkspaces((current) => [response.workspace, ...current]);
      await bootstrapSession();
      navigate(`/workspace/${response.workspace.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-400">Dashboard</Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-text">Welcome back{user ? `, ${user.name}` : ''}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Create a workspace, add projects, and start managing the team board from a polished SaaS shell.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="border-border/60 bg-surface/50"><CardContent className="p-4"><div className="text-sm text-muted">Workspaces</div><div className="mt-2 text-2xl font-semibold text-text">{workspaces.length}</div></CardContent></Card>
              <Card className="border-border/60 bg-surface/50"><CardContent className="p-4"><div className="text-sm text-muted">Status</div><div className="mt-2 text-2xl font-semibold text-text">Live</div></CardContent></Card>
              <Card className="border-border/60 bg-surface/50"><CardContent className="p-4"><div className="text-sm text-muted">Session</div><div className="mt-2 text-2xl font-semibold text-text">Active</div></CardContent></Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-xl font-semibold text-text">New workspace</h2>
              <p className="text-sm text-muted">Start a team space for a class, club, or hackathon project.</p>
            </div>
            <form className="space-y-3" onSubmit={handleCreateWorkspace}>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="DevCollab Team" />
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" />
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create workspace'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">Your workspaces</h2>
          <span className="text-sm text-muted">{loading ? 'Loading...' : `${workspaces.length} total`}</span>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36" />
            ))}
          </div>
        ) : workspaces.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link key={workspace.id} to={`/workspace/${workspace.id}`}>
                <Card className="h-full border-border bg-surface/40 transition hover:-translate-y-1 hover:bg-surface/80">
                  <CardHeader className="border-border/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-text">{workspace.name}</div>
                        <div className="text-sm text-muted">/{workspace.slug}</div>
                      </div>
                      <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-400">{workspace.plan ?? 'Free'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted">{workspace.description || 'No description yet.'}</CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-border bg-surface/30">
            <CardContent className="p-8 text-center text-sm text-muted">Create your first workspace to begin organizing projects.</CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}