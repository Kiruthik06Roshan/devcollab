import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          AI-powered collaboration for student dev teams
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white lg:text-6xl">
          GitHub, Notion, and Slack energy for project teams in one SaaS workspace.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          DevCollab gives your team workspaces, projects, a live kanban board, docs, snippets, and AI-ready workflows in a dark-mode-first UI.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/signup">Get started</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="space-y-4 p-6">
          <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Product snapshot</div>
          <div className="grid gap-3">
            {[
              'Workspace switching and project navigation',
              'Kanban board with drag-and-drop task control',
              'Session persistence via secure JWT cookies',
              'Modern responsive dashboard shell'
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}