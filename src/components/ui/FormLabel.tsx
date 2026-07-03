'use client';

import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, className, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-sm font-medium text-zinc-700', className)}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
    );
  },
);

FormLabel.displayName = 'FormLabel';
