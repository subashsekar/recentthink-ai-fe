import type {
  HackerRankAgentRole,
  HackerRankSessionDetail,
  SessionStats,
} from '@/types/hackerrank';

const AGENT_ROLES: HackerRankAgentRole[] = [
  'planner',
  'teacher',
  'coder',
  'evaluator',
  'code_explainer',
];

export type ReportPage = 'problem' | HackerRankAgentRole;

export const REPORT_PAGES: ReportPage[] = [
  'problem',
  'planner',
  'teacher',
  'coder',
  'evaluator',
  'code_explainer',
];

export const REPORT_PAGE_LABELS: Record<ReportPage, string> = {
  problem: 'Problem',
  planner: 'Planner',
  teacher: 'Teacher',
  coder: 'Coder',
  evaluator: 'Evaluator',
  code_explainer: 'Code Explainer',
};

export interface NormalizedAnalyzeResult {
  session: HackerRankSessionDetail;
  problemStatement: string;
  problemStatementMarkdown: string;
  problemStatementHtml: string;
  roleContent: Record<HackerRankAgentRole, string>;
  stats: SessionStats | null;
}

function emptyRoleContent(): Record<HackerRankAgentRole, string> {
  return { planner: '', teacher: '', coder: '', evaluator: '', code_explainer: '' };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function unwrapPayload(payload: unknown): Record<string, unknown> {
  const raw = asRecord(payload);
  const nested = asRecord(raw.data ?? raw.result ?? raw.response ?? raw.payload);
  return Object.keys(nested).length > 0 ? { ...raw, ...nested } : raw;
}

function extractAgentText(value: unknown): string {
  if (typeof value === 'string') return value;
  const obj = asRecord(value);
  return pickString(obj.content, obj.output, obj.text, obj.message, obj.response);
}

function formatPlannerOutput(value: unknown): string {
  const obj = asRecord(value);
  if (!Object.keys(obj).length) return '';
  const lines = ['## Problem Overview'];
  const category = pickString(obj.problem_category, obj.category);
  const difficulty = pickString(obj.difficulty);
  const patterns = Array.isArray(obj.patterns) ? obj.patterns.map(String) : [];
  const plan = Array.isArray(obj.execution_plan) ? obj.execution_plan.map(String) : [];

  if (category) lines.push(`- **Category:** ${category}`);
  if (difficulty) lines.push(`- **Difficulty:** ${difficulty}`);
  if (patterns.length) lines.push(`- **Patterns:** ${patterns.join(', ')}`);

  if (plan.length) {
    lines.push('', '## Execution Plan');
    for (const [index, step] of plan.entries()) {
      lines.push(`${index + 1}. ${step}`);
    }
  }

  return lines.length > 1 ? lines.join('\n') : '';
}

function formatCoderSolution(value: unknown): string {
  const obj = asRecord(value);
  const code = pickString(obj.code);
  if (!code) return '';

  const approach = pickString(obj.approach, 'Solution');
  const language = pickString(obj.language, 'python');
  const explanation = pickString(obj.explanation);
  const parts = [`### ${approach}`, '', `\`\`\`${language}`, code, '```'];

  if (explanation) {
    parts.push('', explanation);
  }

  return parts.join('\n');
}

function formatCoderOutput(value: unknown): string {
  const obj = asRecord(value);
  if (!Object.keys(obj).length) return '';

  const sections = [
    formatCoderSolution(obj.brute_force),
    formatCoderSolution(obj.better ?? obj.better_solution),
    formatCoderSolution(obj.optimal ?? obj.optimal_solution),
    formatCoderSolution(obj.solution ?? obj.final_solution),
  ].filter(Boolean);

  return sections.join('\n\n');
}

function formatEvaluatorOutput(value: unknown): string {
  const obj = asRecord(value);
  if (!Object.keys(obj).length) return '';

  const lines: string[] = [];
  const timeCx = pickString(obj.time_complexity);
  const spaceCx = pickString(obj.space_complexity);
  if (timeCx) lines.push(`**Time Complexity:** ${timeCx}`);
  if (spaceCx) lines.push(`**Space Complexity:** ${spaceCx}`);

  const listSections: Array<[string, unknown]> = [
    ['Optimizations', obj.optimizations],
    ['Common Mistakes', obj.common_mistakes ?? obj.mistakes],
    ['Edge Cases', obj.edge_cases],
    ['Follow-ups', obj.follow_ups ?? obj.interview_follow_ups ?? obj.follow_up_questions],
  ];

  for (const [title, items] of listSections) {
    if (!Array.isArray(items) || items.length === 0) continue;
    lines.push('', `### ${title}`);
    for (const item of items) {
      lines.push(`- ${String(item)}`);
    }
  }

  return lines.join('\n');
}

function formatCodeExplainerOutput(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  const obj = asRecord(value);
  if (!Object.keys(obj).length) return '';

  const overview = pickString(obj.overview, obj.summary);
  const breakdown = pickString(obj.breakdown, obj.explanation);
  const issues = Array.isArray(obj.issues) ? obj.issues.map(String) : [];
  const improvements = Array.isArray(obj.improvements) ? obj.improvements.map(String) : [];

  const lines: string[] = [];
  if (overview) lines.push(overview);
  if (breakdown) lines.push('', breakdown);
  if (issues.length) {
    lines.push('', '### Issues / Risks');
    for (const item of issues) lines.push(`- ${item}`);
  }
  if (improvements.length) {
    lines.push('', '### Improvements');
    for (const item of improvements) lines.push(`- ${item}`);
  }

  return lines.join('\n').trim();
}

function formatRoleOutput(role: HackerRankAgentRole, value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (role === 'planner') return formatPlannerOutput(value);
  if (role === 'coder') return formatCoderOutput(value);
  if (role === 'evaluator') return formatEvaluatorOutput(value);
  if (role === 'code_explainer') return formatCodeExplainerOutput(value);
  return extractAgentText(value);
}

function buildStatsFromPayload(payload: Record<string, unknown>): SessionStats | null {
  const planner = asRecord(payload.planner);
  const problem = asRecord(payload.problem);
  const totalTokens = payload.total_tokens;
  const executionTimeMs = payload.total_execution_time_ms ?? payload.execution_time_ms;
  const difficulty = pickString(planner.difficulty, problem.difficulty, payload.difficulty);
  const patterns = Array.isArray(planner.patterns) ? planner.patterns.map(String) : [];

  if (
    typeof totalTokens !== 'number' &&
    typeof executionTimeMs !== 'number' &&
    !difficulty &&
    patterns.length === 0
  ) {
    return null;
  }

  return {
    token_usage: typeof totalTokens === 'number' ? totalTokens : undefined,
    execution_time_ms: typeof executionTimeMs === 'number' ? executionTimeMs : undefined,
    difficulty: difficulty || undefined,
    pattern: patterns[0] || undefined,
    tags: patterns.length ? patterns : undefined,
    current_model: pickString(payload.model_id) || undefined,
  };
}

function extractProblemFormatted(
  payload: Record<string, unknown>,
  session: HackerRankSessionDetail,
): { plain: string; markdown: string; html: string } {
  const problemObj = asRecord(payload.problem);
  const memory = asRecord(session.memory);

  const markdown = pickString(
    payload.problem_statement_markdown,
    payload.problemStatementMarkdown,
    session.problem_statement_markdown,
    memory.problem_statement_markdown,
    problemObj.problem_statement_markdown,
    problemObj.markdown,
  );

  const html = pickString(
    payload.problem_statement_html,
    payload.problemStatementHtml,
    session.problem_statement_html,
    memory.problem_statement_html,
    problemObj.html,
  );

  const plain = extractProblemStatement(payload, session);

  return { plain, markdown, html };
}

function extractProblemStatement(
  payload: Record<string, unknown>,
  session: HackerRankSessionDetail,
): string {
  const problemObj = asRecord(payload.problem);

  const direct = pickString(
    payload.problem_statement,
    payload.problemStatement,
    payload.statement,
    problemObj.statement,
    problemObj.content,
    problemObj.text,
    problemObj.description,
    payload.problem_description,
    session.problem_statement,
    session.memory?.problem_statement,
    session.memory?.statement,
    session.memory?.problem_description,
  );

  if (direct) return direct;

  for (const message of session.messages ?? []) {
    const role = String(message.role ?? '').toLowerCase();
    if (role === 'problem' || role === 'problem_statement' || role === 'statement') {
      const content = pickString(message.content);
      if (content) return content;
    }
  }

  const outputs = asRecord(payload.outputs ?? payload.agent_outputs ?? payload.agents);
  const fromOutputs = pickString(outputs.problem_statement, outputs.problem, outputs.statement);
  if (fromOutputs) return fromOutputs;

  return '';
}

function messagesToRoleContent(
  messages: Array<{ role?: string; agent_name?: string; content?: string; message?: string }> = [],
): Record<HackerRankAgentRole, string> {
  const roleContent = emptyRoleContent();
  for (const message of messages) {
    const agentName = String(message.agent_name ?? '').toLowerCase();
    const role = (
      AGENT_ROLES.includes(agentName as HackerRankAgentRole)
        ? agentName
        : String(message.role ?? '').toLowerCase()
    ) as HackerRankAgentRole;
    const content = pickString(message.content, message.message);
    if (AGENT_ROLES.includes(role) && content) {
      roleContent[role] = content;
    }
  }
  return roleContent;
}

function extractRoleContentFromPayload(
  payload: Record<string, unknown>,
): Record<HackerRankAgentRole, string> {
  const roleContent = emptyRoleContent();
  const outputs = asRecord(payload.outputs ?? payload.agent_outputs ?? payload.agents);

  for (const role of AGENT_ROLES) {
    const value = payload[role] ?? payload[`${role}_output`] ?? outputs[role];
    const formatted = formatRoleOutput(role, value);
    if (formatted) roleContent[role] = formatted;
  }

  return roleContent;
}

export function normalizeAnalyzeResponse(payload: unknown): NormalizedAnalyzeResult {
  const raw = unwrapPayload(payload);
  const sessionPayload = asRecord(raw.session ?? raw);

  const messages = (
    Array.isArray(sessionPayload.messages) ? sessionPayload.messages : raw.messages
  ) as Array<{
    role?: string;
    agent_name?: string;
    content?: string;
    message?: string;
  }>;

  const problemObj = asRecord(raw.problem);

  const sessionDraft: HackerRankSessionDetail = {
    session_id: pickString(sessionPayload.session_id, raw.session_id, raw.id) || '',
    title: pickString(
      sessionPayload.title,
      raw.title,
      raw.problem_title,
      problemObj.title,
      'HackerRank Session',
    ),
    url: pickString(sessionPayload.url, raw.url, raw.problem_url, problemObj.url),
    problem_statement: pickString(
      sessionPayload.problem_statement,
      raw.problem_statement,
      raw.problem_description,
      sessionPayload.problem_description,
    ),
    problem_statement_markdown: pickString(
      sessionPayload.problem_statement_markdown,
      raw.problem_statement_markdown,
    ),
    problem_statement_html: pickString(
      sessionPayload.problem_statement_html,
      raw.problem_statement_html,
    ),
    model_id: pickString(sessionPayload.model_id, raw.model_id) || undefined,
    mode_id: pickString(sessionPayload.mode_id, raw.mode_id) || undefined,
    created_at: pickString(sessionPayload.created_at, raw.created_at) || new Date().toISOString(),
    updated_at: pickString(sessionPayload.updated_at, raw.updated_at) || new Date().toISOString(),
    messages: (messages ?? []) as HackerRankSessionDetail['messages'],
    stats:
      ((sessionPayload.stats ?? raw.stats) as SessionStats | undefined) ??
      buildStatsFromPayload(raw) ??
      undefined,
    memory: asRecord(sessionPayload.memory ?? raw.memory),
  };

  const problemFormatted = extractProblemFormatted(raw, sessionDraft);

  const session: HackerRankSessionDetail = {
    ...sessionDraft,
    session_id: sessionDraft.session_id || crypto.randomUUID(),
    problem_statement: problemFormatted.plain,
    problem_statement_markdown: problemFormatted.markdown || undefined,
    problem_statement_html: problemFormatted.html || undefined,
  };

  const roleContent = emptyRoleContent();
  const fromPayload = extractRoleContentFromPayload(raw);
  const fromMessages = messagesToRoleContent(messages);

  for (const role of AGENT_ROLES) {
    roleContent[role] = fromPayload[role] || fromMessages[role] || '';
  }

  return {
    session,
    problemStatement: problemFormatted.plain,
    problemStatementMarkdown: problemFormatted.markdown,
    problemStatementHtml: problemFormatted.html,
    roleContent,
    stats: session.stats ?? null,
  };
}

export function normalizeFollowUpResponse(
  payload: unknown,
  current: {
    activeSessionId: string | null;
    session: HackerRankSessionDetail | null;
    problemStatement: string;
    problemStatementMarkdown: string;
    problemStatementHtml: string;
    roleContent: Record<HackerRankAgentRole, string>;
    stats: SessionStats | null;
  },
): NormalizedAnalyzeResult {
  const raw = unwrapPayload(payload);
  const teacherAnswer = pickString(raw.teacher, extractAgentText(raw.teacher));
  const sessionId =
    pickString(raw.session_id) || current.activeSessionId || current.session?.session_id || '';

  const teacherContent = teacherAnswer
    ? [current.roleContent.teacher, teacherAnswer].filter(Boolean).join('\n\n---\n\n')
    : current.roleContent.teacher;

  const followUpStats = buildStatsFromPayload(raw);
  const mergedStats: SessionStats | null = followUpStats
    ? { ...(current.stats ?? {}), ...followUpStats }
    : current.stats;

  const session: HackerRankSessionDetail = current.session
    ? {
        ...current.session,
        session_id: sessionId || current.session.session_id,
        updated_at: new Date().toISOString(),
      }
    : {
        session_id: sessionId || crypto.randomUUID(),
        title: 'HackerRank Session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      };

  return {
    session,
    problemStatement: current.problemStatement,
    problemStatementMarkdown: current.problemStatementMarkdown,
    problemStatementHtml: current.problemStatementHtml,
    roleContent: {
      ...current.roleContent,
      teacher: teacherContent,
    },
    stats: mergedStats,
  };
}

export function mergeRoleDelta(
  current: Record<HackerRankAgentRole, string>,
  role: HackerRankAgentRole,
  delta: string,
): Record<HackerRankAgentRole, string> {
  return { ...current, [role]: `${current[role] ?? ''}${delta}` };
}

export function hasReportContent(state: {
  session: HackerRankSessionDetail | null;
  problemStatement: string;
  problemStatementMarkdown?: string;
  problemStatementHtml?: string;
  roleContent: Record<HackerRankAgentRole, string>;
  activeSessionId: string | null;
}): boolean {
  if (state.activeSessionId || state.session) return true;
  if (
    state.problemStatement.trim() ||
    state.problemStatementMarkdown?.trim() ||
    state.problemStatementHtml?.trim()
  ) {
    return true;
  }
  return AGENT_ROLES.some((role) => Boolean(state.roleContent[role]?.trim()));
}
