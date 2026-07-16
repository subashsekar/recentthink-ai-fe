'use client';

import { forwardRef, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  open: boolean;
  glass?: boolean;
  placeholder?: string;
  activeDescendantId?: string;
}

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
  {
    value,
    onChange,
    onFocus,
    onKeyDown,
    open,
    glass = false,
    placeholder = 'Search anything...',
    activeDescendantId,
  },
  ref,
) {
  return (
    <div
      className={cn('relative w-full transition-all duration-300 ease-out', open && 'scale-[1.02]')}
    >
      <Search
        size={18}
        className={cn(
          'pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300',
          open ? 'text-primary' : 'text-muted',
        )}
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="command-palette-results"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={activeDescendantId}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(
          'h-12 w-full rounded-2xl py-3 pl-12 pr-20 text-base shadow-sm transition-all duration-300 ease-out placeholder:text-muted',
          glass
            ? 'glass-input'
            : 'border border-border bg-surface text-foreground focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20',
          open &&
            (glass
              ? 'shadow-[0_0_28px_rgba(79,157,255,0.28)] ring-1 ring-primary/40'
              : 'border-primary/40 shadow-[0_0_28px_rgba(79,157,255,0.22)] ring-2 ring-primary/25'),
        )}
      />
      <kbd
        className={cn(
          'pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium text-muted sm:inline-flex',
          glass
            ? 'border border-[rgba(110,180,255,0.14)] bg-[rgba(79,157,255,0.08)]'
            : 'border border-border bg-secondary-bg',
          open && 'opacity-60',
        )}
      >
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </div>
  );
});
