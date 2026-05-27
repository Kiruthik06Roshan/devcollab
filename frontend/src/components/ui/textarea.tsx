import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-xl border border-border bg-surface/55 px-4 py-3 text-sm text-text outline-none placeholder:text-muted/50 transition-all duration-200 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 focus:bg-surface/90',
        className
      )}
      {...props}
    />
  );
});