type FastApiValidationItem = {
  msg?: string;
  loc?: Array<string | number>;
  type?: string;
};

function formatValidationItem(item: FastApiValidationItem): string {
  const loc = Array.isArray(item.loc) ? item.loc.filter((part) => part !== 'body').join('.') : '';
  const msg = item.msg ?? 'Validation error';
  return loc ? `${loc}: ${msg}` : msg;
}

export function parseApiErrorMessage(status: number, bodyText: string): string {
  if (!bodyText.trim()) {
    return defaultStatusMessage(status);
  }

  try {
    const json = JSON.parse(bodyText) as Record<string, unknown>;
    const detail = json.detail ?? json.message ?? json.error;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) =>
          typeof item === 'string' ? item : formatValidationItem(item as FastApiValidationItem),
        )
        .filter(Boolean);
      if (messages.length > 0) return messages.join('; ');
    }

    if (detail && typeof detail === 'object') {
      const nested = detail as Record<string, unknown>;
      if (typeof nested.message === 'string') return nested.message;
    }
  } catch {
    // Not JSON — fall through to raw text / status message.
  }

  const trimmed = bodyText.trim();
  if (trimmed.length > 0 && trimmed.length < 280) return trimmed;
  return defaultStatusMessage(status);
}

function defaultStatusMessage(status: number): string {
  switch (status) {
    case 401:
      return 'Please log in again. Your session may have expired.';
    case 403:
      return 'You do not have permission to run this analysis.';
    case 404:
      return 'Analyze endpoint not found. Check gateway URL configuration.';
    case 422:
      return 'Invalid request. Please check your inputs and try again.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
      return 'Server error. Please try again.';
    case 502:
    case 503:
    case 504:
      return 'AI service is unavailable. Please try again shortly.';
    default:
      return `Request failed (${status}).`;
  }
}

export class ApiRequestError extends Error {
  status: number;
  rawBody: string;

  constructor(status: number, rawBody: string, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.rawBody = rawBody;
  }
}

export function createApiRequestError(status: number, bodyText: string): ApiRequestError {
  return new ApiRequestError(status, bodyText, parseApiErrorMessage(status, bodyText));
}

export function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const name = 'name' in err ? String((err as { name?: unknown }).name ?? '') : '';
  if (name === 'AbortError') return true;
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  return false;
}

/** Turn browser TypeError "Failed to fetch" into an actionable API error. */
export function createNetworkFetchError(baseUrl: string, err: unknown): ApiRequestError {
  const reason = err instanceof Error ? err.message : 'Network request failed';
  const message =
    reason === 'Failed to fetch' || reason === 'NetworkError when attempting to fetch resource.'
      ? `Cannot reach the API at ${baseUrl}. Check that the gateway is running and reachable.`
      : reason;
  return new ApiRequestError(0, reason, message);
}
