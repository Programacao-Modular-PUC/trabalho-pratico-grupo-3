import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../components/ui'
import { ROTA_ENTRAR } from '../routes'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) {
    return (
      <div className="screen-center">
        <LoadingState label="Carregando sua sessão…" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to={ROTA_ENTRAR} replace state={{ from: loc.pathname }} />
  }
  return <Outlet />
}

export function RequireRoles({ roles }: { roles: string[] }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="screen-center">
        <LoadingState label="Verificando acesso…" />
      </div>
    )
  }
  if (!user) return <Navigate to={ROTA_ENTRAR} replace />
  const ok = roles.some((r) => user.roles.includes(r))
  if (!ok) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function RequireRolesWrap({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="screen-center">
        <LoadingState label="Verificando permissões…" />
      </div>
    )
  }
  if (!user) return <Navigate to={ROTA_ENTRAR} replace />
  const ok = roles.some((r) => user.roles.includes(r))
  if (!ok) return <Navigate to="/dashboard" replace />
  return children
}
