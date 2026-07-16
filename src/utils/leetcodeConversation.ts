export type MentorMessageRole = 'user' | 'assistant';

export interface MentorConversationMessage {
  id: string;
  role: MentorMessageRole;
  content: string;
  createdAt: string;
  /** @deprecated Analysis lives in SessionReport, not in the chat panel. */
  isAnalysis?: boolean;
  isStreaming?: boolean;
}
