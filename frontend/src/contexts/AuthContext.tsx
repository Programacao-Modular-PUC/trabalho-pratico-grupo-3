/* eslint-disable react-refresh/only-export-components -- context + hook pattern */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { adminUser, clientUser } from '@/data/mockData'
import type { AuthUser, UserRole } from '@/types'

interface AuthState {
  user: AuthUser | null
  role: UserRole | null
}

interface AuthContextValue extends AuthState {
  login: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null })

  const login = useCallback((role: UserRole) => {
    setState({
      role,
      user: role === 'admin' ? adminUser : clientUser,
    })
  }, [])

  const logout = useCallback(() => {
    setState({ user: null, role: null })
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
