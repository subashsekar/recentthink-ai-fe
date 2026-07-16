'use client';

import { useEffect } from 'react';
import { useCommandPaletteStore } from './commandPaletteStore';

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function resolvePreferredInstance(): string {
  const nodes = document.querySelectorAll<HTMLElement>('[data-command-palette]');
  for (const node of nodes) {
    if (node.offsetParent !== null || node.getClientRects().length > 0) {
      return node.dataset.commandPalette ?? 'global';
    }
  }
  return 'global';
}

function focusInstance(instanceId: string) {
  requestAnimationFrame(() => {
    document
      .querySelector<HTMLInputElement>(`[data-command-palette="${instanceId}"] input`)
      ?.focus();
  });
}

/** Mount once (e.g. dashboard layout) so Ctrl/Cmd+K and `/` work globally. */
export function CommandPaletteHotkeys() {
  const open = useCommandPaletteStore((s) => s.open);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isModK) {
        event.preventDefault();
        const preferred = resolvePreferredInstance();
        const state = useCommandPaletteStore.getState();
        if (state.open) {
          state.closePalette();
        } else {
          state.openPalette(preferred);
          focusInstance(preferred);
        }
        return;
      }

      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        const preferred = resolvePreferredInstance();
        useCommandPaletteStore.getState().openPalette(preferred);
        focusInstance(preferred);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
