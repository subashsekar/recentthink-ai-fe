'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { SUPPORTED_MODELS } from './data';

export function SupportedModels() {
  const [activeModel, setActiveModel] = useState('claude-sonnet-4');

  return (
    <section className="border-t border-border px-5 py-5 lg:px-8">
      <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
        Supported Models
      </h2>

      <div className="flex flex-wrap gap-2">
        {SUPPORTED_MODELS.map((model) => {
          const isActive = activeModel === model.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => setActiveModel(model.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-all sm:text-sm',
                isActive
                  ? 'border-primary bg-primary/5 text-primary shadow-[0_0_12px_rgba(255,90,54,0.12)]'
                  : 'border-border bg-surface text-muted hover:border-primary/20 hover:text-foreground',
              )}
            >
              {model.name}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted">
        Model response quality may vary. Choose the best model for your needs.
      </p>
    </section>
  );
}
