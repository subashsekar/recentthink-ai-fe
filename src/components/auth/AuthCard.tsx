'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[580px] animate-slide-left',
        'rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm lg:p-12',
        className,
      )}
      style={{ animationDuration: '0.5s' }}
    >
      {children}
    </div>
  );
}
