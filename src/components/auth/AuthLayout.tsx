'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { AuthIllustration } from './AuthIllustration';

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn('flex min-h-screen animate-fade-in flex-col lg:flex-row', className)}>
      <div className="hidden h-screen w-full lg:sticky lg:top-0 lg:block lg:w-[40%]">
        <AuthIllustration />
      </div>
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-[60%] lg:px-12">
        {children}
      </div>
    </div>
  );
}
