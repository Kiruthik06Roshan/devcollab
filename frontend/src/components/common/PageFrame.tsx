import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type PageFrameProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageFrame({ eyebrow, title, description, children }: PageFrameProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm font-medium text-slate-200">Workspace surface</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-slate-400">
            <div>This route is a structural placeholder for the {title.toLowerCase()} experience.</div>
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}