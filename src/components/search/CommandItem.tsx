'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { CommandItemData } from './types';
import { CATEGORY_LABELS } from './types';

interface CommandItemProps {
  item: CommandItemData;
  active: boolean;
  index: number;
  onSelect: () => void;
  onHover: () => void;
  glass?: boolean;
}

export function CommandItem({
  item,
  active,
  index,
  onSelect,
  onHover,
  glass = false,
}: CommandItemProps) {
  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      id={`command-item-${index}`}
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={onHover}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.012, 0.12) }}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
        active
          ? glass
            ? 'bg-primary/15 shadow-[inset_0_0_0_1px_rgba(79,157,255,0.25)]'
            : 'bg-primary/10 shadow-[inset_0_0_0_1px_rgba(79,157,255,0.2)]'
          : glass
            ? 'hover:bg-white/5'
            : 'hover:bg-secondary-bg',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
          active ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/80',
        )}
      >
        <Icon size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
        {item.subtitle && (
          <span className="mt-0.5 block truncate text-xs text-muted">{item.subtitle}</span>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {(item.badge || item.category) && (
          <span
            className={cn(
              'hidden rounded-lg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:inline-flex',
              glass
                ? 'border border-[rgba(110,180,255,0.14)] bg-[rgba(79,157,255,0.08)] text-muted'
                : 'border border-border bg-secondary-bg text-muted',
            )}
          >
            {item.badge ?? CATEGORY_LABELS[item.category]}
          </span>
        )}
        {item.keyboardHint && (
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted sm:inline-flex">
            {item.keyboardHint}
          </kbd>
        )}
      </span>
    </motion.button>
  );
}
