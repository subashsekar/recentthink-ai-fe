import { API_ENDPOINTS } from '@/constants';
import type {
  AdminLoginResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  User,
  VerifyEmailRequest,
} from '@/types/auth';
import { apiClient } from './client';

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    return res.data;
  },
  register: async (data: RegisterRequest) => {
    const res = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return res.data;
  },
  logout: async (refreshToken: string) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
    return res.data;
  },
  refreshToken: async (data: RefreshTokenRequest) => {
    const res = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, data);
    return res.data;
  },
  forgotPassword: async (data: ForgotPasswordRequest) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return res.data;
  },
  resetPassword: async (data: ResetPasswordRequest) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return res.data;
  },
  verifyEmail: async (data: VerifyEmailRequest) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return res.data;
  },
  resendVerification: async (data: ResendVerificationRequest) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data);
    return res.data;
  },
  me: async () => {
    const res = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return res.data;
  },
  changePassword: async (data: ChangePasswordRequest) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return res.data;
  },

  adminLogin: async (data: LoginRequest) => {
    const res = await apiClient.post<AdminLoginResponse>(API_ENDPOINTS.ADMIN.LOGIN, data);
    return res.data;
  },
  adminLogout: async (refreshToken: string) => {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN.LOGOUT, { refresh_token: refreshToken });
    return res.data;
  },
  adminRefreshToken: async (data: RefreshTokenRequest) => {
    const res = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.ADMIN.REFRESH_TOKEN, data);
    return res.data;
  },
  adminMe: async () => {
    const res = await apiClient.get<User>(API_ENDPOINTS.ADMIN.ME);
    return res.data;
  },
};
