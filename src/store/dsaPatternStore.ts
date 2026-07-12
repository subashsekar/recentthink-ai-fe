'use client';

import { create } from 'zustand';
import type {
  PatternChatMessage,
  PatternExample,
  PatternGenerateRequest,
  PatternHistoryDetail,
  PatternHistoryMessage,
} from '@/types/dsaPattern';

const defaultForm: PatternGenerateRequest = {
  pattern: '',
  level: 'Beginner',
  language: 'Python',
  learning_style: 'Visual',
  model_id: null,
  mode_id: null,
};

function toChatMessages(messages: PatternHistoryMessage[] | undefined): PatternChatMessage[] {
  return (messages ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    agent_name: m.agent_name,
    content: m.content || m.message || '',
    created_at: m.created_at,
  }));
}

interface DsaPatternStore {
  form: PatternGenerateRequest;
  selectedSessionId: string | null;
  detail: PatternHistoryDetail | null;
  showNewForm: boolean;
  isGenerating: boolean;
  followUpLoading: boolean;
  error?: string;
  chatBySession: Record<string, PatternChatMessage[]>;

  setForm: (patch: Partial<PatternGenerateRequest>) => void;
  resetForm: () => void;
  applyExample: (example: PatternExample) => void;
  prefillPattern: (pattern: string) => void;
  startNewLesson: () => void;
  setSelectedSessionId: (sessionId: string | null) => void;
  hydrateFromDetail: (detail: PatternHistoryDetail) => void;
  clearDetail: () => void;
  setGenerating: (value: boolean) => void;
  setFollowUpLoading: (value: boolean) => void;
  setError: (error?: string) => void;
  appendChat: (sessionId: string, message: PatternChatMessage) => void;
  setChat: (sessionId: string, messages: PatternChatMessage[]) => void;
  appendMessageToDetail: (message: PatternChatMessage) => void;
}

export const useDsaPatternStore = create<DsaPatternStore>((set, get) => ({
  form: defaultForm,
  selectedSessionId: null,
  detail: null,
  showNewForm: false,
  isGenerating: false,
  followUpLoading: false,
  error: undefined,
  chatBySession: {},

  setForm: (patch) => set((state) => ({ form: { ...state.form, ...patch } })),
  resetForm: () => set({ form: { ...defaultForm } }),
  applyExample: (example) =>
    set((state) => ({
      form: {
        ...state.form,
        pattern: example.pattern,
        level: example.level ?? state.form.level,
        language: example.language ?? state.form.language,
        learning_style: example.learning_style ?? state.form.learning_style,
      },
    })),

  prefillPattern: (pattern) =>
    set((state) => ({
      form: { ...state.form, pattern },
      selectedSessionId: null,
      detail: null,
      showNewForm: true,
      isGenerating: false,
    })),

  startNewLesson: () =>
    set({
      selectedSessionId: null,
      detail: null,
      showNewForm: true,
      isGenerating: false,
      error: undefined,
    }),

  setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId, showNewForm: false }),

  hydrateFromDetail: (detail) => {
    const sessionId = detail.session_id;
    const messages = toChatMessages(detail.messages);
    set((state) => ({
      selectedSessionId: detail.session_id || state.selectedSessionId,
      detail,
      showNewForm: false,
      error: undefined,
      chatBySession: sessionId
        ? { ...state.chatBySession, [sessionId]: messages }
        : state.chatBySession,
    }));
  },

  clearDetail: () => set({ detail: null, selectedSessionId: null }),

  setGenerating: (isGenerating) => set({ isGenerating }),
  setFollowUpLoading: (followUpLoading) => set({ followUpLoading }),
  setError: (error) => set({ error }),

  appendChat: (sessionId, message) =>
    set((state) => ({
      chatBySession: {
        ...state.chatBySession,
        [sessionId]: [...(state.chatBySession[sessionId] ?? []), message],
      },
    })),

  setChat: (sessionId, messages) =>
    set((state) => ({
      chatBySession: {
        ...state.chatBySession,
        [sessionId]: messages,
      },
    })),

  appendMessageToDetail: (message) => {
    const detail = get().detail;
    if (!detail) return;
    const nextMessages = [
      ...(detail.messages ?? []),
      {
        id: message.id,
        role: message.role,
        agent_name: message.agent_name,
        content: message.content,
        message: message.content,
        created_at: message.created_at,
      },
    ];
    set({
      detail: { ...detail, messages: nextMessages },
    });
    if (detail.session_id) {
      get().appendChat(detail.session_id, message);
    }
  },
}));
