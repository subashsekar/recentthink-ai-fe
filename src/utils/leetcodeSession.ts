import type { LeetCodeAgentRole, LeetCodeSessionDetail, SessionStats } from '@/types/leetcode';

const AGENT_ROLES: LeetCodeAgentRole[] = ['planner', 'teacher', 'coder', 'evaluator'];

export type ReportPage = 'problem' | LeetCodeAgentRole;

export const REPORT_PAGES: ReportPage[] = ['problem', 'planner', 'teacher', 'coder', 'evaluator'];

export const REPORT_PAGE_LABELS: Record<ReportPage, string> = {
  problem: 'Problem',
  planner: 'Planner',
  teacher: 'Teacher',
  coder: 'Coder',
  evaluator: 'Evaluator',
};

export interface NormalizedAnalyzeResult {
  session: LeetCodeSessionDetail;
  problemStatement: string;
  problemStatementMarkdown: string;
  problemStatementHtml: string;
  roleContent: Record<LeetCodeAgentRole, string>;
  stats: SessionStats | null;
}

function emptyRoleContent(): Record<LeetCodeAgentRole, string> {
  return { planner: '', teacher: '', coder: '', evaluator: '' };
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

function extractProblemFormatted(
  payload: Record<string, unknown>,
  session: LeetCodeSessionDetail,
): { plain: string; markdown: string; html: string } {
  const problemObj = asRecord(payload.problem);
  const memory = asRecord(session.memory);

  const markdown = pickString(
    payload.problem_statement_markdown,
    payload.problemStatementMarkdown,
    session.problem_statement_markdown,
    memory.problem_statement_markdown,
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
  session: LeetCodeSessionDetail,
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
    session.problem_statement,
    session.memory?.problem_statement,
    session.memory?.statement,
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
  messages: Array<{ role?: string; content?: string }> = [],
): Record<LeetCodeAgentRole, string> {
  const roleContent = emptyRoleContent();
  for (const message of messages) {
    const role = String(message.role ?? '').toLowerCase() as LeetCodeAgentRole;
    if (AGENT_ROLES.includes(role) && message.content) {
      roleContent[role] = message.content;
    }
  }
  return roleContent;
}

function extractRoleContentFromPayload(
  payload: Record<string, unknown>,
): Record<LeetCodeAgentRole, string> {
  const roleContent = emptyRoleContent();
  const outputs = asRecord(payload.outputs ?? payload.agent_outputs ?? payload.agents);

  for (const role of AGENT_ROLES) {
    const flat = extractAgentText(payload[role] ?? payload[`${role}_output`] ?? outputs[role]);
    if (flat) roleContent[role] = flat;
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
    content?: string;
  }>;

  const sessionDraft: LeetCodeSessionDetail = {
    session_id: pickString(sessionPayload.session_id, raw.session_id, raw.id) || '',
    title: pickString(sessionPayload.title, raw.title, raw.problem_title, 'LeetCode Session'),
    url: pickString(sessionPayload.url, raw.url, raw.problem_url),
    problem_statement: pickString(sessionPayload.problem_statement, raw.problem_statement),
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
    messages: (messages ?? []) as LeetCodeSessionDetail['messages'],
    stats: (sessionPayload.stats ?? raw.stats) as SessionStats | undefined,
    memory: asRecord(sessionPayload.memory ?? raw.memory),
  };

  const problemFormatted = extractProblemFormatted(raw, sessionDraft);

  const session: LeetCodeSessionDetail = {
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

export function mergeRoleDelta(
  current: Record<LeetCodeAgentRole, string>,
  role: LeetCodeAgentRole,
  delta: string,
): Record<LeetCodeAgentRole, string> {
  return { ...current, [role]: `${current[role] ?? ''}${delta}` };
}

export function hasReportContent(state: {
  session: LeetCodeSessionDetail | null;
  problemStatement: string;
  problemStatementMarkdown?: string;
  problemStatementHtml?: string;
  roleContent: Record<LeetCodeAgentRole, string>;
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
