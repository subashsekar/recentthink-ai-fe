'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGeneratePatternMutation } from '@/hooks/dsa-pattern/useDsaPatternMutations';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { handlePatternApiError } from '@/utils/dsaPatternError';
import { dsaPatternApi } from '@/services/api/dsaPattern';
import { ROUTES } from '@/constants';
import {
  PATTERN_LANGUAGES,
  PATTERN_LEARNING_STYLES,
  PATTERN_LEVELS,
  PATTERN_SUGGESTIONS,
} from '@/types/dsaPattern';
import { PatternGeneratingState } from './PatternGeneratingState';
import { PatternModelSelector } from './PatternModelSelector';
import { useResolvedModelId } from '@/hooks/useAiModels';
import { cn } from '@/utils/cn';

export function PatternGenerateForm({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const form = useDsaPatternStore((s) => s.form);
  const setForm = useDsaPatternStore((s) => s.setForm);
  const hydrateFromDetail = useDsaPatternStore((s) => s.hydrateFromDetail);
  const setGenerating = useDsaPatternStore((s) => s.setGenerating);
  const setError = useDsaPatternStore((s) => s.setError);
  const generate = useGeneratePatternMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const effectiveModelId = useResolvedModelId(form.model_id);

  useEffect(() => {
    if (!showSuggestions) return;
    function handleClickOutside(event: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  const filteredSuggestions = PATTERN_SUGGESTIONS.filter((p) =>
    p.toLowerCase().includes(form.pattern.trim().toLowerCase()),
  );

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.pattern.trim()) next.pattern = 'Pattern name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || generate.isPending) return;

    setGenerating(true);
    setError(undefined);
    try {
      const lesson = await generate.mutateAsync({
        ...form,
        pattern: form.pattern.trim(),
        model_id: effectiveModelId,
        mode_id: form.mode_id || null,
      });

      if (String(lesson.status).toUpperCase() === 'FAILED') {
        toast.error('Pattern lesson generation failed. Please try again.');
        return;
      }

      let detail = lesson;
      try {
        if (lesson.session_id) {
          detail = await dsaPatternApi.getHistoryDetail(lesson.session_id);
        }
      } catch {
        // Fall back to generate response
      }

      hydrateFromDetail(detail);
      toast.success('Pattern lesson ready.');
      router.push(`${ROUTES.DSA_PATTERN}/session/${detail.session_id || lesson.session_id}`);
    } catch (err) {
      const message = handlePatternApiError(err, 'Failed to generate pattern lesson.');
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  if (generate.isPending) {
    return <PatternGeneratingState />;
  }

  return (
    <div className={cn(embedded ? 'space-y-6' : 'mx-auto max-w-3xl space-y-8')}>
      <form onSubmit={onSubmit} className="glass-card space-y-6 p-5 sm:p-8">
        <div ref={suggestRef} className="relative space-y-1.5">
          <Input
            id="pattern"
            label="Pattern *"
            value={form.pattern}
            onChange={(e) => {
              setForm({ pattern: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            error={errors.pattern}
            placeholder="e.g. Sliding Window"
            autoComplete="off"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-secondary-bg"
                  onClick={() => {
                    setForm({ pattern: suggestion });
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ level: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              {PATTERN_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm({ language: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              {PATTERN_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Learning style</label>
            <select
              value={form.learning_style}
              onChange={(e) => setForm({ learning_style: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              {PATTERN_LEARNING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <PatternModelSelector compact disabled={generate.isPending} menuPlacement="above" />
          <Button type="submit" size="lg" className="rounded-2xl" isLoading={generate.isPending}>
            Generate Pattern Lesson
          </Button>
        </div>
      </form>
    </div>
  );
}
