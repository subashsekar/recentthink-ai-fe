export type Dashboard = {
  total_users: number;
  active_users: number;
  new_users_today: number;
  verified_users: number;
  blocked_users: number;
  students: number;
  professionals: number;
  job_seekers: number;
};

export type AdminUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_blocked: boolean;
  disabled_at?: string | null;
  blocked_at?: string | null;
  blocked_reason?: string | null;
  created_at?: string | null;
  username?: string | null;
  current_status?: string | null;
  primary_skill?: string | null;
  profile_picture_url?: string | null;
};

export type AdminUsersQuery = {
  page?: number;
  page_size?: number;
  name?: string;
  email?: string;
  role?: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  is_active?: boolean;
  created_from?: string;
  created_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  primary_skill?: string;
  current_status?: string;
};

export type AdminUsersResponse = {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

export type AdminUserDetail = {
  user: AdminUser;
  profile: Record<string, unknown> | null;
  statistics: Record<string, unknown> | null;
  ai_history: {
    sessions: unknown[];
    usage: unknown[];
  } | null;
  usage: Record<string, unknown> | null;
};

export type AdminUserActionBody = {
  reason?: string;
};

export type AdminAnalytics = {
  ai_sessions?: number;
  conversations?: number;
  avg_latency_ms?: number;
  avg_tokens?: number;
  avg_cost?: number;
  [key: string]: unknown;
};

export type AdminUsage = {
  requests?: number;
  tokens?: number;
  top_features?: Array<{ name: string; count: number }>;
  provider?: string;
  model?: string;
  estimated_cost?: number;
  [key: string]: unknown;
};

export type AdminModels = {
  provider_usage?: Array<{ provider: string; count: number; tokens?: number; cost?: number }>;
  model_usage?: Array<{
    model: string;
    provider?: string;
    count: number;
    tokens?: number;
    cost?: number;
  }>;
  [key: string]: unknown;
};

export type AuditLogAction =
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED'
  | 'USER_DELETED'
  | 'USER_ACTIVATED'
  | 'USER_DEACTIVATED'
  | 'ANNOUNCEMENT_SENT'
  | string;

export type AuditLogItem = {
  id: string;
  admin_id?: string | null;
  target_user_id?: string | null;
  action: AuditLogAction;
  reason?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AuditLogsQuery = {
  page?: number;
  page_size?: number;
  admin_id?: string;
  target_user_id?: string;
  action?: string;
};

export type AuditLogsResponse = {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
};

export type SystemHealthStatus = 'healthy' | 'warning' | 'down';

export type SystemHealthService = {
  name: string;
  status: SystemHealthStatus | string;
  response_time_ms?: number | null;
};

export type SystemHealth = {
  overall: SystemHealthStatus | string;
  services: SystemHealthService[];
};

export type BroadcastType = 'announcement' | 'maintenance' | 'emergency' | 'info' | 'warning';

export type BroadcastPayload = {
  title: string;
  message: string;
  type?: BroadcastType;
};
