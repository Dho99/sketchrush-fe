import { apiRequest, getApiBaseUrl } from './api-client';

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  message: string;
  user: AuthUser;
};

type MeResponse = {
  user: AuthUser | null;
};

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function loginWithGoogle() {
  window.location.href = `${getApiBaseUrl()}/api/auth/google`;
}

export function getCurrentUser() {
  return apiRequest<MeResponse>('/api/auth/me');
}

export function logout() {
  return apiRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
}
