import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminTopbar } from '@/components/layout/AdminTopbar'
import { PageTransition } from '@/components/ui/PageTransition'

const labelByPath: Record<string, string> = {
  '/admin': 'Início',
  '/admin/dashboard': 'Painel',
  '/admin/residences': 'Residências',
  '/admin/rooms': 'Quartos',
  '/admin/clients': 'Clientes',
  '/admin/reservations': 'Reservas',
  '/admin/rentals': 'Aluguéis',
  '/admin/availability': 'Disponibilidade',
  '/admin/receipts': 'Recibos',
  '/admin/history': 'Histórico',
  '/admin/profile': 'Perfil',
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const breadcrumbs = useMemo(() => {
    const current = labelByPath[location.pathname] ?? 'NoAirNoBnB'
    return [
      { label: 'Admin', to: '/admin' },
      { label: current },
    ]
  }, [location.pathname])

  return (
    <div className="min-h-svh bg-nanb-950">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <AdminTopbar onMenu={() => setOpen(true)} breadcrumbs={breadcrumbs} />
        <main className="px-4 py-8 sm:px-6 lg:px-10">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
