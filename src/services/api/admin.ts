import { API_ENDPOINTS } from '@/constants';
import type {
  AdminAnalytics,
  AdminModels,
  AdminUsage,
  AdminUserActionBody,
  AdminUserDetail,
  AdminUsersQuery,
  AdminUsersResponse,
  AuditLogsQuery,
  AuditLogsResponse,
  BroadcastPayload,
  Dashboard,
  SystemHealth,
} from '@/types/admin';
import { apiClient } from './client';

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

  getAnalytics: async () => {
    const res = await apiClient.get<AdminAnalytics>(API_ENDPOINTS.ADMIN.ANALYTICS);
    return res.data;
  },

  getUsage: async () => {
    const res = await apiClient.get<AdminUsage>(API_ENDPOINTS.ADMIN.USAGE);
    return res.data;
  },

  getModels: async () => {
    const res = await apiClient.get<AdminModels>(API_ENDPOINTS.ADMIN.MODELS);
    return res.data;
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
