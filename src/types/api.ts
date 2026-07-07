export interface ApiPaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total?: number;
  next_cursor?: string | null;
}

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'
  | 'OPENROUTER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface ApiErrorPayload {
  code?: ApiErrorCode | string;
  message?: string;
  detail?: unknown;
  request_id?: string;
}

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
