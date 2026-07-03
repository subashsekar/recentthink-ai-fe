'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', children, className }, ref) => {
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'flex items-start gap-3 rounded-xl border p-4 text-sm',
          styles[variant],
          className,
        )}
      >
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{children}</span>
      </div>
    );
  },
);

Alert.displayName = 'Alert';
