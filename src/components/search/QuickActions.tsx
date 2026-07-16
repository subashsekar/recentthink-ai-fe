'use client';

import { CommandGroup } from './CommandGroup';
import { CommandItem } from './CommandItem';
import type { CommandItemData } from './types';

interface QuickActionsProps {
  items: CommandItemData[];
  selectedIndex: number;
  indexOffset: number;
  onSelectIndex: (index: number) => void;
  onExecuteIndex: (index: number) => void;
  glass?: boolean;
}

export function QuickActions({
  items,
  selectedIndex,
  indexOffset,
  onSelectIndex,
  onExecuteIndex,
  glass = false,
}: QuickActionsProps) {
  return (
    <CommandGroup label="Quick Actions">
      {items.map((item, i) => {
        const index = indexOffset + i;
        return (
          <CommandItem
            key={item.id}
            item={item}
            index={index}
            active={selectedIndex === index}
            onSelect={() => onExecuteIndex(index)}
            onHover={() => onSelectIndex(index)}
            glass={glass}
          />
        );
      })}
    </CommandGroup>
  );
}
