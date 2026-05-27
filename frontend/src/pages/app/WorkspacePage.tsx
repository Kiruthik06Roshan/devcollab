import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/Skeleton';
import { createProject, fetchProjects } from '@/services/api/projects';
import { fetchWorkspace } from '@/services/api/workspaces';
import { getApiErrorMessage } from '@/services/api/client';
import type { Project, Workspace } from '@/types/entities';

export default function WorkspacePage() {
  const params = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const workspaceId = params.workspaceId ?? '';

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [workspaceResponse, projectsResponse] = await Promise.all([fetchWorkspace(workspaceId), fetchProjects(workspaceId)]);
        setWorkspace(workspaceResponse.workspace);
        setProjects(projectsResponse.projects);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    if (workspaceId) {
      void load();
    }
  }, [workspaceId]);

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await createProject({ workspaceId, name: projectName, description: projectDescription });
      toast.success('Project created');
      setProjectName('');
      setProjectDescription('');
      setProjects((current) => [response.project, ...current]);
      navigate(`/project/${response.project.id}/board`);
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
            {loading ? (
              <Skeleton className="h-32" />
            ) : (
              <>
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-400">Workspace</Badge>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-text">{workspace?.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{workspace?.description || 'Collaborate on projects and tasks.'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-xl font-semibold text-text">New project</h2>
              <p className="text-sm text-muted">Create a project board for this workspace.</p>
            </div>
            <form className="space-y-3" onSubmit={handleCreateProject}>
              <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Sprint 01" />
              <Textarea value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="Optional description" />
              <Button className="w-full" type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? 'Creating...' : 'Create project'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">Projects</h2>
          <span className="text-sm text-muted">{loading ? 'Loading...' : `${projects.length} active`}</span>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36" />
            ))}
          </div>
        ) : projects.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} to={`/project/${project.id}/board`}>
                <Card className="h-full border-border bg-surface/40 transition hover:-translate-y-1 hover:bg-surface/85">
                  <CardHeader className="border-border/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-text">{project.name}</div>
                        <div className="text-sm text-muted">/{project.slug}</div>
                      </div>
                      <span className="h-3 w-3 rounded-full animate-pulse-slow" style={{ backgroundColor: project.color ?? '#38bdf8' }} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted">
                    <div>{project.description || 'No description yet.'}</div>
                    <div className="flex gap-2">
                      <Badge>{project.status ?? 'active'}</Badge>
                      <Badge>{project.members.length} members</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-border bg-surface/30">
            <CardContent className="p-8 text-center text-sm text-muted">Create a project to start a board and break work into tasks.</CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}