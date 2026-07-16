'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { CommandInput } from './CommandInput';
import { CommandResults } from './CommandResults';
import { SearchOverlay } from './SearchOverlay';
import { SearchLoading } from './SearchLoading';
import { SearchNoResults } from './SearchNoResults';
import { SearchEmptyState } from './SearchEmptyState';
import { useCommandPalette } from './useCommandPalette';

interface CommandPaletteProps {
  className?: string;
  glass?: boolean;
}

export function CommandPalette({ className, glass = false }: CommandPaletteProps) {
  const {
    open,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    resultGroups,
    flatItems,
    isSearching,
    hasQuery,
    openPalette,
    closePalette,
    executeItem,
    onKeyDown,
    containerRef,
    inputRef,
    instanceId,
  } = useCommandPalette();

  // Outside click (active instance only)
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePalette();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, closePalette, containerRef]);

  const showLoading = isSearching && hasQuery;
  const showNoResults = hasQuery && !isSearching && flatItems.length === 0;
  const showResults = !showLoading && !showNoResults && flatItems.length > 0;
  const showEmptyHint = !hasQuery && flatItems.length === 0;

  return (
    <>
      <SearchOverlay open={open} onClose={closePalette} glass={glass} />

      <div
        ref={containerRef}
        data-command-palette={instanceId}
        className={cn('relative z-[70] w-full max-w-xl', className)}
        onKeyDown={onKeyDown}
      >
        <CommandInput
          ref={inputRef}
          value={query}
          onChange={setQuery}
          onFocus={openPalette}
          onKeyDown={onKeyDown}
          open={open}
          glass={glass}
          activeDescendantId={
            open && flatItems.length > 0 ? `command-item-${selectedIndex}` : undefined
          }
        />

        <AnimatePresence>
          {open && (
            <motion.div
              key="command-dropdown"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'absolute left-0 right-0 top-full z-[70] mt-2 origin-top overflow-hidden rounded-2xl shadow-2xl',
                glass
                  ? 'glass-dropdown'
                  : 'border border-border bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]',
              )}
            >
              <div className="border-b border-border/60 px-4 py-2.5">
                <p className="text-[11px] text-muted">
                  Navigate with <kbd className="rounded border border-border px-1">↑</kbd>{' '}
                  <kbd className="rounded border border-border px-1">↓</kbd> · Select{' '}
                  <kbd className="rounded border border-border px-1">Enter</kbd> · Close{' '}
                  <kbd className="rounded border border-border px-1">Esc</kbd>
                </p>
              </div>

              {showLoading && <SearchLoading />}
              {showNoResults && <SearchNoResults query={query.trim()} />}
              {showEmptyHint && <SearchEmptyState />}
              {showResults && (
                <CommandResults
                  groups={resultGroups}
                  selectedIndex={selectedIndex}
                  onSelectIndex={setSelectedIndex}
                  onExecuteIndex={(index) => {
                    const item = flatItems[index];
                    if (item) executeItem(item);
                  }}
                  glass={glass}
                />
              )}

              <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[10px] text-muted">
                <span>RecentThink Command Palette</span>
                <span className="hidden sm:inline">Try “Teach Binary Search”</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
