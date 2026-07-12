'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGenerateCourseMutation } from '@/hooks/courses/useCourseMutations';
import { useCourseStore } from '@/store/courseStore';
import { handleCourseApiError } from '@/utils/courseError';
import { coursesApi } from '@/services/api/courses';
import { ROUTES } from '@/constants';
import { CourseExampleCards } from './CourseExampleCards';
import { CourseGeneratingState } from './CourseGeneratingState';
import { cn } from '@/utils/cn';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const STYLES = ['Hands-on', 'Visual', 'Reading', 'Mixed'];
const LANGUAGES = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Portuguese'];

function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) {
      setDraft('');
      return;
    }
    onChange([...values, value]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-lg bg-secondary-bg px-2.5 py-1 text-xs text-secondary-text"
            >
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => onChange(values.filter((v) => v !== value))}
                className="rounded p-0.5 hover:bg-border"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CourseGenerateForm({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const form = useCourseStore((s) => s.form);
  const setForm = useCourseStore((s) => s.setForm);
  const hydrateFromDetail = useCourseStore((s) => s.hydrateFromDetail);
  const setGenerating = useCourseStore((s) => s.setGenerating);
  const generate = useGenerateCourseMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.skill.trim()) next.skill = 'Skill is required';
    if (!form.goal.trim()) next.goal = 'Goal is required';
    const days = form.duration_days ?? 0;
    if (days < 7 || days > 365) next.duration_days = 'Duration must be between 7 and 365 days';
    const hours = form.daily_hours ?? 0;
    if (hours < 0.5 || hours > 12) next.daily_hours = 'Daily hours must be between 0.5 and 12';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || generate.isPending) return;

    setGenerating(true);
    try {
      const course = await generate.mutateAsync({
        ...form,
        skill: form.skill.trim(),
        goal: form.goal.trim(),
        programming_language: form.programming_language?.trim() || form.skill.trim() || undefined,
        topics_include: form.topics_include?.filter(Boolean) ?? [],
        topics_exclude: form.topics_exclude?.filter(Boolean) ?? [],
        output_format: form.output_format ?? 'full',
      });

      if (course.status === 'FAILED') {
        toast.error('Course generation failed. Please try again.');
        return;
      }

      // Prefer chat-history detail (messages + content) when available
      let detail = course;
      try {
        if (course.course_id) {
          detail = await coursesApi.getChatHistory(course.course_id);
        } else if (course.session_id) {
          detail = await coursesApi.getChatHistoryBySession(course.session_id);
        }
      } catch {
        // Fall back to generate response
      }

      hydrateFromDetail(detail);
      toast.success('Course ready. Opening your learning path.');
      router.push(`${ROUTES.COURSES}/${detail.course_id || course.course_id}`);
    } catch (err) {
      const message = handleCourseApiError(err, 'Failed to generate course.');
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  if (generate.isPending) {
    return <CourseGeneratingState />;
  }

  return (
    <div className={cn(embedded ? 'space-y-6' : 'mx-auto max-w-3xl space-y-8')}>
      {!embedded && (
        <>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Create learning path
            </h1>
            <p className="mt-2 text-sm text-muted">
              Generation can take 30–90 seconds. Rate limit is about 5 requests per minute.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="font-heading text-base font-semibold text-foreground">Examples</h2>
            <CourseExampleCards onSelect={() => undefined} />
          </section>
        </>
      )}

      <form onSubmit={onSubmit} className="glass-card space-y-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="skill"
            label="Skill *"
            value={form.skill}
            onChange={(e) => setForm({ skill: e.target.value })}
            error={errors.skill}
            placeholder="Python"
          />
          <Input
            id="programming_language"
            label="Programming language"
            value={form.programming_language ?? ''}
            onChange={(e) => setForm({ programming_language: e.target.value })}
            placeholder="Python"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="goal" className="text-sm font-medium text-foreground">
            Goal *
          </label>
          <textarea
            id="goal"
            value={form.goal}
            onChange={(e) => setForm({ goal: e.target.value })}
            rows={3}
            placeholder="Become an AI Engineer"
            className={cn(
              'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30',
              errors.goal ? 'border-error' : 'border-border',
            )}
          />
          {errors.goal && <p className="text-xs text-error">{errors.goal}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current level</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ level: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Target level</label>
            <select
              value={form.target_level}
              onChange={(e) => setForm({ target_level: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Duration (days)</label>
            <span className="text-sm text-primary">{form.duration_days}</span>
          </div>
          <input
            type="range"
            min={7}
            max={365}
            step={1}
            value={form.duration_days ?? 60}
            onChange={(e) => setForm({ duration_days: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          {errors.duration_days && <p className="text-xs text-error">{errors.duration_days}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="daily_hours"
            label="Daily hours"
            type="number"
            min={0.5}
            max={12}
            step={0.5}
            value={form.daily_hours ?? 2}
            onChange={(e) => setForm({ daily_hours: Number(e.target.value) })}
            error={errors.daily_hours}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Learning style</label>
            <select
              value={form.learning_style}
              onChange={(e) => setForm({ learning_style: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              {STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Instruction language</label>
            <select
              value={form.language}
              onChange={(e) => setForm({ language: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Output format</label>
            <select
              value={form.output_format ?? 'full'}
              onChange={(e) =>
                setForm({
                  output_format: e.target.value as 'full' | 'roadmap_only' | 'compact',
                })
              }
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              <option value="full">Full course</option>
              <option value="roadmap_only">Roadmap only</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>

        <ChipInput
          label="Topics to include"
          values={form.topics_include ?? []}
          onChange={(topics_include) => setForm({ topics_include })}
          placeholder="e.g. ML"
        />
        <ChipInput
          label="Topics to exclude"
          values={form.topics_exclude ?? []}
          onChange={(topics_exclude) => setForm({ topics_exclude })}
          placeholder="e.g. DevOps"
        />

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-2xl"
          isLoading={generate.isPending}
        >
          Generate course
        </Button>
      </form>
    </div>
  );
}
