import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-surface/55 px-4 text-sm text-text outline-none placeholder:text-muted/50 transition-all duration-200 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 focus:bg-surface/90',
        className
      )}
      {...props}
    />
  );
});