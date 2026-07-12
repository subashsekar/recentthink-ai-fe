import type {
  CourseGenerateResponse,
  CourseHistoryDetail,
  CourseHistoryMessage,
  CourseOverview,
  CourseProgress,
} from '@/types/course';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * History detail nests course sections under `content`.
 * Generate responses may be flat. Merge both into one record.
 */
function unwrapCoursePayload(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw) ?? {};
  const content = asRecord(root.content);
  const nested = content ?? asRecord(root.course) ?? asRecord(root.data) ?? asRecord(root.result);

  if (!nested) return root;
  return {
    ...nested,
    ...root,
    ...nested,
    // Prefer top-level ids/meta from root when present
    course_id: root.course_id ?? nested.course_id,
    session_id: root.session_id ?? nested.session_id,
    title: root.title ?? nested.title,
    skill: root.skill ?? nested.skill,
    goal: root.goal ?? nested.goal,
    level: root.level ?? nested.level,
    status: root.status ?? nested.status,
    model_id: root.model_id ?? nested.model_id,
    mode_id: root.mode_id ?? nested.mode_id,
    messages: root.messages ?? nested.messages,
    created_at: root.created_at ?? nested.created_at,
    updated_at: root.updated_at ?? nested.updated_at,
  };
}

function buildOverview(raw: Record<string, unknown>): CourseOverview {
  const overview = asRecord(raw.overview) ?? {};
  const planner = asRecord(raw.planner) ?? {};

  return {
    title:
      asString(overview.title) ||
      asString(raw.title) ||
      asString(planner.skill) ||
      asString(raw.skill) ||
      'Untitled course',
    description:
      asString(overview.description) ||
      asString(raw.description) ||
      asString(planner.goal) ||
      asString(raw.goal) ||
      '',
    difficulty:
      asString(overview.difficulty) ||
      asString(raw.difficulty) ||
      asString(planner.difficulty) ||
      asString(raw.level) ||
      '',
    estimated_duration_days: asNumber(
      overview.estimated_duration_days,
      asNumber(planner.duration_days, asNumber(raw.duration_days)),
    ),
    estimated_study_hours: asNumber(
      overview.estimated_study_hours,
      asNumber(planner.estimated_study_hours),
    ),
    learning_objectives: asArray<string>(
      overview.learning_objectives ?? planner.learning_objectives,
    ),
    prerequisites: asArray<string>(overview.prerequisites ?? planner.prerequisites),
    expected_outcomes: asArray<string>(overview.expected_outcomes),
  };
}

function buildProgress(raw: Record<string, unknown>, courseId: string): CourseProgress {
  const progress = asRecord(raw.progress) ?? {};
  return {
    course_id: asString(progress.course_id, courseId),
    current_week: asNumber(progress.current_week, 1),
    current_lesson: asNumber(progress.current_lesson, 1),
    completion_pct: asNumber(progress.completion_pct, asNumber(raw.completion_pct)),
    lessons_completed: asNumber(progress.lessons_completed),
    quizzes_completed: asNumber(progress.quizzes_completed),
    projects_completed: asNumber(progress.projects_completed),
    study_hours: asNumber(progress.study_hours),
  };
}

function normalizeMessages(raw: unknown): CourseHistoryMessage[] {
  return asArray<Record<string, unknown>>(raw).map((item, index) => {
    const content = asString(item.message) || asString(item.content) || asString(item.text) || '';
    return {
      id: asString(item.id, `msg-${index}`),
      role: asString(item.role, 'assistant'),
      agent_name: asNullableString(item.agent_name),
      content,
      message: content,
      created_at: asString(item.created_at, new Date().toISOString()),
    };
  });
}

/** Normalize generate / history-detail payloads into a stable workspace shape. */
export function normalizeCourseResponse(raw: unknown): CourseHistoryDetail {
  const data = unwrapCoursePayload(raw);
  const courseId = asString(data.course_id, asString(data.id));
  const sessionId = asString(data.session_id);
  const overview = buildOverview(data);
  const planner = asRecord(data.planner);
  const adaptive = asRecord(data.adaptive);

  return {
    ...(data as unknown as CourseGenerateResponse),
    session_id: sessionId,
    course_id: courseId,
    title: asNullableString(data.title) ?? overview.title,
    skill: asNullableString(data.skill) ?? asNullableString(planner?.skill),
    goal: asNullableString(data.goal) ?? asNullableString(planner?.goal),
    level: asNullableString(data.level),
    model_id: asNullableString(data.model_id),
    mode_id: asNullableString(data.mode_id),
    status: asString(data.status, 'COMPLETED') as CourseGenerateResponse['status'],
    overview,
    planner: {
      skill: asString(planner?.skill, asString(data.skill)),
      goal: asString(planner?.goal, asString(data.goal)),
      difficulty: asString(planner?.difficulty, overview.difficulty),
      duration_days: asNumber(planner?.duration_days, overview.estimated_duration_days),
      daily_hours: asNumber(planner?.daily_hours),
      estimated_study_hours: asNumber(
        planner?.estimated_study_hours,
        overview.estimated_study_hours,
      ),
      learning_objectives: asArray<string>(
        planner?.learning_objectives ?? overview.learning_objectives,
      ),
      prerequisites: asArray<string>(planner?.prerequisites ?? overview.prerequisites),
      roadmap_outline: asArray<string>(planner?.roadmap_outline),
      milestones: asArray<string>(planner?.milestones),
      execution_plan: asArray<string>(planner?.execution_plan),
    },
    roadmap: asArray(data.roadmap),
    lessons: asArray(data.lessons),
    quizzes: asArray(data.quizzes),
    assignments: asArray(data.assignments),
    projects: asArray(data.projects),
    assessments: asArray(data.assessments),
    resources: asArray(data.resources),
    learning_tips: asArray(data.learning_tips),
    next_recommendations: asArray(data.next_recommendations),
    adaptive: {
      struggling: asArray<string>(adaptive?.struggling),
      excelling: asArray<string>(adaptive?.excelling),
    },
    teacher_summary: asString(data.teacher_summary),
    progress: buildProgress(data, courseId),
    usage: {
      input_tokens: asNumber(asRecord(data.usage)?.input_tokens),
      output_tokens: asNumber(asRecord(data.usage)?.output_tokens),
      total_tokens: asNumber(asRecord(data.usage)?.total_tokens),
      latency_ms: asNumber(asRecord(data.usage)?.latency_ms),
      execution_time_ms: asNumber(asRecord(data.usage)?.execution_time_ms),
      estimated_cost: asNumber(asRecord(data.usage)?.estimated_cost),
      model: asString(asRecord(data.usage)?.model),
      feature: asString(asRecord(data.usage)?.feature),
    },
    execution_trace: asArray(data.execution_trace),
    messages: normalizeMessages(data.messages),
    total_messages: asNumber(data.total_messages, asArray(data.messages).length),
    created_at: asString(data.created_at),
    updated_at: asString(data.updated_at),
  };
}
