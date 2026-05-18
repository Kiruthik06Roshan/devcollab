import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1', className)} {...props} />;
}

export function Tab({ className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white', className)} {...props} />;
}