import { create } from 'zustand';
import api from '../api/axios';

export interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },

  fetchProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // ✅ Use backend route that reads token from headers
      const res = await api.get('/auth/profile');
      set({ user: res.data });
    } catch (err) {
      console.error('Failed to fetch profile', err);
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
