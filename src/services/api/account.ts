import { API_ENDPOINTS } from '@/constants';
import type {
  AccountStatus,
  DeleteAccountRequest,
  DisableAccountRequest,
  EnableAccountRequest,
} from '@/types/auth';
import { apiClient } from './client';

export const accountApi = {
  getStatus: async () => {
    const res = await apiClient.get<AccountStatus>(API_ENDPOINTS.ACCOUNT.STATUS);
    return res.data;
  },

  disable: async (data: DisableAccountRequest) => {
    const res = await apiClient.patch(API_ENDPOINTS.ACCOUNT.DISABLE, data);
    return res.data;
  },

  enable: async (data: EnableAccountRequest) => {
    const res = await apiClient.post(API_ENDPOINTS.ACCOUNT.ENABLE, data);
    return res.data;
  },

  delete: async (data: DeleteAccountRequest) => {
    const res = await apiClient.delete(API_ENDPOINTS.ACCOUNT.DELETE, { data });
    return res.data;
  },
};
