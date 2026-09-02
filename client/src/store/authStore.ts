import { create } from 'zustand';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; name: string; password: string }) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const persistUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('sb_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sb_user');
  }
};

const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  isInitializing: false,

  initialize: async () => {
    if (typeof window === 'undefined') {
      set({ isInitialized: true, isInitializing: false });
      return;
    }

    if (get().isInitializing) return;

    const token = localStorage.getItem('sb_token');
    const userStr = localStorage.getItem('sb_user');

    if (!token || !userStr) {
      set({ isInitialized: true, isInitializing: false, user: null, token: null });
      return;
    }

    set({ isInitializing: true });

    try {
      const cachedUser = JSON.parse(userStr) as User;
      set({ token, user: cachedUser, isInitialized: true, isInitializing: false });

      const res = await api.get('/auth/me');
      const freshUser = res.data as User;
      persistUser(freshUser);
      set({ user: freshUser, token, isInitialized: true, isInitializing: false });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 401 || status === 403 || status === 404) {
        clearSession();
        set({ user: null, token: null, isInitialized: true, isInitializing: false });
        return;
      }

      // Keep the cached session for transient network/server issues so refresh does not log the user out.
      set({ token, user: JSON.parse(userStr) as User, isInitialized: true, isInitializing: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('sb_token', token);
      persistUser(user);
      set({ user, token, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false });
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Seenuu hin danda\'amne';
      throw new Error(msg);
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', data);
      const { user, token } = res.data;
      localStorage.setItem('sb_token', token);
      persistUser(user);
      set({ user, token, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false });
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Galmaa\'uun hin danda\'amne';
      throw new Error(msg);
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, token: null });
  },

  updateUser: (userData) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...userData };
      persistUser(updated);
      set({ user: updated });
    }
  },
}));
