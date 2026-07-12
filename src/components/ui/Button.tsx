'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-[0_0_18px_rgba(79,157,255,0.2)] hover:shadow-[0_0_22px_rgba(79,157,255,0.3)]',
  secondary: 'border border-white/[0.12] bg-white/[0.08] text-foreground hover:bg-white/[0.12]',
  outline:
    'border border-[rgba(110,180,255,0.2)] text-foreground hover:bg-[rgba(79,157,255,0.08)] hover:shadow-[0_0_16px_rgba(79,157,255,0.12)]',
  ghost: 'text-secondary-text hover:bg-[rgba(79,157,255,0.1)] hover:text-foreground',
  danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-[250ms] ease-out focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
