'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Bookmark, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCourseDashboard } from '@/hooks/courses/useCourseQueries';
import {
  useCourseBookmarkMutation,
  useDeleteCourseMutation,
} from '@/hooks/courses/useCourseMutations';
import { handleCourseApiError } from '@/utils/courseError';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';
import { useCourseStore } from '@/store/courseStore';
import type { CourseHistoryDetail } from '@/types/course';
import { CourseExportMenu } from './CourseExportMenu';
import { CourseModelSelector } from './CourseModelSelector';
import { OverviewTab } from './tabs/OverviewTab';
import { RoadmapTab } from './tabs/RoadmapTab';
import { LessonsTab } from './tabs/LessonsTab';
import { QuizzesTab } from './tabs/QuizzesTab';
import { AssignmentsTab } from './tabs/AssignmentsTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { AssessmentsTab } from './tabs/AssessmentsTab';
import { ResourcesTab } from './tabs/ResourcesTab';
import { ChatTab } from './tabs/ChatTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'projects', label: 'Projects' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'resources', label: 'Resources' },
  { id: 'chat', label: 'Chat' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface CourseWorkspaceProps {
  course: CourseHistoryDetail;
}

export function CourseWorkspace({ course }: CourseWorkspaceProps) {
  const router = useRouter();
  const { data: dashboard } = useCourseDashboard();
  const [tab, setTab] = useState<TabId>('overview');
  const followUpRef = useRef<HTMLDivElement>(null);

  const bookmark = useCourseBookmarkMutation();
  const deleteCourse = useDeleteCourseMutation();

  const exportCourseId = course.course_id;
  const title = course.overview?.title || course.title || course.skill || 'Untitled course';
  const skill = course.planner?.skill || course.skill;
  const goal = course.planner?.goal || course.goal;

  const visibleTabs = useMemo(() => {
    return TABS.filter((t) => {
      if (t.id === 'overview' || t.id === 'chat') return true;
      if (t.id === 'roadmap') return (course.roadmap?.length ?? 0) > 0;
      if (t.id === 'lessons') return (course.lessons?.length ?? 0) > 0;
      if (t.id === 'quizzes') return (course.quizzes?.length ?? 0) > 0;
      if (t.id === 'assignments') return (course.assignments?.length ?? 0) > 0;
      if (t.id === 'projects') return (course.projects?.length ?? 0) > 0;
      if (t.id === 'assessments') return (course.assessments?.length ?? 0) > 0;
      if (t.id === 'resources') return (course.resources?.length ?? 0) > 0;
      return true;
    });
  }, [course]);

  const openFollowUp = () => {
    setTab('chat');
    window.requestAnimationFrame(() => {
      followUpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const onBookmark = async () => {
    try {
      await bookmark.mutateAsync({
        course_id: exportCourseId,
        item_type: 'lesson',
        item_id: course.lessons?.[0]?.id ?? 'overview',
        title,
      });
      toast.success('Bookmarked');
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Failed to bookmark.'));
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this course from history?')) return;
    try {
      await deleteCourse.mutateAsync(exportCourseId);
      toast.success('Course deleted successfully.');
      useCourseStore.setState({
        selectedCourseId: null,
        detail: null,
        showNewForm: true,
        isGenerating: false,
      });
      router.push(ROUTES.COURSES);
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Failed to delete course.'));
    }
  };

  const progress = course.progress;
  const streak = dashboard?.learning_streak;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0 space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Course workspace
            </p>
            <h1 className="mt-1 truncate font-heading text-2xl font-semibold text-foreground">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {[skill, goal].filter(Boolean).join(' → ') || course.level || 'Learning path'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <CourseModelSelector compact menuPlacement="below" />
            <CourseExportMenu courseId={exportCourseId} />
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => void onBookmark()}
              isLoading={bookmark.isPending}
            >
              <Bookmark size={16} />
              Bookmark
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="rounded-xl"
              onClick={() => void onDelete()}
              isLoading={deleteCourse.isPending}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </header>

        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-none">
          {visibleTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'chat') openFollowUp();
                else setTab(item.id);
              }}
              className={cn(
                'shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                tab === item.id
                  ? 'bg-primary text-white'
                  : 'text-secondary-text hover:bg-secondary-bg hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="min-h-[320px] rounded-2xl border border-border bg-surface/40 p-4 sm:p-6">
          {tab === 'overview' && <OverviewTab course={course} />}
          {tab === 'roadmap' && <RoadmapTab course={course} />}
          {tab === 'lessons' && <LessonsTab course={course} />}
          {tab === 'quizzes' && <QuizzesTab course={course} />}
          {tab === 'assignments' && <AssignmentsTab course={course} />}
          {tab === 'projects' && <ProjectsTab course={course} />}
          {tab === 'assessments' && <AssessmentsTab course={course} />}
          {tab === 'resources' && <ResourcesTab course={course} />}
          {tab === 'chat' && (
            <p className="text-sm text-muted">
              Follow-up chat stays scoped to this course session — use the composer below.
            </p>
          )}
        </div>

        <div ref={followUpRef} id="course-follow-up">
          <ChatTab key={course.session_id ?? 'no-session'} course={course} variant="panel" />
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface/40 p-5 lg:sticky lg:top-4">
        <h2 className="font-heading text-sm font-semibold text-foreground">Progress</h2>
        {progress ? (
          <>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Completion</span>
                <span>{progress.completion_pct ?? 0}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary-bg">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress.completion_pct ?? 0))}%`,
                  }}
                />
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Week</dt>
                <dd className="font-medium text-foreground">{progress.current_week}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Lesson</dt>
                <dd className="font-medium text-foreground">{progress.current_lesson}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Lessons done</dt>
                <dd className="font-medium text-foreground">{progress.lessons_completed}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Quizzes done</dt>
                <dd className="font-medium text-foreground">{progress.quizzes_completed}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Projects done</dt>
                <dd className="font-medium text-foreground">{progress.projects_completed}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Study hours</dt>
                <dd className="font-medium text-foreground">{progress.study_hours}</dd>
              </div>
              {streak != null && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Streak</dt>
                  <dd className="font-medium text-foreground">{streak} days</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" />
            No progress yet
          </div>
        )}

        <Button size="sm" variant="outline" className="w-full rounded-xl" onClick={openFollowUp}>
          Open follow-up chat
        </Button>
      </aside>
    </div>
  );
}
