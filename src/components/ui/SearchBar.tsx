'use client';

import { CommandPalette } from '@/components/search/CommandPalette';

interface SearchBarProps {
  className?: string;
  glass?: boolean;
}

/** Navbar search trigger — powered by the global AI command palette. */
export function SearchBar({ className, glass = false }: SearchBarProps) {
  return <CommandPalette className={className} glass={glass} />;
}
