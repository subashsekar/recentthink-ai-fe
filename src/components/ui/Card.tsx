import { cn } from '@/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm',
        variant === 'interactive'
          ? 'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.01] hover:border-primary/20'
          : '',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
