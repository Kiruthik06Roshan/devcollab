import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Avatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-slate-100', className)} {...props} />;
}