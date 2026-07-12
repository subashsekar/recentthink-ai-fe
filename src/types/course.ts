export type CourseStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'MANUAL_REQUIRED';

export type CourseOutputFormat = 'full' | 'roadmap_only' | 'compact';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | string;

export interface CourseGenerateRequest {
  skill: string;
  goal: string;
  level?: string;
  target_level?: string;
  duration_days?: number;
  daily_hours?: number;
  learning_style?: string;
  language?: string;
  programming_language?: string;
  topics_include?: string[];
  topics_exclude?: string[];
  output_format?: CourseOutputFormat;
  model_id?: string | null;
  mode_id?: string | null;
}

export interface CourseOverview {
  title: string;
  description: string;
  difficulty: string;
  estimated_duration_days: number;
  estimated_study_hours: number;
  learning_objectives: string[];
  prerequisites: string[];
  expected_outcomes: string[];
}

export interface CoursePlanner {
  skill: string;
  goal: string;
  difficulty: string;
  duration_days: number;
  daily_hours: number;
  estimated_study_hours: number;
  learning_objectives: string[];
  prerequisites: string[];
  roadmap_outline: string[];
  milestones: string[];
  execution_plan: string[];
}

export interface CourseDailyTopic {
  day?: number;
  topic: string;
  study_hours?: number;
  activity_type?: string;
}

export interface CourseRoadmapWeek {
  week: number;
  title: string;
  focus: string;
  daily_topics: CourseDailyTopic[];
  study_hours?: number;
  milestones: string[];
  is_revision_week: boolean;
  is_project_week: boolean;
  is_assessment_week: boolean;
}

export interface CourseLesson {
  id?: string;
  week?: number;
  title: string;
  objectives: string[];
  concept_explanation: string;
  examples: string;
  visual_analogies: string;
  common_mistakes: string;
  best_practices: string;
  summary: string;
}

export interface CourseQuizQuestion {
  type: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: string;
}

export interface CourseFlashcard {
  front: string;
  back: string;
}

export interface CourseQuiz {
  id?: string;
  week?: number;
  title: string;
  questions: CourseQuizQuestion[];
  flashcards: CourseFlashcard[];
}

export interface CourseAssignment {
  id?: string;
  week?: number;
  title: string;
  type: string;
  description: string;
  tasks: string[];
  coding_exercises: string[];
  review_questions: string[];
  estimated_hours?: number;
}

export interface CourseProject {
  id?: string;
  title: string;
  level: string;
  description: string;
  requirements: string[];
  architecture: string;
  implementation_steps: string[];
  expected_output: string;
  evaluation_criteria: string[];
  is_resume_project: boolean;
}

export interface CourseAssessment {
  id?: string;
  week?: number;
  title: string;
  type: string;
  questions: Array<string | Record<string, unknown>>;
  rubric: string | Record<string, unknown> | unknown;
  scoring: string | Record<string, unknown> | unknown;
  completion_criteria: string | Record<string, unknown> | unknown;
}

export interface CourseResource {
  title: string;
  type: string;
  url?: string;
  description: string;
  week?: number;
}

export interface CourseAdaptiveTips {
  struggling: string[];
  excelling: string[];
}

export interface CourseProgress {
  course_id: string;
  current_week: number;
  current_lesson: number;
  completion_pct: number;
  lessons_completed: number;
  quizzes_completed: number;
  projects_completed: number;
  study_hours: number;
}

export interface CourseUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  execution_time_ms: number;
  estimated_cost: number;
  model: string;
  feature: string;
}

export interface CourseExecutionTraceNode {
  node: string;
  status: string;
}

/** Source of truth for the course workspace. */
export interface CourseGenerateResponse {
  session_id: string;
  course_id: string;
  status: CourseStatus;
  overview: CourseOverview;
  planner: CoursePlanner;
  roadmap: CourseRoadmapWeek[];
  lessons: CourseLesson[];
  quizzes: CourseQuiz[];
  assignments: CourseAssignment[];
  projects: CourseProject[];
  assessments: CourseAssessment[];
  resources: CourseResource[];
  learning_tips: string[];
  next_recommendations: string[];
  adaptive: CourseAdaptiveTips;
  teacher_summary: string;
  progress: CourseProgress;
  usage: CourseUsage;
  execution_trace: CourseExecutionTraceNode[];
}

export interface CourseFollowUpRequest {
  session_id: string;
  question: string;
}

export interface CourseFollowUpResponse {
  session_id: string;
  intent?: string;
  teacher?: string;
  total_tokens?: number;
  execution_time_ms?: number;
  [key: string]: unknown;
}

export interface CourseHistoryItem {
  course_id: string;
  session_id: string;
  title: string;
  skill: string | null;
  goal: string | null;
  level: string | null;
  status: CourseStatus | string;
  model_id?: string | null;
  completion_pct: number;
  preview?: string | null;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CourseHistoryMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | string;
  agent_name?: string | null;
  /** Normalized from API `message` field */
  content: string;
  message?: string;
  created_at: string;
}

export interface CourseHistoryListResponse {
  items: CourseHistoryItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface CourseHistoryDetail extends CourseGenerateResponse {
  title?: string | null;
  skill?: string | null;
  goal?: string | null;
  level?: string | null;
  model_id?: string | null;
  mode_id?: string | null;
  created_at?: string;
  updated_at?: string;
  messages: CourseHistoryMessage[];
  total_messages?: number;
}

/** Alias for chat-history detail contract */
export type CourseChatHistoryDetail = CourseHistoryDetail;

export interface CourseChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | string;
  agent_name?: string | null;
  content: string;
  created_at: string;
}

export interface CourseProgressUpdateRequest {
  course_id: string;
  current_week?: number;
  current_lesson?: number;
  lessons_completed_delta?: number;
  quizzes_completed_delta?: number;
  projects_completed_delta?: number;
  study_hours_delta?: number;
  completion_pct?: number;
  mark_completed?: boolean;
}

export interface CourseDashboard {
  courses_created?: number;
  courses_completed?: number;
  lessons_completed?: number;
  quizzes_completed?: number;
  projects_completed?: number;
  learning_streak?: number;
  study_hours?: number;
  favorite_skill?: string;
  active_course?: CourseHistoryItem | null;
  recent?: CourseHistoryItem[];
  progress?: CourseProgress | CourseProgress[];
}

export interface CourseExample {
  id?: string;
  title?: string;
  skill: string;
  goal: string;
  level?: string;
  target_level?: string;
  duration_days?: number;
  daily_hours?: number;
  learning_style?: string;
  language?: string;
  programming_language?: string;
  topics_include?: string[];
  topics_exclude?: string[];
  description?: string;
  icon?: string;
}

export interface CourseAdaptiveRequest {
  course_id: string;
  score_pct: number;
  week?: number;
  topic?: string;
}

export type CourseAdaptivePerformance = 'struggling' | 'on_track' | 'excelling';

export interface CourseAdaptiveResponse {
  performance: CourseAdaptivePerformance;
  recommendations: string[];
  unlock_advanced: boolean;
  skip_basics: boolean;
}

export type CourseBookmarkItemType =
  'lesson' | 'quiz' | 'assignment' | 'project' | 'assessment' | 'resource' | string;

export interface CourseBookmarkRequest {
  course_id: string;
  item_type: CourseBookmarkItemType;
  item_id: string;
  title: string;
}

export type CourseExportInclude =
  'roadmap' | 'lessons' | 'projects' | 'assignments' | 'quiz' | 'assessment' | 'resources';

export interface CourseExportRequest {
  course_id: string;
  include?: CourseExportInclude[];
}

export type CourseExportFormat = 'markdown' | 'pdf';

/** Markdown export API response. */
export interface CourseExportResponse {
  course_id: string;
  format: 'markdown';
  filename: string;
  content: string;
  content_type: string;
}

/** @deprecated Use CourseExportResponse */
export type CourseExportFileResponse = CourseExportResponse;

export const COURSE_EXPORT_ALL_SECTIONS: CourseExportInclude[] = [
  'roadmap',
  'lessons',
  'projects',
  'assignments',
  'quiz',
  'assessment',
  'resources',
];
