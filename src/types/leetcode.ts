export type LeetCodeAgentRole = 'planner' | 'teacher' | 'coder' | 'evaluator';

export interface LeetCodeAnalyzeRequest {
  problem_url?: string;
  problem_statement?: string;
  model_id?: string;
  mode_id?: string;
}

export interface LeetCodeFollowUpRequest {
  session_id: string;
  question: string;
  /** Backend field name is `model`; we accept `model_id` in the UI layer. */
  model_id?: string;
  model?: string;
  mode_id?: string;
}

export interface LeetCodeMode {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  recommended?: boolean;
}

export type ModeInfo = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  recommended: boolean;
};

export type { ModelInfo, ModelsResponse } from '@/types/ai-models';

/** @deprecated Use ModelInfo from @/types/ai-models */
export type AiModel = import('@/types/ai-models').ModelInfo;

export interface SessionStats {
  current_model?: string;
  execution_time_ms?: number;
  session_duration_ms?: number;
  token_usage?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  estimated_cost_usd?: number;
  difficulty?: string;
  pattern?: string;
  tags?: string[];
  problem_tags?: string[];
  problem_status?: string;
  current_streak?: number;
  problems_solved?: number;
  average_complexity?: string;
  learning_score?: number;
}

export interface LeetCodeSessionSummary {
  session_id: string;
  title: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  model_id?: string;
  mode_id?: string;
  messages_count?: number;
  tokens_used?: number;
  stats?: SessionStats;
}

export interface LeetCodeAgentMessage {
  id?: string;
  role: LeetCodeAgentRole;
  content: string;
  created_at?: string;
  meta?: Record<string, unknown>;
}

export interface LeetCodeSessionDetail {
  session_id: string;
  title: string;
  url?: string;
  problem_statement?: string;
  problem_statement_markdown?: string;
  problem_statement_html?: string;
  model_id?: string;
  mode_id?: string;
  created_at: string;
  updated_at: string;
  messages: LeetCodeAgentMessage[];
  stats?: SessionStats;
  memory?: Record<string, unknown>;
}

export type LeetCodeStreamEvent =
  | {
      type: 'problem_statement';
      session_id?: string;
      content?: string;
      problem_statement?: string;
      problem_statement_markdown?: string;
      problem_statement_html?: string;
      delta?: string;
    }
  | {
      type: 'delta';
      session_id: string;
      role: LeetCodeAgentRole;
      delta: string;
    }
  | {
      type: 'message';
      session_id: string;
      role: LeetCodeAgentRole | 'problem' | 'problem_statement';
      content: string;
    }
  | {
      type: 'stats';
      session_id: string;
      stats: SessionStats;
    }
  | {
      type: 'session';
      session: LeetCodeSessionDetail;
    }
  | {
      type: 'done';
      session_id: string;
    }
  | {
      type: 'complete';
      session_id?: string;
      status?: string;
      message?: string;
      instructions?: string[];
      problem?: Record<string, unknown>;
      planner?: Record<string, unknown> | string;
      teacher?: string;
      coder?: Record<string, unknown> | string;
      evaluator?: Record<string, unknown> | string;
      total_tokens?: number;
      total_execution_time_ms?: number;
      mode_id?: string;
    }
  | {
      type: 'error';
      message: string;
      detail?: unknown;
    };

export interface LeetCodeExamplesItem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  pattern: string;
  url: string;
  icon?: string;
}

export interface LeetCodeProgress {
  solved: number;
  attempted: number;
  easy: number;
  medium: number;
  hard: number;
  weak_topics?: string[];
  strong_topics?: string[];
  favorite_pattern?: string;
  current_streak?: number;
  longest_streak?: number;
}
