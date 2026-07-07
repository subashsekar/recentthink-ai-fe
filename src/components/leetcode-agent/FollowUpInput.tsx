'use client';

import { useState } from 'react';
import { LayoutGrid, Send } from 'lucide-react';
import { FOLLOW_UP_SUGGESTIONS } from './data';

export function FollowUpInput() {
  const [value, setValue] = useState('');

  return (
    <section className="border-t border-border px-5 py-5 lg:px-8">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask a follow-up question..."
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setValue(suggestion)}
                className="rounded-full border border-border bg-secondary-bg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary/20 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl p-2 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
              aria-label="Layout options"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-[0_0_16px_rgba(255,90,54,0.3)]"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
