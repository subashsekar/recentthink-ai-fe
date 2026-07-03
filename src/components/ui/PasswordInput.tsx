'use client';

import { forwardRef, useState, useCallback, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, onKeyDown, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCapsLock(e.getModifierState('CapsLock'));
        onKeyDown?.(e);
      },
      [onKeyDown],
    );

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-error focus:ring-error/20'
                : 'border-zinc-300 focus:border-primary/50',
              className,
            )}
            onKeyDown={handleKeyDown}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {capsLock && (
          <p className="flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle size={12} />
            Caps lock is on
          </p>
        )}
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
