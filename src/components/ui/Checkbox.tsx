'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className, ...props }, ref) => {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 group">
        <div className="relative flex items-center justify-center">
          <input ref={ref} id={id} type="checkbox" className="peer sr-only" {...props} />
          <div
            className={cn(
              'h-4.5 w-4.5 rounded-md border border-zinc-300 bg-white',
              'flex items-center justify-center',
              'transition-colors duration-150',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
              'peer-checked:bg-primary peer-checked:border-primary',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              className,
            )}
          >
            <Check
              size={12}
              className="text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            />
          </div>
        </div>
        {label && <span className="text-sm text-zinc-600">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
