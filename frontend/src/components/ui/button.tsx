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
    'inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400/60',
    variant === 'default' && 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
    variant === 'secondary' && 'bg-white/6 text-slate-100 hover:bg-white/10',
    variant === 'ghost' && 'bg-transparent text-slate-300 hover:bg-white/5',
    size === 'sm' && 'h-8 px-3 text-sm',
    size === 'md' && 'h-10 px-4 text-sm',
    size === 'lg' && 'h-12 px-5 text-base',
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
    />
  );
});