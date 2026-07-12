'use client';

import { use } from 'react';
import { CourseAgentPage } from '@/components/courses/CourseAgentPage';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <CourseAgentPage courseId={courseId} />;
}
