import api from './api';
import { API_ENDPOINTS } from '@/constants';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  AdminLoginResponse,
} from '@/types/auth';

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  async register(data: RegisterRequest) {
    const response = await api.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async logout(refreshToken: string) {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
    return response.data;
  },

  async refreshToken(data: RefreshTokenRequest) {
    const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, data);
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordRequest) {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest) {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  },

  async verifyEmail(data: VerifyEmailRequest) {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
  },

  async resendVerification(data: ResendVerificationRequest) {
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest) {
    const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  },

  async adminLogin(data: LoginRequest) {
    const response = await api.post<AdminLoginResponse>(API_ENDPOINTS.ADMIN.LOGIN, data);
    return response.data;
  },

  async adminLogout(refreshToken: string) {
    const response = await api.post(API_ENDPOINTS.ADMIN.LOGOUT, { refresh_token: refreshToken });
    return response.data;
  },

  async adminRefreshToken(data: RefreshTokenRequest) {
    const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.ADMIN.REFRESH_TOKEN, data);
    return response.data;
  },

  async getAdminProfile() {
    const response = await api.get<User>(API_ENDPOINTS.ADMIN.ME);
    return response.data;
  },
};
