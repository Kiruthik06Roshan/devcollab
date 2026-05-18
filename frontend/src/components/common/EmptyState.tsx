import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/3 p-8 text-center">
      <div className="text-lg font-medium text-white">{title}</div>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">{description}</p>
      {actionLabel ? <Button className="mt-5">{actionLabel}</Button> : null}
    </div>
  );
}