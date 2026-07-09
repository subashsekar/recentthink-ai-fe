'use client';

import { ModeSelector } from './ModeSelector';

export function WorkspaceHeader() {
  return (
    <div className="flex flex-wrap items-center justify-center border-b border-border px-5 py-3.5">
      <ModeSelector />
    </div>
  );
}
