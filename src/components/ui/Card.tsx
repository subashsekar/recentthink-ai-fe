import { cn } from '@/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900',
        variant === 'interactive' &&
          'transition-shadow hover:shadow-lg dark:hover:shadow-zinc-800/50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
