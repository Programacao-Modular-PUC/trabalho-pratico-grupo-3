import { Bell, Menu, UserCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/LogoMark'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export function AdminTopbar({
  onMenu,
  breadcrumbs,
}: {
  onMenu: () => void
  breadcrumbs: { label: string; to?: string }[]
}) {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-nanb-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            className="h-10 w-10 p-0 lg:hidden"
            onClick={onMenu}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/admin" className="hidden items-center gap-3 sm:flex">
            <LogoMark size="sm" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-white">NoAirNoBnB</p>
              <p className="truncate text-[11px] text-nanb-500">Operação</p>
            </div>
          </Link>
        </div>
        <div className="hidden min-w-0 flex-1 px-4 md:block">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="relative h-10 w-10 p-0"
            aria-label="Notificações (mock)"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white" />
          </Button>
          <Link to="/admin/profile">
            <Button variant="secondary" size="sm" type="button" className="gap-2">
              <UserCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.name.split(' ')[0]}</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" type="button" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
