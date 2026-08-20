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
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; name: string; password: string }) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (typeof window === 'undefined') {
      set({ isInitialized: true });
      return;
    }
    const token = localStorage.getItem('sb_token');
    const userStr = localStorage.getItem('sb_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user });
        // Verify token is still valid
        const res = await api.get('/auth/me');
        set({ user: res.data, isInitialized: true });
      } catch {
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_user');
        set({ user: null, token: null, isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('sb_token', token);
      localStorage.setItem('sb_user', JSON.stringify(user));
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
      localStorage.setItem('sb_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false });
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Galmaa\'uun hin danda\'amne';
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    set({ user: null, token: null });
  },

  updateUser: (userData) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...userData };
      localStorage.setItem('sb_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));
