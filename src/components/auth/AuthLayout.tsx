'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { AuthIllustration } from './AuthIllustration';
import { AuthBrandingPanel } from './AuthBrandingPanel';

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
  useGifBranding?: boolean;
}

export function AuthLayout({ children, className, useGifBranding = false }: AuthLayoutProps) {
  return (
    <div className={cn('flex min-h-screen animate-fade-in flex-col lg:flex-row', className)}>
      <div className="hidden h-screen w-full lg:sticky lg:top-0 lg:block lg:w-[40%]">
        {useGifBranding ? <AuthBrandingPanel /> : <AuthIllustration />}
      </div>
      <div
        className={cn(
          'flex w-full items-center justify-center px-4 py-10 lg:w-[60%] lg:px-12',
          useGifBranding
            ? 'bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950'
            : undefined,
        )}
      >
        {children}
      </div>
    </div>
  );
}
