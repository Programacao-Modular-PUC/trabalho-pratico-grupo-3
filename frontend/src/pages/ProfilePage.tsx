import { motion } from 'framer-motion'
import { Shield, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Perfil</h1>
        <p className="mt-2 text-sm text-nanb-400">
          {isAdmin
            ? 'Dados administrativos e preferências de operação.'
            : 'Informações pessoais e preferências de estadia.'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-nanb-900/40"
      >
        <div className="flex flex-col gap-6 border-b border-white/10 p-6 sm:flex-row sm:items-center">
          <img
            src={user?.avatarUrl}
            alt=""
            className="h-20 w-20 rounded-2xl border border-white/10 bg-nanb-950 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-nanb-400">{user?.email}</p>
            <p className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-wider text-nanb-400">
              {isAdmin ? 'Administrador' : 'Cliente'}
            </p>
          </div>
          <Button type="button" variant="secondary">
            Editar perfil (mock)
          </Button>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Input label="Telefone" defaultValue={user?.phone} />
          <Input label="E-mail" type="email" defaultValue={user?.email} />
          <div className="sm:col-span-2">
            <Input label="Endereço" defaultValue={user?.address} />
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 p-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="h-4 w-4 text-nanb-300" /> Preferências
            </div>
            <p className="mt-2 text-sm text-nanb-400">{user?.preferences}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Shield className="h-4 w-4 text-nanb-300" /> Segurança
            </div>
            <p className="mt-2 text-sm text-nanb-400">
              Alteração de senha e sessões — interface apenas, sem persistência.
            </p>
            <Button className="mt-4" variant="outline" size="sm" type="button">
              Gerenciar segurança
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
