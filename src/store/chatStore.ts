import { create } from 'zustand';
import type {
  LeetCodeAgentRole,
  LeetCodeSessionDetail,
  LeetCodeStreamEvent,
  ModeInfo,
  SessionStats,
} from '@/types/leetcode';
import {
  mergeRoleDelta,
  normalizeAnalyzeResponse,
  normalizeFollowUpResponse,
  type NormalizedAnalyzeResult,
  type ReportPage,
} from '@/utils/leetcodeSession';

interface ChatState {
  activeSessionId: string | null;
  session: LeetCodeSessionDetail | null;
  problemStatement: string;
  problemStatementMarkdown: string;
  problemStatementHtml: string;
  roleContent: Record<LeetCodeAgentRole, string>;
  stats: SessionStats | null;
  currentPage: ReportPage;
  isAnalyzing: boolean;
  isStreaming: boolean;
  selectedModelId: string | null;
  modes: ModeInfo[];
  defaultModeId: string;
  selectedModeId: string | null;
  statsDrawerOpen: boolean;

  startNewChat: () => void;
  setActiveSessionId: (sessionId: string | null) => void;
  setCurrentPage: (page: ReportPage) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setStreaming: (isStreaming: boolean) => void;
  setSelectedModelId: (modelId: string | null) => void;
  setModes: (modes: ModeInfo[]) => void;
  setDefaultModeId: (modeId: string) => void;
  setSelectedModeId: (modeId: string | null) => void;
  setStatsDrawerOpen: (open: boolean) => void;
  applyAnalyzeResult: (result: NormalizedAnalyzeResult) => void;
  applyFollowUpResult: (payload: unknown) => void;
  applyStreamEvent: (event: LeetCodeStreamEvent) => void;
  hydrateFromSession: (result: NormalizedAnalyzeResult, defaultModelId?: string | null) => void;
}

const emptyRoles = (): Record<LeetCodeAgentRole, string> => ({
  planner: '',
  teacher: '',
  coder: '',
  evaluator: '',
});

const initialState = {
  activeSessionId: null as string | null,
  session: null as LeetCodeSessionDetail | null,
  problemStatement: '',
  problemStatementMarkdown: '',
  problemStatementHtml: '',
  roleContent: emptyRoles(),
  stats: null as SessionStats | null,
  currentPage: 'problem' as ReportPage,
  isAnalyzing: false,
  isStreaming: false,
  selectedModelId: null as string | null,
  modes: [] as ModeInfo[],
  defaultModeId: 'learning',
  selectedModeId: null as string | null,
  statsDrawerOpen: false,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  startNewChat: () =>
    set({
      ...initialState,
      modes: get().modes,
      defaultModeId: get().defaultModeId,
      selectedModeId: get().selectedModeId,
      statsDrawerOpen: false,
    }),

  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),

  setModes: (modes) => set({ modes }),

  setDefaultModeId: (defaultModeId) => set({ defaultModeId }),

  setSelectedModeId: (selectedModeId) => set({ selectedModeId }),

  setStatsDrawerOpen: (statsDrawerOpen) => set({ statsDrawerOpen }),

  hydrateFromSession: (result, defaultModelId?: string | null) =>
    set({
      activeSessionId: result.session.session_id,
      session: result.session,
      problemStatement: result.problemStatement,
      problemStatementMarkdown: result.problemStatementMarkdown,
      problemStatementHtml: result.problemStatementHtml,
      roleContent: result.roleContent,
      stats: result.stats,
      currentPage: 'problem',
      selectedModelId: result.session.model_id ?? defaultModelId ?? null,
      selectedModeId: result.session.mode_id ?? get().defaultModeId,
      isAnalyzing: false,
      isStreaming: false,
    }),

  applyAnalyzeResult: (result) =>
    set({
      activeSessionId: result.session.session_id,
      session: result.session,
      problemStatement: result.problemStatement,
      problemStatementMarkdown: result.problemStatementMarkdown,
      problemStatementHtml: result.problemStatementHtml,
      roleContent: result.roleContent,
      stats: result.stats,
      currentPage: 'problem',
      selectedModelId: result.session.model_id ?? get().selectedModelId,
      selectedModeId: result.session.mode_id ?? get().defaultModeId,
      isAnalyzing: false,
      isStreaming: false,
    }),

  applyFollowUpResult: (payload) => {
    const state = get();
    const result = normalizeFollowUpResponse(payload, state);
    set({
      activeSessionId: result.session.session_id,
      session: result.session,
      problemStatement: result.problemStatement,
      problemStatementMarkdown: result.problemStatementMarkdown,
      problemStatementHtml: result.problemStatementHtml,
      roleContent: result.roleContent,
      stats: result.stats,
      currentPage: 'teacher',
      isAnalyzing: false,
      isStreaming: false,
    });
  },

  applyStreamEvent: (event) => {
    const state = get();

    switch (event.type) {
      case 'problem_statement': {
        const content = event.problem_statement ?? event.content ?? '';
        const markdown = event.problem_statement_markdown ?? '';
        const html = event.problem_statement_html ?? '';
        const nextStatement = event.delta
          ? `${state.problemStatement}${event.delta}`
          : content || state.problemStatement;
        if (!nextStatement && !markdown && !html) break;
        set({
          isStreaming: true,
          activeSessionId: event.session_id || state.activeSessionId,
          problemStatement: nextStatement,
          problemStatementMarkdown: markdown || state.problemStatementMarkdown,
          problemStatementHtml: html || state.problemStatementHtml,
          session: state.session
            ? {
                ...state.session,
                problem_statement: nextStatement,
                problem_statement_markdown: markdown || state.session.problem_statement_markdown,
                problem_statement_html: html || state.session.problem_statement_html,
              }
            : {
                session_id: event.session_id || crypto.randomUUID(),
                title: 'LeetCode Session',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                messages: [],
                problem_statement: nextStatement,
                problem_statement_markdown: markdown || undefined,
                problem_statement_html: html || undefined,
              },
          currentPage: 'problem',
        });
        break;
      }
      case 'delta':
        set({
          isStreaming: true,
          activeSessionId: event.session_id || state.activeSessionId,
          roleContent: mergeRoleDelta(state.roleContent, event.role, event.delta),
        });
        break;
      case 'message':
        if (event.role === 'problem' || event.role === 'problem_statement') {
          set({
            isStreaming: true,
            activeSessionId: event.session_id || state.activeSessionId,
            problemStatement: event.content,
            session: state.session
              ? { ...state.session, problem_statement: event.content }
              : {
                  session_id: event.session_id || crypto.randomUUID(),
                  title: 'LeetCode Session',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  messages: [],
                  problem_statement: event.content,
                },
            currentPage: 'problem',
          });
          break;
        }
        set({
          isStreaming: true,
          activeSessionId: event.session_id || state.activeSessionId,
          roleContent: { ...state.roleContent, [event.role]: event.content },
        });
        break;
      case 'stats':
        set({
          activeSessionId: event.session_id || state.activeSessionId,
          stats: event.stats,
        });
        break;
      case 'session': {
        const normalized = normalizeAnalyzeResponse(event.session);
        set({
          activeSessionId: normalized.session.session_id,
          session: normalized.session,
          problemStatement: normalized.problemStatement,
          problemStatementMarkdown: normalized.problemStatementMarkdown,
          problemStatementHtml: normalized.problemStatementHtml,
          roleContent: normalized.roleContent,
          stats: normalized.stats,
        });
        break;
      }
      case 'done':
        set({ isAnalyzing: false, isStreaming: false });
        break;
      case 'complete': {
        const normalized = normalizeAnalyzeResponse(event);
        set({
          activeSessionId: normalized.session.session_id,
          session: normalized.session,
          problemStatement: normalized.problemStatement,
          problemStatementMarkdown: normalized.problemStatementMarkdown,
          problemStatementHtml: normalized.problemStatementHtml,
          roleContent: normalized.roleContent,
          stats: normalized.stats,
          selectedModelId: normalized.session.model_id ?? state.selectedModelId,
          selectedModeId: normalized.session.mode_id ?? state.defaultModeId,
          currentPage: 'problem',
          isAnalyzing: false,
          isStreaming: false,
        });
        break;
      }
      case 'error':
        set({ isAnalyzing: false, isStreaming: false });
        break;
      default:
        break;
    }
  },
}));
