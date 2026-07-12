import type {
  PatternGenerateResponse,
  PatternHistoryDetail,
  PatternHistoryMessage,
  PatternOverview,
  PatternProgress,
  PatternRecognition,
} from '@/types/dsaPattern';

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
 * History detail may nest lesson sections under `content`.
 * Generate responses may be flat. Merge both into one record.
 */
function unwrapPatternPayload(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw) ?? {};
  const content = asRecord(root.content);
  const nested =
    content ??
    asRecord(root.pattern_lesson) ??
    asRecord(root.lesson) ??
    asRecord(root.data) ??
    asRecord(root.result);

  if (!nested) return root;
  return {
    ...nested,
    ...root,
    ...nested,
    session_id: root.session_id ?? nested.session_id,
    pattern_session_id: root.pattern_session_id ?? nested.pattern_session_id,
    title: root.title ?? nested.title,
    pattern: root.pattern ?? nested.pattern,
    level: root.level ?? nested.level,
    language: root.language ?? nested.language,
    learning_style: root.learning_style ?? nested.learning_style,
    status: root.status ?? nested.status,
    model_id: root.model_id ?? nested.model_id,
    mode_id: root.mode_id ?? nested.mode_id,
    messages: root.messages ?? nested.messages,
    created_at: root.created_at ?? nested.created_at,
    updated_at: root.updated_at ?? nested.updated_at,
  };
}

function buildOverview(raw: Record<string, unknown>): PatternOverview {
  const overview = asRecord(raw.overview) ?? {};
  const planner = asRecord(raw.planner) ?? {};
  const request = asRecord(raw.request) ?? {};

  return {
    pattern:
      asString(overview.pattern) ||
      asString(raw.pattern) ||
      asString(planner.pattern) ||
      asString(request.pattern) ||
      'Untitled pattern',
    definition: asString(overview.definition) || undefined,
    history: asString(overview.history) || undefined,
    why_it_exists: asString(overview.why_it_exists) || undefined,
    real_world_use_cases: asArray<string>(overview.real_world_use_cases),
    category: asString(overview.category) || asString(planner.category) || undefined,
    difficulty: asString(overview.difficulty) || asString(planner.difficulty) || undefined,
    prerequisites: asArray<string>(overview.prerequisites ?? planner.prerequisites),
    estimated_study_time:
      asString(overview.estimated_study_time) ||
      asString(planner.estimated_study_time) ||
      undefined,
    learning_objectives: asArray<string>(
      overview.learning_objectives ?? planner.learning_objectives,
    ),
    beginner_explanation: asString(overview.beginner_explanation) || undefined,
    intermediate_explanation: asString(overview.intermediate_explanation) || undefined,
    advanced_explanation: asString(overview.advanced_explanation) || undefined,
  };
}

function buildRecognition(raw: Record<string, unknown>): PatternRecognition {
  const recognition = asRecord(raw.recognition) ?? {};
  return {
    keywords: asArray<string>(recognition.keywords),
    signals: asArray<string>(recognition.signals),
    recognition_rules: asArray<string>(recognition.recognition_rules),
    decision_tree: asArray<string>(recognition.decision_tree),
    common_clues: asArray<string>(recognition.common_clues),
    checklist: asArray<string>(recognition.checklist),
    how_to_identify: asString(recognition.how_to_identify) || undefined,
  };
}

function buildProgress(raw: Record<string, unknown>): PatternProgress | undefined {
  const progress = asRecord(raw.progress);
  const patternSessionId =
    asString(progress?.pattern_session_id) || asString(raw.pattern_session_id);
  if (!patternSessionId) return undefined;
  return {
    pattern_session_id: patternSessionId,
    completion_pct: asNumber(progress?.completion_pct, 0),
    practice_completed: asNumber(progress?.practice_completed, 0),
    quiz_score: typeof progress?.quiz_score === 'number' ? progress.quiz_score : undefined,
    study_minutes: asNumber(progress?.study_minutes, 0),
    mastered: Boolean(progress?.mastered),
    completed: Boolean(progress?.completed),
  };
}

function normalizeMessages(raw: unknown): PatternHistoryMessage[] {
  return asArray<Record<string, unknown>>(raw).map((m, index) => ({
    id: asString(m.id, `msg-${index}`),
    role: asString(m.role, 'assistant'),
    agent_name: asNullableString(m.agent_name),
    content: asString(m.content) || asString(m.message),
    message: asString(m.message) || asString(m.content),
    created_at: asString(m.created_at, new Date().toISOString()),
  }));
}

export function normalizePatternResponse(
  raw: unknown,
): PatternHistoryDetail & PatternGenerateResponse {
  const data = unwrapPatternPayload(raw);
  const overview = buildOverview(data);
  const recognition = buildRecognition(data);
  const progress = buildProgress(data);

  return {
    ...(data as unknown as PatternGenerateResponse),
    session_id: asString(data.session_id),
    pattern_session_id: asString(data.pattern_session_id),
    status: asString(data.status, 'COMPLETED'),
    overview,
    recognition,
    progress,
    teacher_summary: asString(data.teacher_summary) || undefined,
    common_mistakes: asArray<string>(data.common_mistakes),
    templates: asArray(data.templates),
    pattern_comparison: asArray(data.pattern_comparison),
    execution_trace: asArray(data.execution_trace),
    title: asNullableString(data.title) ?? overview.pattern,
    pattern: asNullableString(data.pattern) ?? overview.pattern,
    level: asNullableString(data.level),
    language: asNullableString(data.language),
    learning_style: asNullableString(data.learning_style),
    model_id: asNullableString(data.model_id),
    mode_id: asNullableString(data.mode_id),
    created_at: asString(data.created_at) || undefined,
    updated_at: asString(data.updated_at) || undefined,
    messages: normalizeMessages(data.messages),
    total_messages: asNumber(data.total_messages, normalizeMessages(data.messages).length),
  };
}
