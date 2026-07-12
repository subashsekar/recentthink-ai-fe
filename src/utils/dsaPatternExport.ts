import { config } from '@/config';
import { storage } from '@/utils/storage';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import type {
  PatternExportFormat,
  PatternExportRequest,
  PatternExportResponse,
} from '@/types/dsaPattern';
import { PATTERN_EXPORT_ALL_SECTIONS } from '@/types/dsaPattern';
import { triggerDownload } from '@/utils/courseExport';

const EXPORT_TIMEOUT_MS = 120_000;
const LAST_FORMAT_KEY = 'dsa_pattern_export_last_format';

function apiBase(): string {
  return config.api.baseUrl.replace(/\/+$/, '');
}

function getToken(): string {
  const token = storage.get<string>(config.auth.tokenKey);
  if (!token) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') window.location.assign(ROUTES.LOGIN);
    throw new Error('Please log in again. Your session may have expired.');
  }
  return token;
}

export function getLastExportFormat(): PatternExportFormat {
  if (typeof window === 'undefined') return 'markdown';
  const stored = window.localStorage.getItem(LAST_FORMAT_KEY);
  if (stored === 'markdown' || stored === 'json' || stored === 'pdf') return stored;
  return 'markdown';
}

export function setLastExportFormat(format: PatternExportFormat) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_FORMAT_KEY, format);
}

export function buildExportRequest(patternSessionId: string): PatternExportRequest {
  return {
    pattern_session_id: patternSessionId,
    include: [...PATTERN_EXPORT_ALL_SECTIONS],
  };
}

async function readErrorMessage(res: Response): Promise<string> {
  const status = res.status;
  if (status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') window.location.assign(ROUTES.LOGIN);
    return 'Session expired. Please log in again.';
  }
  if (status === 403) return "You don't own this pattern session";
  if (status === 404) return 'Pattern session not found';
  if (status === 429) return 'Too many exports, try again';
  if (status >= 500) return 'Export failed on the server. Please retry.';

  const text = await res.text().catch(() => '');
  if (text.trim()) {
    try {
      const json = JSON.parse(text) as { detail?: unknown; message?: string };
      if (typeof json.detail === 'string') return json.detail;
      if (typeof json.message === 'string') return json.message;
    } catch {
      if (text.length < 280) return text;
    }
  }
  return `Export failed (${status}).`;
}

async function postExport(path: string, body: PatternExportRequest): Promise<Response> {
  const token = getToken();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), EXPORT_TIMEOUT_MS);

  try {
    return await fetch(`${apiBase()}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Export timed out. Please try again.');
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

async function exportTextFormat(
  format: 'markdown' | 'json',
  patternSessionId: string,
): Promise<{ filename: string }> {
  const res = await postExport(
    `/dsa-pattern/export/${format}`,
    buildExportRequest(patternSessionId),
  );

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  const data = (await res.json()) as PatternExportResponse;
  if (!data?.content) {
    throw new Error('Export response was empty.');
  }

  const fallbackName = format === 'json' ? 'pattern-lesson.json' : 'pattern-lesson.md';
  const filename = data.filename || fallbackName;
  const contentType =
    data.content_type || (format === 'json' ? 'application/json' : 'text/markdown');
  triggerDownload(new Blob([data.content], { type: contentType }), filename);
  setLastExportFormat(format);
  return { filename };
}

export async function exportMarkdown(patternSessionId: string): Promise<{ filename: string }> {
  return exportTextFormat('markdown', patternSessionId);
}

export async function exportJson(patternSessionId: string): Promise<{ filename: string }> {
  return exportTextFormat('json', patternSessionId);
}

export async function exportPdf(patternSessionId: string): Promise<{ filename: string }> {
  const res = await postExport('/dsa-pattern/export/pdf', buildExportRequest(patternSessionId));

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = /filename="?([^"]+)"?/i.exec(disposition);
  const filename = match?.[1] || 'pattern-lesson.pdf';
  triggerDownload(blob, filename);
  setLastExportFormat('pdf');
  return { filename };
}

export async function exportPatternLesson(
  format: PatternExportFormat,
  patternSessionId: string,
): Promise<{ filename: string }> {
  if (format === 'pdf') return exportPdf(patternSessionId);
  if (format === 'json') return exportJson(patternSessionId);
  return exportMarkdown(patternSessionId);
}
