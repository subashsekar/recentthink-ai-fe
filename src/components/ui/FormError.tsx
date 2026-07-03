'use client';

import { cn } from '@/utils/cn';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className={cn('mt-1.5 text-xs text-error', className)} role="alert">
      {message}
    </p>
  );
}
