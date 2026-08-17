import { create } from 'zustand'
import api from '../lib/axios'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (user, access, refresh) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    set({ user, isAuthenticated: true })
  },

  setUser: (user) => set({ user }),

  loadUser: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    try {
      const res = await api.get('/api/auth/profile/')
      set({ user: res.data, isAuthenticated: true })
    } catch {
      // Token invalid/expired — clear
      localStorage.clear()
      set({ user: null, isAuthenticated: false })
    }
  },

  logout: () => {
    localStorage.clear()
    set({ user: null, isAuthenticated: false })
  },
}))