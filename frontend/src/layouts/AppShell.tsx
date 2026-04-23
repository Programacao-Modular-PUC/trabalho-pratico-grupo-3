import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getToken } from '../api/http'
import { ROTA_ENTRAR } from '../routes'
import { useUi } from '../components/feedback'
import { Button, LoadingState } from '../components/ui'
import { roleLabel } from '../utils/format'

type NavItem = { to: string; label: string; roles: string[] }

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Minha conta', roles: ['CLIENTE'] },
  { to: '/dashboard', label: 'Painel', roles: ['ADMIN', 'PROPRIETARIO'] },
  { to: '/explorar', label: 'Explorar quartos', roles: ['CLIENTE'] },
  { to: '/explorar', label: 'Catálogo', roles: ['ADMIN', 'PROPRIETARIO'] },
  { to: '/admin/clientes', label: 'Clientes', roles: ['ADMIN'] },
  { to: '/admin/residencias', label: 'Residências', roles: ['ADMIN'] },
  { to: '/admin/quartos', label: 'Cadastro de quartos', roles: ['ADMIN'] },
  { to: '/admin/operacao', label: 'Reservas e aluguéis', roles: ['ADMIN'] },
  { to: '/admin/pagamentos', label: 'Pagamentos', roles: ['ADMIN'] },
  { to: '/admin/historico', label: 'Histórico', roles: ['ADMIN'] },
  { to: '/prop/residencias', label: 'Residências', roles: ['PROPRIETARIO'] },
  { to: '/prop/quartos', label: 'Meus quartos', roles: ['PROPRIETARIO'] },
  { to: '/prop/movimentacao', label: 'Reservas e aluguéis', roles: ['PROPRIETARIO'] },
  { to: '/prop/perfil', label: 'Meu perfil', roles: ['PROPRIETARIO'] },
  { to: '/cli/estadias', label: 'Minhas estadias', roles: ['CLIENTE'] },
  { to: '/cli/perfil', label: 'Perfil', roles: ['CLIENTE'] },
  { to: '/cli/pagamentos', label: 'Pagamentos', roles: ['CLIENTE'] },
  { to: '/cli/historico', label: 'Histórico', roles: ['CLIENTE'] },
]

const GUEST_NAV: { to: string; label: string }[] = [{ to: '/explorar', label: 'Explorar quartos' }]

export function AppShell() {
  const { user, logout, hasRole, loading: authLoading } = useAuth()
  const { confirm, toast } = useUi()
  const nav = useNavigate()
  const location = useLocation()
  const isAuthed = Boolean(user)

  const navItems: { to: string; label: string }[] = isAuthed
    ? NAV.filter((item) => item.roles.some((r) => hasRole(r))).map(({ to, label }) => ({ to, label }))
    : GUEST_NAV

  const current =
    navItems.find((item) => {
      if (item.to === location.pathname) return true
      if (item.to === '/explorar' && location.pathname.startsWith('/explorar/')) return true
      if (
        item.to === '/cli/estadias' &&
        ['/cli/estadias', '/cli/reservas', '/cli/alugueis'].includes(location.pathname)
      )
        return true
      if (
        item.to === '/prop/movimentacao' &&
        ['/prop/movimentacao', '/prop/reservas', '/prop/alugueis'].includes(location.pathname)
      )
        return true
      if (
        item.to === '/admin/operacao' &&
        ['/admin/operacao', '/admin/reservas', '/admin/alugueis'].includes(location.pathname)
      )
        return true
      return false
    }) ?? navItems[0]

  const crumbRole = user ? roleLabel(user.roles) : 'Visitante'
  const crumbPage = current?.label ?? '-'

  async function handleLogout() {
    const shouldLogout = await confirm({
      title: 'Encerrar sessão?',
      description: 'Você pode entrar novamente a qualquer momento usando suas credenciais atuais.',
      confirmLabel: 'Sair agora',
      cancelLabel: 'Continuar aqui',
      tone: 'danger',
    })

    if (!shouldLogout) return
    logout()
    toast({
      kind: 'info',
      title: 'Sessão encerrada',
      message: 'Sua conta foi desconectada com segurança.',
    })
    nav(ROTA_ENTRAR)
  }

  if (authLoading && getToken()) {
    return (
      <div className="shell shell--boot">
        <div className="screen-center" style={{ minHeight: '60vh' }}>
          <LoadingState label="Carregando…" />
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="" className="sidebar-logo" />
          <div className="sidebar-meta">
            <div className="brand-title">NoAirNoBnb</div>
            {user ? (
              <div className="brand-sub muted">{roleLabel(user.roles)}</div>
            ) : (
              <div className="brand-sub muted small">Catálogo público</div>
            )}
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-main">
        <div className="topbar">
          <div className="topbar-copy">
            <p className="topbar-crumb">
              <span>{crumbRole}</span> › {crumbPage}
            </p>
          </div>
          <div className="topbar-actions">
            {user?.email && <span className="muted small">{user.email}</span>}
            {user ? (
              <Button type="button" variant="ghost" className="topbar-logout" onClick={() => void handleLogout()}>
                Sair
              </Button>
            ) : (
              <>
                <Link className="btn ghost topbar-logout" to={ROTA_ENTRAR}>
                  Entrar
                </Link>
                <Link className="btn primary topbar-logout" to="/cadastro">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
        <main className="shell-content">
          <div key={location.pathname} className="page-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
