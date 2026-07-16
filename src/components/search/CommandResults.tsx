'use client';

import { useEffect, useMemo, useRef } from 'react';
import { CommandGroup } from './CommandGroup';
import { CommandItem } from './CommandItem';
import type { CommandGroupData } from './types';

interface CommandResultsProps {
  groups: CommandGroupData[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onExecuteIndex: (index: number) => void;
  glass?: boolean;
}

export function CommandResults({
  groups,
  selectedIndex,
  onSelectIndex,
  onExecuteIndex,
  glass = false,
}: CommandResultsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const indexedGroups = useMemo(() => {
    return groups.reduce<{
      groups: Array<
        CommandGroupData & {
          indexedItems: Array<{ item: CommandGroupData['items'][number]; index: number }>;
        }
      >;
      nextIndex: number;
    }>(
      (acc, group) => {
        const start = acc.nextIndex;
        const indexedItems = group.items.map((item, i) => ({
          item,
          index: start + i,
        }));
        return {
          groups: [...acc.groups, { ...group, indexedItems }],
          nextIndex: start + group.items.length,
        };
      },
      { groups: [], nextIndex: 0 },
    ).groups;
  }, [groups]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`#command-item-${selectedIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div
      ref={listRef}
      id="command-palette-results"
      role="listbox"
      aria-label="Search results"
      className="max-h-[min(420px,55vh)] overflow-y-auto overscroll-contain py-1"
    >
      {indexedGroups.map((group) => (
        <CommandGroup key={group.id} label={group.label}>
          {group.indexedItems.map(({ item, index }) => (
            <CommandItem
              key={item.id}
              item={item}
              index={index}
              active={selectedIndex === index}
              onSelect={() => onExecuteIndex(index)}
              onHover={() => onSelectIndex(index)}
              glass={glass}
            />
          ))}
        </CommandGroup>
      ))}
    </div>
  );
}
