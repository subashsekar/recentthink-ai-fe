'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AlertCircle, Link2, RefreshCw, Send } from 'lucide-react';
import { HeroOrb } from '@/components/dashboard/hero-orb';
import toast from 'react-hot-toast';
import { config } from '@/config';
import {
  hackerrankAnalyzeAdaptive,
  parseJsonAnalyzePayload,
} from '@/services/api/hackerrankAnalyzeAdaptive';
import { APP_EVENTS } from '@/utils/events';
import { storage } from '@/utils/storage';
import { ApiRequestError, isAbortError } from '@/utils/apiError';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { ModelSelector } from './ModelSelector';
import { useInvalidateHackerRankQueries } from '@/hooks/hackerrank/useHackerRankMutations';
import { useEffectiveModelId } from '@/hooks/hackerrank/useEffectiveModelId';
import { useEffectiveModeId } from '@/hooks/hackerrank/useEffectiveModeId';

export interface HackerRankHeroHandle {
  analyzeUrl: (url: string) => Promise<void>;
}

export const HackerRankHero = forwardRef<HackerRankHeroHandle>(
  function HackerRankHero(_props, ref) {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const applyAnalyzeResult = useHackerRankChatStore((s) => s.applyAnalyzeResult);
    const applyStreamEvent = useHackerRankChatStore((s) => s.applyStreamEvent);
    const setAnalyzing = useHackerRankChatStore((s) => s.setAnalyzing);
    const setStreaming = useHackerRankChatStore((s) => s.setStreaming);
    const effectiveModelId = useEffectiveModelId();
    const effectiveModeId = useEffectiveModeId();
    const { invalidateAll } = useInvalidateHackerRankQueries();

    const isValidHackerRankUrl = useCallback((value: string) => {
      try {
        const u = new URL(value);
        const hostOk = u.hostname === 'www.hackerrank.com' || u.hostname === 'hackerrank.com';
        const pathOk = u.pathname.includes('/challenges/');
        return hostOk && pathOk;
      } catch {
        return false;
      }
    }, []);

    const handleAnalyze = useCallback(
      async (targetUrl?: string) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[HackerRank][Analyze] click', { url, baseUrl: config.api.baseUrl });
        }

        const trimmed = (targetUrl ?? url).trim();
        if (!trimmed) {
          toast.error('Please paste a HackerRank challenge URL.');
          return;
        }
        if (!isValidHackerRankUrl(trimmed)) {
          toast.error(
            'Please enter a valid HackerRank challenge URL (e.g. https://www.hackerrank.com/challenges/.../problem).',
          );
          return;
        }
        if (isLoading) return;

        const token = storage.get<string>(config.auth.tokenKey);
        if (!token) {
          toast.error('Please log in to analyze challenges.');
          return;
        }

        setError(null);
        setIsLoading(true);
        setAnalyzing(true);
        setStreaming(false);
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        try {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[HackerRank][Analyze] request -> POST /hackerrank/analyze', {
              problem_url: trimmed,
              model_id: effectiveModelId,
              mode_id: effectiveModeId,
            });
          }

          await hackerrankAnalyzeAdaptive(
            {
              problem_url: trimmed,
              model_id: effectiveModelId ?? undefined,
              mode_id: effectiveModeId || undefined,
            },
            {
              onJsonResponse: (payload) => {
                const result = parseJsonAnalyzePayload(payload);
                applyAnalyzeResult(result);
              },
              onStreamEvent: (event) => {
                if (event.type === 'error') {
                  throw new Error(event.message);
                }
                if (event.type === 'complete') {
                  const status = String(event.status ?? '').toUpperCase();
                  if (status === 'MANUAL_REQUIRED') {
                    throw new Error(
                      event.message ||
                        'We could not retrieve the challenge from the URL. Please paste the statement manually.',
                    );
                  }
                }
                applyStreamEvent(event);
              },
            },
            abortRef.current.signal,
          );

          invalidateAll();
          toast.success('Analysis ready. Review the report pages.');
        } catch (err) {
          if (isAbortError(err)) return;

          let message = 'Failed to analyze. Please try again.';
          if (err instanceof ApiRequestError) {
            message = err.message;
            if (err.status === 401) {
              toast.error('Session expired. Please log in again.');
              return;
            }
          } else if (err instanceof Error && err.message) {
            message = err.message;
          }

          setError(message);
          toast.error(message);
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[HackerRank][Analyze] error:', message);
          }
        } finally {
          setIsLoading(false);
          setAnalyzing(false);
        }
      },
      [
        url,
        isLoading,
        isValidHackerRankUrl,
        effectiveModelId,
        effectiveModeId,
        applyAnalyzeResult,
        applyStreamEvent,
        setAnalyzing,
        setStreaming,
        invalidateAll,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        analyzeUrl: async (targetUrl: string) => {
          setUrl(targetUrl);
          await handleAnalyze(targetUrl);
        },
      }),
      [handleAnalyze],
    );

    useEffect(() => {
      const onNewChat = () => {
        abortRef.current?.abort();
        setUrl('');
        setError(null);
        setIsLoading(false);
        inputRef.current?.focus();
      };
      window.addEventListener(APP_EVENTS.HACKERRANK_NEW_CHAT, onNewChat);
      return () => window.removeEventListener(APP_EVENTS.HACKERRANK_NEW_CHAT, onNewChat);
    }, []);

    return (
      <section className="px-5 py-6 lg:px-8 lg:py-8">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                Welcome to <span className="text-primary">HackerRank Mentor</span>
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-muted lg:text-base">
                Paste a HackerRank challenge URL and get step-by-step guidance, optimized solutions,
                and a code explainer.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-error">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => handleAnalyze()}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg glass-panel px-2 py-1 text-xs font-medium text-foreground hover-surface"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div className="glass-panel rounded-2xl border-2 border-primary/25 p-4 shadow-[0_0_32px_rgba(79,157,255,0.08)]">
              <div className="flex flex-wrap items-start gap-3">
                <Link2 size={18} className="mt-3 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <input
                    type="url"
                    ref={inputRef}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleAnalyze();
                    }}
                    placeholder="Paste HackerRank challenge URL here..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none lg:text-base"
                  />
                  <p className="mt-3 text-xs text-muted">
                    We support HackerRank challenge URLs under /challenges/
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <ModelSelector compact />
                  <button
                    type="button"
                    onClick={() => void handleAnalyze()}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(79,157,255,0.3)] disabled:opacity-60"
                  >
                    <Send size={16} />
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden h-[200px] w-[240px] shrink-0 lg:block xl:h-[220px] xl:w-[280px]">
            <HeroOrb className="h-full w-full scale-90" />
          </div>
        </div>
      </section>
    );
  },
);
