import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { ExploreRoomCard } from '@/components/ui/ExploreRoomCard'
import { RoomDetailModal } from '@/components/ui/RoomDetailModal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getResidenceById, rooms } from '@/data/mockData'
import type { Room } from '@/types'

export function ClientExplorePage() {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [preco, setPreco] = useState('todos')
  const [ac, setAc] = useState(false)
  const [jac, setJac] = useState(false)
  const [selected, setSelected] = useState<Room | null>(null)

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      const match = `${r.label} ${r.locationName} ${getResidenceById(r.residenceId)?.address ?? ''} ${r.summary} ${r.fullDescription}`
        .toLowerCase()
        .includes(q.toLowerCase())
      const t = tipo === 'todos' || r.type === tipo
      const p =
        preco === 'todos' ||
        (preco === 'ate400' && r.finalDaily <= 400) ||
        (preco === '401600' && r.finalDaily > 400 && r.finalDaily <= 600) ||
        (preco === 'acima600' && r.finalDaily > 600)
      const a = !ac || r.hasAc
      const j = !jac || r.hasJacuzzi
      return match && t && p && a && j
    })
  }, [q, tipo, preco, ac, jac])

  const hasActiveFilters = q.trim() !== '' || tipo !== 'todos' || preco !== 'todos' || ac || jac

  function clearFilters() {
    setQ('')
    setTipo('todos')
    setPreco('todos')
    setAc(false)
    setJac(false)
  }

  return (
    <div className="space-y-7 pb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">Explorar quartos</h1>
        <p className="mt-2 max-w-lg text-sm text-nanb-500">Escolha o espaço certo — toque em um card para ver tudo em detalhe.</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-3 sm:px-4 sm:py-3.5">
        <div className="grid gap-2.5 md:grid-cols-12">
          <div className="md:col-span-5">
            <Input
              className="h-9 rounded-lg border-white/10 bg-nanb-900/50 text-sm transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/15"
              placeholder="Buscar bairro ou nome do quarto"
              aria-label="Buscar quartos"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              className="h-9 rounded-lg border-white/10 bg-nanb-900/50 text-xs transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/15"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="todos">Todos os tipos</option>
              <option value="individual">Individual</option>
              <option value="casal">Casal</option>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select
              className="h-9 rounded-lg border-white/10 bg-nanb-900/50 text-xs transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/15"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            >
              <option value="todos">Todas as faixas</option>
              <option value="ate400">Até R$ 400</option>
              <option value="401600">R$ 401 — 600</option>
              <option value="acima600">Acima de R$ 600</option>
            </Select>
          </div>
          <div className="flex items-center justify-end md:col-span-1">
            <button
              type="button"
              onClick={clearFilters}
              className={`text-xs transition-all duration-200 ${
                hasActiveFilters
                  ? 'text-nanb-400 hover:text-white'
                  : 'pointer-events-none text-nanb-700 opacity-40'
              }`}
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            aria-pressed={ac}
            whileTap={{ scale: 0.97 }}
            onClick={() => setAc((v) => !v)}
            className={`inline-flex h-8 items-center rounded-full border px-3 text-xs transition-all duration-200 ${
              ac
                ? 'border-white bg-white text-nanb-950'
                : 'border-white/12 bg-transparent text-nanb-300 hover:border-white/25 hover:text-white'
            }`}
          >
            Ar condicionado
          </motion.button>
          <motion.button
            type="button"
            aria-pressed={jac}
            whileTap={{ scale: 0.97 }}
            onClick={() => setJac((v) => !v)}
            className={`inline-flex h-8 items-center rounded-full border px-3 text-xs transition-all duration-200 ${
              jac
                ? 'border-white bg-white text-nanb-950'
                : 'border-white/12 bg-transparent text-nanb-300 hover:border-white/25 hover:text-white'
            }`}
          >
            Hidromassagem
          </motion.button>
        </div>
      </div>

      <p className="text-xs text-nanb-600">{filtered.length} opção(ões)</p>

      <motion.div layout transition={{ duration: 0.2, ease: 'easeOut' }} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r, i) => {
          const res = getResidenceById(r.residenceId)
          const loc = res ? `${r.locationName} · ${res.neighborhood}` : r.locationName
          return (
            <ExploreRoomCard
              key={r.id}
              room={r}
              locationLine={loc}
              delay={i * 0.05}
              onOpen={() => setSelected(r)}
            />
          )
        })}
      </motion.div>

      <RoomDetailModal
        key={selected?.id ?? 'closed'}
        room={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
