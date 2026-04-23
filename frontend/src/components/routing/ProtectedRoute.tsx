import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

export function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { role: current, user } = useAuth()
  const location = useLocation()

  if (!user || current !== role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
