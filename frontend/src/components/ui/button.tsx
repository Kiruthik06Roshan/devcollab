import { cloneElement, forwardRef, isValidElement } from 'react';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', asChild = false, children, ...props },
  ref
) {
  const styles = cn(
    'inline-flex items-center justify-center rounded-xl font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:ring-offset-2 focus:ring-offset-slate-950',
    variant === 'default' && 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 shadow-md shadow-cyan-400/10 hover:shadow-cyan-400/20 hover:-translate-y-0.5',
    variant === 'secondary' && 'bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 hover:border-white/20',
    variant === 'ghost' && 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
    size === 'sm' && 'h-9 px-4 text-sm',
    size === 'md' && 'h-11 px-5 text-sm',
    size === 'lg' && 'h-13 px-6 text-base',
    className
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement, {
      className: cn(styles, (children as ReactElement<{ className?: string }>).props.className),
      ...props
    });
  }

  return (
    <button
      ref={ref}
      className={styles}
      {...props}
    >
      {children}
    </button>
  );
});