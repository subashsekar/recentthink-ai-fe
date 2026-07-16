import { API_ENDPOINTS } from '@/constants';
import type {
  AdminUserActionBody,
  AdminUserDetail,
  AdminUsersQuery,
  AdminUsersResponse,
  AnalyticsCharts,
  AnalyticsDashboard,
  AnalyticsExportFormat,
  AnalyticsExportReport,
  AnalyticsUsersQuery,
  AnalyticsUsersResponse,
  AuditLogsQuery,
  AuditLogsResponse,
  BroadcastPayload,
  CostAnalytics,
  Dashboard,
  FeatureAnalytics,
  ModelAnalytics,
  ProviderAnalytics,
  SystemHealth,
  TokenAnalytics,
  UserUsageDetail,
} from '@/types/admin';
import { apiClient } from './client';

function filenameFromDisposition(header: string | undefined, fallback: string) {
  if (!header) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i.exec(header);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].replace(/"/g, '').trim());
  } catch {
    return match[1].replace(/"/g, '').trim();
  }
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const adminApi = {
  getDashboard: async () => {
    const res = await apiClient.get<Dashboard>(API_ENDPOINTS.ADMIN.DASHBOARD);
    return res.data;
  },

  getUsers: async (params?: AdminUsersQuery) => {
    const res = await apiClient.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, { params });
    return res.data;
  },

  getUser: async (userId: string) => {
    const res = await apiClient.get<AdminUserDetail>(API_ENDPOINTS.ADMIN.USER(userId));
    return res.data;
  },

  blockUser: async (userId: string, body?: AdminUserActionBody) => {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN.USER_BLOCK(userId), body ?? {});
    return res.data;
  },

  unblockUser: async (userId: string, body?: AdminUserActionBody) => {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN.USER_UNBLOCK(userId), body ?? {});
    return res.data;
  },

  activateUser: async (userId: string, body?: AdminUserActionBody) => {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN.USER_ACTIVATE(userId), body ?? {});
    return res.data;
  },

  deactivateUser: async (userId: string, body?: AdminUserActionBody) => {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN.USER_DEACTIVATE(userId), body ?? {});
    return res.data;
  },

  deleteUser: async (userId: string, reason?: string) => {
    const res = await apiClient.delete(API_ENDPOINTS.ADMIN.USER(userId), {
      params: reason ? { reason } : undefined,
    });
    return res.data;
  },

  getAnalyticsDashboard: async () => {
    const res = await apiClient.get<AnalyticsDashboard>(API_ENDPOINTS.ADMIN.ANALYTICS_DASHBOARD);
    return res.data;
  },

  /** @deprecated use getAnalyticsDashboard */
  getAnalytics: async () => {
    const res = await apiClient.get<AnalyticsDashboard>(API_ENDPOINTS.ADMIN.ANALYTICS_DASHBOARD);
    return res.data;
  },

  getTokenAnalytics: async () => {
    const res = await apiClient.get<TokenAnalytics>(API_ENDPOINTS.ADMIN.ANALYTICS_TOKENS);
    return res.data;
  },

  getFeatureAnalytics: async () => {
    const res = await apiClient.get<FeatureAnalytics>(API_ENDPOINTS.ADMIN.ANALYTICS_FEATURES);
    return res.data;
  },

  getModelAnalytics: async () => {
    const res = await apiClient.get<ModelAnalytics>(API_ENDPOINTS.ADMIN.ANALYTICS_MODELS);
    return res.data;
  },

  /** @deprecated use getModelAnalytics */
  getModels: async () => {
    const res = await apiClient.get<ModelAnalytics>(API_ENDPOINTS.ADMIN.ANALYTICS_MODELS);
    return res.data;
  },

  getProviderAnalytics: async () => {
    const res = await apiClient.get<ProviderAnalytics>(API_ENDPOINTS.ADMIN.ANALYTICS_PROVIDERS);
    return res.data;
  },

  getAnalyticsUsers: async (params?: AnalyticsUsersQuery) => {
    const res = await apiClient.get<AnalyticsUsersResponse>(API_ENDPOINTS.ADMIN.ANALYTICS_USERS, {
      params,
    });
    return res.data;
  },

  getAnalyticsUser: async (userId: string) => {
    const res = await apiClient.get<UserUsageDetail>(API_ENDPOINTS.ADMIN.ANALYTICS_USER(userId));
    return res.data;
  },

  getAnalyticsCharts: async () => {
    const res = await apiClient.get<AnalyticsCharts>(API_ENDPOINTS.ADMIN.ANALYTICS_CHARTS);
    return res.data;
  },

  getCostAnalytics: async () => {
    const res = await apiClient.get<CostAnalytics>(API_ENDPOINTS.ADMIN.ANALYTICS_COSTS);
    return res.data;
  },

  /** @deprecated prefer analytics endpoints */
  getUsage: async () => {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.USAGE);
    return res.data;
  },

  exportAnalyticsReport: async (report: AnalyticsExportReport, format: AnalyticsExportFormat) => {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS_EXPORT, {
      params: { report, format },
      responseType: 'blob',
    });
    const fallbackExt = format === 'excel' ? 'xlsx' : format;
    const filename = filenameFromDisposition(
      res.headers['content-disposition'] as string | undefined,
      `${report}.${fallbackExt}`,
    );
    triggerBlobDownload(res.data as Blob, filename);
  },

  getAuditLogs: async (params?: AuditLogsQuery) => {
    const res = await apiClient.get<AuditLogsResponse>(API_ENDPOINTS.ADMIN.AUDIT_LOGS, { params });
    return res.data;
  },

  getSystemHealth: async () => {
    const res = await apiClient.get<SystemHealth>(API_ENDPOINTS.ADMIN.SYSTEM_HEALTH);
    return res.data;
  },

  broadcast: async (payload: BroadcastPayload) => {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN.BROADCAST, payload);
    return res.data;
  },
};
