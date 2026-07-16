export type FollowUpFeature = 'leetcode' | 'hackerrank' | 'dsa_pattern' | 'course_generator';

export type FollowUpUiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  rejected?: boolean;
  contextMatch?: boolean;
  createdAt: string;
  isStreaming?: boolean;
};

export type FollowUpChatStatus =
  'idle' | 'sending' | 'streaming' | 'accepted' | 'rejected' | 'error';

export interface FollowUpRequestBody {
  session_id: string;
  question: string;
  model?: string | null;
  mode_id?: string | null;
}

export interface FollowUpNormalizedResult {
  sessionId?: string;
  intent?: string;
  teacher: string;
  contextMatch: boolean;
  rejected: boolean;
  raw: unknown;
}

export type FollowUpStreamEvent =
  | { type: 'status'; status?: string; message?: string }
  | { type: 'delta'; role?: string; delta: string; session_id?: string }
  | { type: 'message'; role?: string; content: string; session_id?: string }
  | {
      type: 'complete';
      session_id?: string;
      response?: unknown;
      teacher?: unknown;
      intent?: string;
      context_match?: boolean;
      rejected?: boolean;
      [key: string]: unknown;
    }
  | { type: 'error'; message: string; detail?: unknown }
  | { type: 'done'; session_id?: string }
  | { type: string; [key: string]: unknown };
