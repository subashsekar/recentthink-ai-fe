import { create } from 'zustand';
import { config } from '@/config';
import { storage } from '@/utils/storage';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => {
    if (accessToken) {
      storage.set(config.auth.tokenKey, accessToken);
    } else {
      storage.remove(config.auth.tokenKey);
    }
    set({ accessToken });
  },

  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      storage.set(config.auth.refreshTokenKey, refreshToken);
    } else {
      storage.remove(config.auth.refreshTokenKey);
    }
    set({ refreshToken });
  },

  setLoading: (isLoading) => set({ isLoading }),

  login: (accessToken, refreshToken, user) => {
    storage.set(config.auth.tokenKey, accessToken);
    storage.set(config.auth.refreshTokenKey, refreshToken);
    storage.set(config.auth.userKey, user);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    storage.remove(config.auth.tokenKey);
    storage.remove(config.auth.refreshTokenKey);
    storage.remove(config.auth.userKey);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hydrate: () => {
    try {
      const accessToken = storage.get<string>(config.auth.tokenKey);
      const refreshToken = storage.get<string>(config.auth.refreshTokenKey);
      const user = storage.get<User>(config.auth.userKey);

      if (accessToken && refreshToken && user) {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
