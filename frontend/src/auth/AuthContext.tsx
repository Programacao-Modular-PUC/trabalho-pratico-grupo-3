import axios from 'axios'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getToken, http, setToken } from '../api/http'
import { ROTA_ENTRAR } from '../routes'
import type { Usuario } from '../api/types'

type AuthContextValue = {
  user: Usuario | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (payload: {
    nome: string
    cpf: string
    endereco: string
    telefone: string
    email: string
    senha: string
  }) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
  hasRole: (...roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await http.get<Usuario>('/api/auth/me')
      setUser(data)
    } catch {
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/'
    const isTelaEntrada = path === ROTA_ENTRAR || path === '/login'
    if (isTelaEntrada) {
      // Evita GET /api/auth/me com JWT antigo/inválido ao abrir a tela de login (401 + desafio HTTP no browser).
      setToken(null)
      setUser(null)
      setLoading(false)
      return
    }
    if (!getToken()) {
      setLoading(false)
      return
    }
    void refreshMe()
  }, [refreshMe])

  useEffect(() => {
    function onAuthCleared() {
      setUser(null)
    }
    window.addEventListener('noairnobnb:auth-cleared', onAuthCleared)
    return () => window.removeEventListener('noairnobnb:auth-cleared', onAuthCleared)
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await http.post<{ token: string; usuario: Usuario }>('/api/auth/login', {
      email: email.trim().toLowerCase(),
      senha,
    })
    setToken(data.token)
    try {
      const { data: me } = await http.get<Usuario>('/api/auth/me')
      setUser(me)
    } catch {
      setToken(null)
      setUser(null)
      throw new Error('Sessão não pôde ser confirmada. Tente novamente.')
    }
  }, [])

  const register = useCallback(
    async (payload: {
      nome: string
      cpf: string
      endereco: string
      telefone: string
      email: string
      senha: string
    }) => {
      await http.post('/api/auth/register/cliente', {
        ...payload,
        cpf: payload.cpf.replace(/\D/g, ''),
        email: payload.email.trim().toLowerCase(),
      })
      await login(payload.email, payload.senha)
    },
    [login],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!user?.roles) return false
      return roles.some((r) => user.roles.includes(r))
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
      hasRole,
    }),
    [user, loading, login, register, logout, refreshMe, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora de AuthProvider')
  return ctx
}

function parseErrorPayload(data: unknown): Record<string, unknown> | null {
  if (data == null) return null
  if (typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>
  if (typeof data === 'string') {
    const s = data.trim()
    if (!s) return null
    try {
      const o = JSON.parse(s) as unknown
      if (typeof o === 'object' && o !== null && !Array.isArray(o)) return o as Record<string, unknown>
    } catch {
      return { message: s }
    }
  }
  return null
}

export function getApiErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const body = parseErrorPayload(err.response?.data)
    if (body) {
      const msg = body.message
      if (typeof msg === 'string' && msg.trim()) return msg.trim()

      const fieldErrors = body.fieldErrors
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const first = fieldErrors[0] as Record<string, unknown>
        const fm = first?.message
        if (typeof fm === 'string' && fm.trim()) return fm.trim()
      }

      const code = body.code ?? body.error
      if (typeof code === 'string' && code === 'NAO_AUTENTICADO') {
        return 'Sessão expirada ou inexistente. Faça login novamente.'
      }
    }

    if (status === 401) {
      const rawUrl = `${err.config?.baseURL ?? ''}${err.config?.url ?? ''}`
      if (rawUrl.includes('/api/auth/login')) {
        return 'E-mail ou senha incorretos. Contas de teste no README: admin@noairnobnb.com / Admin@123 (e demais perfis).'
      }
      return 'Sessão inválida ou expirada. Faça login novamente.'
    }
    if (status === 403) {
      return 'Acesso negado a este recurso.'
    }
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Erro inesperado'
}
