'use client';

import { create } from 'zustand';
import type {
  CourseChatMessage,
  CourseExample,
  CourseGenerateRequest,
  CourseHistoryDetail,
  CourseHistoryMessage,
} from '@/types/course';

const defaultForm: CourseGenerateRequest = {
  skill: '',
  goal: '',
  level: 'Beginner',
  target_level: 'Advanced',
  duration_days: 60,
  daily_hours: 2,
  learning_style: 'Hands-on',
  language: 'English',
  programming_language: '',
  topics_include: [],
  topics_exclude: [],
  output_format: 'full',
  model_id: null,
  mode_id: null,
};

function toChatMessages(messages: CourseHistoryMessage[] | undefined): CourseChatMessage[] {
  return (messages ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    agent_name: m.agent_name,
    content: m.content || m.message || '',
    created_at: m.created_at,
  }));
}

interface CourseStore {
  form: CourseGenerateRequest;
  selectedCourseId: string | null;
  detail: CourseHistoryDetail | null;
  showNewForm: boolean;
  isGenerating: boolean;
  chatBySession: Record<string, CourseChatMessage[]>;

  setForm: (patch: Partial<CourseGenerateRequest>) => void;
  resetForm: () => void;
  applyExample: (example: CourseExample) => void;
  startNewCourse: () => void;
  setSelectedCourseId: (courseId: string | null) => void;
  hydrateFromDetail: (detail: CourseHistoryDetail) => void;
  clearDetail: () => void;
  setGenerating: (value: boolean) => void;
  appendChat: (sessionId: string, message: CourseChatMessage) => void;
  setChat: (sessionId: string, messages: CourseChatMessage[]) => void;
  appendMessageToDetail: (message: CourseChatMessage) => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  form: defaultForm,
  selectedCourseId: null,
  detail: null,
  showNewForm: false,
  isGenerating: false,
  chatBySession: {},

  setForm: (patch) => set((state) => ({ form: { ...state.form, ...patch } })),
  resetForm: () => set({ form: { ...defaultForm } }),
  applyExample: (example) =>
    set((state) => ({
      form: {
        ...state.form,
        skill: example.skill,
        goal: example.goal,
        level: example.level ?? state.form.level,
        target_level: example.target_level ?? state.form.target_level,
        duration_days: example.duration_days ?? state.form.duration_days,
        daily_hours: example.daily_hours ?? state.form.daily_hours,
        learning_style: example.learning_style ?? state.form.learning_style,
        language: example.language ?? state.form.language,
        programming_language: example.programming_language ?? state.form.programming_language,
        topics_include: example.topics_include ?? state.form.topics_include,
        topics_exclude: example.topics_exclude ?? state.form.topics_exclude,
      },
    })),

  startNewCourse: () =>
    set({
      selectedCourseId: null,
      detail: null,
      showNewForm: true,
      isGenerating: false,
    }),

  setSelectedCourseId: (selectedCourseId) => set({ selectedCourseId, showNewForm: false }),

  hydrateFromDetail: (detail) => {
    const sessionId = detail.session_id;
    const messages = toChatMessages(detail.messages);
    set((state) => ({
      selectedCourseId: detail.course_id || state.selectedCourseId,
      detail,
      showNewForm: false,
      chatBySession: sessionId
        ? { ...state.chatBySession, [sessionId]: messages }
        : state.chatBySession,
    }));
  },

  clearDetail: () => set({ detail: null, selectedCourseId: null }),

  setGenerating: (isGenerating) => set({ isGenerating }),

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
