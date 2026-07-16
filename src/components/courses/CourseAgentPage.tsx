'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { IconRail } from '@/components/leetcode-agent/IconRail';
import { CourseHistorySidebar } from './CourseHistorySidebar';
import { CourseWorkspaceContent } from './CourseWorkspaceContent';
import { useCourseStore } from '@/store/courseStore';
import { coursesApi } from '@/services/api/courses';
import { handleCourseApiError } from '@/utils/courseError';

interface CourseAgentPageProps {
  courseId?: string | null;
  mode?: 'default' | 'new';
}

export function CourseAgentPage({ courseId = null, mode = 'default' }: CourseAgentPageProps) {
  const selectedCourseId = useCourseStore((s) => s.selectedCourseId);
  const detailCourseId = useCourseStore((s) => s.detail?.course_id ?? null);

  useEffect(() => {
    if (mode === 'new') {
      useCourseStore.setState({
        selectedCourseId: null,
        detail: null,
        showNewForm: true,
        isGenerating: false,
      });
      return;
    }

    if (!courseId) return;
    if (selectedCourseId === courseId && detailCourseId === courseId) return;

    useCourseStore.setState({ selectedCourseId: courseId, showNewForm: false });

    let cancelled = false;

    void (async () => {
      try {
        const next = await coursesApi.getChatHistory(courseId);
        if (!cancelled) {
          useCourseStore.getState().hydrateFromDetail(next);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(handleCourseApiError(err, 'Failed to load course.'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId, mode, selectedCourseId, detailCourseId]);

  return (
    <div className="min-h-0 w-full max-w-full overflow-x-hidden">
      <div className="grid min-h-0 w-full max-w-full grid-cols-1 gap-4 overflow-x-hidden lg:grid-cols-[72px_300px_minmax(0,1fr)] lg:gap-5">
        <IconRail />
        <CourseHistorySidebar />
        <CourseWorkspaceContent />
      </div>
    </div>
  );
}
