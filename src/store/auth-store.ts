import { create } from 'zustand';
import * as authService from '../services/auth.service';
import type { AuthUser, LoginPayload, RegisterPayload } from '../services/auth.service';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasFetchedMe: boolean;
  error: string | null;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  loginWithGoogle: () => void;
  fetchMe: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasFetchedMe: false,
  error: null,

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(payload);
      set({ isLoading: false });
      return response.user;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(payload);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        hasFetchedMe: true,
      });
      return response.user;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  loginWithGoogle: () => authService.loginWithGoogle(),

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.getCurrentUser();
      set({
        user: response.user,
        isAuthenticated: Boolean(response.user),
        isLoading: false,
        hasFetchedMe: true,
      });
      return response.user;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasFetchedMe: true,
      });
      return null;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasFetchedMe: true,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
