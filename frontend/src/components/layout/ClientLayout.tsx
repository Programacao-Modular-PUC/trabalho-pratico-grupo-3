import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ClientSidebar } from '@/components/layout/ClientSidebar'
import { ClientTopbar } from '@/components/layout/ClientTopbar'
import { PageTransition } from '@/components/ui/PageTransition'

const labelByPath: Record<string, string> = {
  '/client': 'Minha conta',
  '/client/explore': 'Explorar',
  '/client/profile': 'Perfil',
}

export function ClientLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const breadcrumbs = useMemo(() => {
    const current = labelByPath[location.pathname] ?? 'NoAirNoBnB'
    return [{ label: 'Cliente', to: '/client' }, { label: current }]
  }, [location.pathname])

  return (
    <div className="min-h-svh bg-nanb-950">
      <ClientSidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <ClientTopbar onMenu={() => setOpen(true)} breadcrumbs={breadcrumbs} />
        <main className="px-4 py-10 sm:px-8 lg:px-12">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
