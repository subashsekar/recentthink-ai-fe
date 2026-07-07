'use client';

import { useEffect, useRef, useState } from 'react';
import { Link2, Send } from 'lucide-react';
import { HeroOrb } from '@/components/dashboard/hero-orb';
import toast from 'react-hot-toast';
import { config } from '@/config';
import { analyzeAdaptive, parseJsonAnalyzePayload } from '@/services/api/analyzeAdaptive';
import { APP_EVENTS } from '@/utils/events';
import { storage } from '@/utils/storage';
import { ApiRequestError } from '@/utils/apiError';
import { useChatStore } from '@/store/chatStore';

export function LeetCodeHero() {
  const [url, setUrl] = useState('https://leetcode.com/problems/two-sum/');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const applyAnalyzeResult = useChatStore((s) => s.applyAnalyzeResult);
  const applyStreamEvent = useChatStore((s) => s.applyStreamEvent);
  const setAnalyzing = useChatStore((s) => s.setAnalyzing);
  const setStreaming = useChatStore((s) => s.setStreaming);

  useEffect(() => {
    const onNewChat = () => {
      abortRef.current?.abort();
      setUrl('');
      setIsLoading(false);
      inputRef.current?.focus();
    };
    window.addEventListener(APP_EVENTS.LEETCODE_NEW_CHAT, onNewChat);
    return () => window.removeEventListener(APP_EVENTS.LEETCODE_NEW_CHAT, onNewChat);
  }, []);

  const isValidLeetCodeUrl = (value: string) => {
    try {
      const u = new URL(value);
      return (
        (u.hostname === 'leetcode.com' || u.hostname.endsWith('.leetcode.com')) &&
        u.pathname.includes('/problems/')
      );
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    // Temporary high-signal debug logs (dev only).
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[LeetCode][Analyze] click', { url, baseUrl: config.api.baseUrl });
    }

    const trimmed = url.trim();
    if (!trimmed) {
      toast.error('Please paste a LeetCode problem URL.');
      return;
    }
    if (!isValidLeetCodeUrl(trimmed)) {
      toast.error(
        'Please enter a valid LeetCode problem URL (e.g. https://leetcode.com/problems/...).',
      );
      return;
    }
    if (isLoading) return;

    const token = storage.get<string>(config.auth.tokenKey);
    if (!token) {
      toast.error('Please log in to analyze problems.');
      return;
    }

    setIsLoading(true);
    setAnalyzing(true);
    setStreaming(false);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[LeetCode][Analyze] request -> POST /leetcode/analyze', {
          problem_url: trimmed,
        });
      }

      await analyzeAdaptive(
        { problem_url: trimmed },
        {
          onJsonResponse: (payload) => {
            const result = parseJsonAnalyzePayload(payload);
            applyAnalyzeResult(result);
          },
          onStreamEvent: (event) => {
            if (event.type === 'error') {
              throw new Error(event.message);
            }
            applyStreamEvent(event);
          },
        },
        abortRef.current.signal,
      );

      toast.success('Analysis ready. Review the report pages.');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;

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

      toast.error(message);
      if (process.env.NODE_ENV !== 'production') {
        console.error('[LeetCode][Analyze] error', err);
      }
    } finally {
      setIsLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <section className="px-5 py-6 lg:px-8 lg:py-8">
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-4">
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              Welcome to <span className="text-primary">LeetCode Mentor</span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted lg:text-base">
              Paste a LeetCode problem URL and let AI teach, explain and optimize your solution.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-primary/25 bg-surface p-4 shadow-[0_0_32px_rgba(255,90,54,0.08)]">
            <div className="flex items-start gap-3">
              <Link2 size={18} className="mt-3 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <input
                  type="url"
                  ref={inputRef}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste LeetCode problem URL here..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none lg:text-base"
                />
                <p className="mt-3 text-xs text-muted">We support all LeetCode problem URLs</p>
              </div>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(255,90,54,0.3)]"
              >
                <Send size={16} />
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden h-[200px] w-[240px] shrink-0 lg:block xl:h-[220px] xl:w-[280px]">
          <HeroOrb className="h-full w-full scale-90" />
        </div>
      </div>
    </section>
  );
}
