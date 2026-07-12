import { config } from '@/config';
import { storage } from '@/utils/storage';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import type { CourseExportFormat, CourseExportRequest, CourseExportResponse } from '@/types/course';
import { COURSE_EXPORT_ALL_SECTIONS } from '@/types/course';

const EXPORT_TIMEOUT_MS = 120_000;
const LAST_FORMAT_KEY = 'course_export_last_format';

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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

export function getLastExportFormat(): CourseExportFormat {
  if (typeof window === 'undefined') return 'markdown';
  const stored = window.localStorage.getItem(LAST_FORMAT_KEY);
  if (stored === 'markdown' || stored === 'pdf') return stored;
  return 'markdown';
}

export function setLastExportFormat(format: CourseExportFormat) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_FORMAT_KEY, format);
}

export function buildExportRequest(courseId: string): CourseExportRequest {
  return {
    course_id: courseId,
    include: [...COURSE_EXPORT_ALL_SECTIONS],
  };
}

async function readErrorMessage(res: Response): Promise<string> {
  const status = res.status;
  if (status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') window.location.assign(ROUTES.LOGIN);
    return 'Session expired. Please log in again.';
  }
  if (status === 403) return "You don't own this course";
  if (status === 404) return 'Course not found';
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

async function postExport(path: string, body: CourseExportRequest): Promise<Response> {
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

/** POST /courses/export/markdown → JSON → .md download */
export async function exportMarkdown(courseId: string): Promise<{ filename: string }> {
  const res = await postExport('/courses/export/markdown', buildExportRequest(courseId));

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  const data = (await res.json()) as CourseExportResponse;
  if (!data?.content) {
    throw new Error('Export response was empty.');
  }

  const filename = data.filename || 'course.md';
  const contentType = data.content_type || 'text/markdown';
  triggerDownload(new Blob([data.content], { type: contentType }), filename);
  setLastExportFormat('markdown');
  return { filename };
}

/** POST /courses/export/pdf → binary blob download (not JSON) */
export async function exportPdf(courseId: string): Promise<{ filename: string }> {
  const res = await postExport('/courses/export/pdf', buildExportRequest(courseId));

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = /filename="?([^"]+)"?/i.exec(disposition);
  const filename = match?.[1] || 'course.pdf';
  triggerDownload(blob, filename);
  setLastExportFormat('pdf');
  return { filename };
}

export async function exportCourse(
  format: CourseExportFormat,
  courseId: string,
): Promise<{ filename: string }> {
  if (format === 'pdf') return exportPdf(courseId);
  return exportMarkdown(courseId);
}
