export type PatternStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | string;

export type PatternLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type PatternLearningStyle = 'Visual' | 'Conceptual' | 'Hands-on' | 'Interview';

export const PATTERN_SUGGESTIONS = [
  'Sliding Window',
  'DP',
  'Binary Search',
  'Trie',
  'Heap',
  'Graphs',
  'Union Find',
  'Backtracking',
  'Greedy',
  'Bit Manipulation',
  'Segment Tree',
  'Monotonic Stack',
  'Monotonic Queue',
] as const;

export const PATTERN_LEVELS: PatternLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export const PATTERN_LANGUAGES = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'Go',
  'Rust',
  'C#',
  'SQL',
] as const;

export const PATTERN_LEARNING_STYLES: PatternLearningStyle[] = [
  'Visual',
  'Conceptual',
  'Hands-on',
  'Interview',
];

export interface PatternGenerateRequest {
  pattern: string;
  level: string;
  language: string;
  learning_style: string;
  model_id?: string | null;
  mode_id?: string | null;
}

export interface PatternPlanner {
  pattern: string;
  category?: string;
  difficulty?: string;
  prerequisites?: string[];
  estimated_study_time?: string;
  learning_objectives?: string[];
  roadmap?: string[];
  execution_plan?: string[];
}

export interface PatternOverview {
  pattern: string;
  definition?: string;
  history?: string;
  why_it_exists?: string;
  real_world_use_cases?: string[];
  category?: string;
  difficulty?: string;
  prerequisites?: string[];
  estimated_study_time?: string;
  learning_objectives?: string[];
  beginner_explanation?: string;
  intermediate_explanation?: string;
  advanced_explanation?: string;
}

export interface PatternMentalModel {
  summary?: string;
  analogies?: string[];
  key_insights?: string[];
  intuition?: string;
}

export interface PatternRecognition {
  keywords?: string[];
  signals?: string[];
  recognition_rules?: string[];
  decision_tree?: string[];
  common_clues?: string[];
  checklist?: string[];
  how_to_identify?: string;
}

export interface PatternVisualization {
  ascii_diagrams?: string[];
  step_by_step?: string[];
  pointer_animation?: string;
  array_visualization?: string;
  graph_visualization?: string;
  tree_visualization?: string;
  recursion_stack?: string;
  queue_evolution?: string;
  stack_evolution?: string;
  frontend_notes?: string;
}

export interface PatternTemplate {
  language: string;
  template: string;
  description?: string;
  when_to_use?: string;
}

export interface PatternExampleWalkthrough {
  difficulty?: string;
  title?: string;
  problem_statement?: string;
  pattern_recognition?: string;
  approach?: string;
  dry_run?: string[];
  visualization?: string;
  code?: string;
  language?: string;
  line_by_line?: string[];
  time_complexity?: string;
  space_complexity?: string;
  edge_cases?: string[];
  common_mistakes?: string[];
}

export interface PatternInterviewTips {
  interview_questions?: string[];
  hints?: string[];
  expected_thought_process?: string[];
  follow_up_questions?: string[];
  optimization_discussion?: string[];
}

export interface PatternComparisonItem {
  other_pattern: string;
  when_to_choose_this?: string;
  when_to_choose_other?: string;
  key_differences?: string[];
  summary?: string;
}

export interface PatternPracticeProblem {
  title: string;
  difficulty?: string;
  platform?: string;
  url?: string;
  why?: string;
  tags?: string[];
}

export interface PatternPractice {
  roadmap?: string[];
  easy?: PatternPracticeProblem[];
  medium?: PatternPracticeProblem[];
  hard?: PatternPracticeProblem[];
  interview?: PatternPracticeProblem[];
  contest?: PatternPracticeProblem[];
  revision?: PatternPracticeProblem[];
}

export interface PatternQuizQuestion {
  type?: string;
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  difficulty?: string;
}

export interface PatternFlashcard {
  front: string;
  back: string;
}

export interface PatternQuiz {
  title?: string;
  mcqs?: PatternQuizQuestion[];
  recognition_questions?: PatternQuizQuestion[];
  scenario_questions?: PatternQuizQuestion[];
  coding_questions?: PatternQuizQuestion[];
  flashcards?: PatternFlashcard[];
  mini_assessment?: PatternQuizQuestion[];
}

export interface PatternNextRecommendation {
  pattern: string;
  reason?: string;
  prerequisites_met?: boolean | string[];
  estimated_study_time?: string;
}

export interface PatternProgress {
  pattern_session_id: string;
  completion_pct?: number;
  practice_completed?: number;
  quiz_score?: number;
  study_minutes?: number;
  mastered?: boolean;
  completed?: boolean;
}

export interface PatternUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  latency_ms?: number;
  execution_time_ms?: number;
  estimated_cost?: number;
  model?: string;
  feature?: string;
}

export interface PatternExecutionTraceNode {
  node: string;
  status: string;
}

/** Source of truth for the pattern lesson workspace. */
export interface PatternGenerateResponse {
  session_id: string;
  pattern_session_id: string;
  status: PatternStatus;
  request?: PatternGenerateRequest;
  planner?: PatternPlanner;
  overview?: PatternOverview;
  mental_model?: PatternMentalModel;
  recognition?: PatternRecognition;
  visualization?: PatternVisualization;
  templates?: PatternTemplate[];
  easy_example?: PatternExampleWalkthrough;
  medium_example?: PatternExampleWalkthrough;
  hard_example?: PatternExampleWalkthrough;
  common_mistakes?: string[];
  interview_tips?: PatternInterviewTips;
  pattern_comparison?: PatternComparisonItem[];
  practice?: PatternPractice;
  quiz?: PatternQuiz;
  next_pattern_recommendation?: PatternNextRecommendation;
  teacher_summary?: string;
  progress?: PatternProgress;
  usage?: PatternUsage;
  execution_trace?: PatternExecutionTraceNode[];
}

export interface PatternFollowUpRequest {
  session_id: string;
  question: string;
}

export interface PatternFollowUpResponse {
  session_id: string;
  intent?: string;
  teacher?: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  latency_ms?: number;
  execution_time_ms?: number;
  context_match?: boolean;
  rejected?: boolean;
  [key: string]: unknown;
}

export interface PatternHistoryItem {
  session_id: string;
  pattern_session_id?: string;
  pattern?: string;
  title?: string;
  level?: string | null;
  language?: string | null;
  learning_style?: string | null;
  status?: PatternStatus | string;
  model_id?: string | null;
  completion_pct?: number;
  preview?: string | null;
  message_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface PatternHistoryMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | string;
  agent_name?: string | null;
  content: string;
  message?: string;
  created_at: string;
  intent?: string;
  rejected?: boolean;
  context_match?: boolean;
}

export interface PatternHistoryListResponse {
  items: PatternHistoryItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface PatternHistoryDetail extends PatternGenerateResponse {
  title?: string | null;
  pattern?: string | null;
  level?: string | null;
  language?: string | null;
  learning_style?: string | null;
  model_id?: string | null;
  mode_id?: string | null;
  created_at?: string;
  updated_at?: string;
  messages?: PatternHistoryMessage[];
  total_messages?: number;
}

export interface PatternChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | string;
  agent_name?: string | null;
  content: string;
  created_at: string;
  intent?: string;
  rejected?: boolean;
  context_match?: boolean;
  isStreaming?: boolean;
}

export interface PatternProgressUpdateRequest {
  pattern_session_id: string;
  practice_completed_delta?: number;
  quizzes_completed_delta?: number;
  quiz_score?: number;
  study_minutes_delta?: number;
  completion_pct?: number;
  mark_completed?: boolean;
  mark_mastered?: boolean;
}

export interface PatternMasteryItem {
  pattern: string;
  completion_pct?: number;
  mastered?: boolean;
  quiz_score?: number;
  study_minutes?: number;
  last_studied_at?: string;
}

export interface PatternDashboard {
  patterns_learned?: number;
  patterns_mastered?: number;
  learning_streak?: number;
  quiz_average?: number;
  study_minutes?: number;
  weak_patterns?: string[];
  strong_patterns?: string[];
  recommended_next?: PatternNextRecommendation | string | null;
  mastery?: PatternMasteryItem[];
  recent_sessions?: PatternHistoryItem[];
  progress?: PatternProgress | PatternProgress[];
}

export interface PatternExample {
  id?: string;
  title?: string;
  pattern: string;
  level?: string;
  language?: string;
  learning_style?: string;
  description?: string;
  icon?: string;
}

export type PatternExportInclude =
  | 'overview'
  | 'mental_model'
  | 'recognition'
  | 'visualization'
  | 'templates'
  | 'examples'
  | 'interview_tips'
  | 'pattern_comparison'
  | 'practice'
  | 'quiz'
  | 'next_pattern';

export interface PatternExportRequest {
  pattern_session_id: string;
  include?: PatternExportInclude[];
}

export type PatternExportFormat = 'markdown' | 'json' | 'pdf';

export interface PatternExportResponse {
  pattern_session_id?: string;
  format?: string;
  filename: string;
  content: string;
  content_type: string;
}

export const PATTERN_EXPORT_ALL_SECTIONS: PatternExportInclude[] = [
  'overview',
  'mental_model',
  'recognition',
  'visualization',
  'templates',
  'examples',
  'interview_tips',
  'pattern_comparison',
  'practice',
  'quiz',
  'next_pattern',
];
