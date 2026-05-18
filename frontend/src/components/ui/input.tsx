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
        'h-10 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/50',
        className
      )}
      {...props}
    />
  );
});