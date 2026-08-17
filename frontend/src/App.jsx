import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOTP from './pages/auth/VerifyOTP'
import ForgotPassword from './pages/auth/ForgotPassword'

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard'
import Documents from './pages/dashboard/Documents'
import APIKeys from './pages/dashboard/APIKeys'
import Chat from './pages/dashboard/Chat'
import Settings from './pages/dashboard/Settings'
import Billing from './pages/dashboard/Billing'
import BillingSuccess from './pages/dashboard/BillingSuccess'
import WidgetCustomizer from './pages/dashboard/WidgetCustomizer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { loadUser, isAuthenticated } = useAuthStore()

  // Restore user from token on every page load / refresh
  useEffect(() => {
    if (isAuthenticated) {
      loadUser()
    }
  }, []) // eslint-disable-line

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* Public auth routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-otp"      element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/documents"  element={<PrivateRoute><Documents /></PrivateRoute>} />
          <Route path="/api-keys"   element={<PrivateRoute><APIKeys /></PrivateRoute>} />
          <Route path="/chat"       element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/settings"   element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/billing"    element={<PrivateRoute><Billing /></PrivateRoute>} />
          <Route path="/billing/success" element={<PrivateRoute><BillingSuccess /></PrivateRoute>} />
          <Route path="/widget"     element={<PrivateRoute><WidgetCustomizer /></PrivateRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}