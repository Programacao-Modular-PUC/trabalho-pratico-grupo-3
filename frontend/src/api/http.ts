import axios, { AxiosHeaders } from 'axios'

const TOKEN_KEY = 'noairnobnb_token'
let lastSessionWarningAt = 0

/** Rotas de autenticação que não devem enviar Bearer (evita token antigo e respostas indesejadas). */
function isAuthAnonymousPath(url: string | undefined): boolean {
  if (!url) return false
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0]
    return path.includes('/api/auth/login') || path.includes('/api/auth/register')
  } catch {
    return url.includes('/api/auth/login') || url.includes('/api/auth/register')
  }
}

export const http = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const url = config.url
  const full = typeof url === 'string' ? url : ''
  if (isAuthAnonymousPath(full)) {
    delete config.headers.Authorization
    return config
  }
  const t = localStorage.getItem(TOKEN_KEY)
  if (t) {
    config.headers.Authorization = `Bearer ${t}`
  } else {
    delete config.headers.Authorization
  }
  // Com Content-Type padrão application/json, o transformRequest do axios converte FormData em
  // JSON e quebra multipart - o servidor não recebe os ficheiros.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = AxiosHeaders.from(config.headers)
    headers.delete('Content-Type')
    config.headers = headers
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const cfg = error.config
    const rawUrl = cfg ? `${cfg.baseURL ?? ''}${cfg.url ?? ''}` : ''
    if (status === 401) {
      const isLoginAttempt = rawUrl.includes('/api/auth/login')
      if (!isLoginAttempt) {
        const now = Date.now()
        if (now - lastSessionWarningAt > 3000) {
          lastSessionWarningAt = now
          localStorage.removeItem(TOKEN_KEY)
          window.dispatchEvent(new Event('noairnobnb:auth-cleared'))
          window.dispatchEvent(new Event('noairnobnb:session-expired'))
        }
      }
    }
    return Promise.reject(error)
  },
)

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
