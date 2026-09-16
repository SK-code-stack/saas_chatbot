import { create } from 'zustand'
import api from '../lib/axios'

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,

  setAuth: (user, access, refresh) => {
    if (access) localStorage.setItem('access_token', access)
    if (refresh) localStorage.setItem('refresh_token', refresh)
    set({ user, isAuthenticated: true })
  },

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await api.post('/api/auth/login/', { email, password })
      const { user, tokens } = res.data
      get().setAuth(user, tokens?.access, tokens?.refresh)
      return res.data
    } finally {
      set({ loading: false })
    }
  },

  register: async (payload) => {
    set({ loading: true })
    try {
      const res = await api.post('/api/auth/register/', payload)
      return res.data
    } finally {
      set({ loading: false })
    }
  },

  verifyOTP: async (email, otp) => {
    set({ loading: true })
    try {
      const res = await api.post('/api/auth/verify_otp/', { email, otp })
      const { user, tokens } = res.data
      if (tokens?.access) {
        get().setAuth(user, tokens.access, tokens.refresh)
      }
      return res.data
    } finally {
      set({ loading: false })
    }
  },

  resendOTP: async (email) => {
    const res = await api.post('/api/auth/resend_otp/', { email })
    return res.data
  },

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