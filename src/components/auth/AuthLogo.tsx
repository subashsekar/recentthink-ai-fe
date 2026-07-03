'use client';

import { cn } from '@/utils/cn';
import { Logo } from '@/components/ui/Logo';
import { ROUTES } from '@/constants';

interface AuthLogoProps {
  className?: string;
}

export function AuthLogo({ className }: AuthLogoProps) {
  return (
    <a
      href={ROUTES.HOME}
      className={cn('inline-flex items-center gap-2.5', className)}
      aria-label="RecentThink Home"
    >
      <Logo width={28} height={28} showText textClassName="text-zinc-900" />
    </a>
  );
}
