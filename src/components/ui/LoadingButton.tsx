'use client';

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
  outline: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
  ghost: 'text-zinc-500 hover:bg-zinc-100',
};

const sizeStyles = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading,
      fullWidth,
      variant = 'primary',
      size = 'md',
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2.5 rounded-xl font-medium',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.97]',
          variantStyles[variant],
          sizeStyles[size],
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

LoadingButton.displayName = 'LoadingButton';
