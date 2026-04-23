import type {
  AuthUser,
  Client,
  HistoryEntry,
  Receipt,
  Rental,
  Reservation,
  Residence,
  Room,
} from '@/types'
import { pilotRooms } from '@/data/mockRooms'

export const adminUser: AuthUser = {
  id: 'u-admin',
  name: 'Marina Duarte',
  email: 'marina.duarte@noairbnb.local',
  phone: '(31) 99900-1122',
  address: 'Av. Afonso Pena, 3000 — Belo Horizonte, MG',
  role: 'admin',
  avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=MarinaAdmin',
  preferences: 'Relatórios semanais, alertas de ocupação',
}

export const clientUser: AuthUser = {
  id: 'u-client',
  name: 'Lucas Ferreira',
  email: 'lucas.ferreira@email.com',
  phone: '(21) 98877-4455',
  address: 'Rua das Palmeiras, 120 — Rio de Janeiro, RJ',
  role: 'client',
  avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=LucasClient',
  preferences: 'Quarto silencioso, check-in flexível',
}

export const residences: Residence[] = [
  {
    id: 'r1',
    address: 'Rua dos Jacarandás',
    number: '145',
    neighborhood: 'Savassi',
    cep: '30130-100',
    phone: '(31) 3222-8899',
    email: 'savassi@noairbnb.local',
    roomCount: 6,
  },
  {
    id: 'r2',
    address: 'Av. Beira Mar',
    number: '2200',
    neighborhood: 'Copacabana',
    cep: '22021-001',
    phone: '(21) 2555-7788',
    email: 'copacabana@noairbnb.local',
    roomCount: 8,
  },
  {
    id: 'r3',
    address: 'Rua Oscar Freire',
    number: '880',
    neighborhood: 'Jardins',
    cep: '01426-001',
    phone: '(11) 4002-8922',
    email: 'jardins@noairbnb.local',
    roomCount: 4,
  },
]

export const rooms: Room[] = pilotRooms

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'Lucas Ferreira',
    cpf: '***.***.***-12',
    address: 'Rua das Palmeiras, 120 — Rio de Janeiro, RJ',
    phone: '(21) 98877-4455',
    email: 'lucas.ferreira@email.com',
  },
  {
    id: 'c2',
    name: 'Ana Paula Mendes',
    cpf: '***.***.***-88',
    address: 'Rua XV de Novembro, 400 — Curitiba, PR',
    phone: '(41) 99911-2233',
    email: 'ana.mendes@email.com',
  },
  {
    id: 'c3',
    name: 'Ricardo Almeida',
    cpf: '***.***.***-44',
    address: 'Av. Paulista, 1200 — São Paulo, SP',
    phone: '(11) 97766-5544',
    email: 'ricardo.almeida@email.com',
  },
  {
    id: 'c4',
    name: 'Helena Costa',
    cpf: '***.***.***-77',
    address: 'Rua do Sol, 55 — Florianópolis, SC',
    phone: '(48) 98800-6677',
    email: 'helena.costa@email.com',
  },
]

export const reservations: Reservation[] = [
  {
    id: 'res1',
    clientId: 'c1',
    residenceId: 'r1',
    roomId: 'q2',
    checkIn: '2026-04-02T14:00:00',
    checkOut: '2026-04-06T11:00:00',
    status: 'confirmada',
    estimatedValue: 1240,
  },
  {
    id: 'res2',
    clientId: 'c2',
    residenceId: 'r3',
    roomId: 'q3',
    checkIn: '2026-04-10T15:00:00',
    checkOut: '2026-04-14T12:00:00',
    status: 'pendente',
    estimatedValue: 1520,
  },
  {
    id: 'res3',
    clientId: 'c3',
    residenceId: 'r2',
    roomId: 'q2',
    checkIn: '2026-03-28T13:00:00',
    checkOut: '2026-03-30T10:00:00',
    status: 'confirmada',
    estimatedValue: 640,
  },
  {
    id: 'res4',
    clientId: 'c4',
    residenceId: 'r1',
    roomId: 'q1',
    checkIn: '2026-05-01T14:00:00',
    checkOut: '2026-05-05T11:00:00',
    status: 'pendente',
    estimatedValue: 2080,
  },
]

export const rentals: Rental[] = [
  {
    id: 'al1',
    clientId: 'c3',
    roomId: 'q3',
    residenceId: 'r2',
    checkIn: '2026-03-20T15:00:00',
    checkOut: '2026-03-25T11:00:00',
    nights: 5,
    total: 2700,
    paymentStatus: 'pago',
    active: false,
  },
  {
    id: 'al2',
    clientId: 'c1',
    roomId: 'q2',
    residenceId: 'r1',
    checkIn: '2026-03-24T14:00:00',
    checkOut: '2026-03-27T11:00:00',
    nights: 3,
    total: 930,
    paymentStatus: 'parcial',
    active: true,
  },
  {
    id: 'al3',
    clientId: 'c2',
    roomId: 'q3',
    residenceId: 'r3',
    checkIn: '2026-03-18T12:00:00',
    checkOut: '2026-03-22T10:00:00',
    nights: 4,
    total: 1520,
    paymentStatus: 'pago',
    active: false,
  },
]

export const receipts: Receipt[] = [
  {
    id: 'rc1',
    rentalId: 'al1',
    clientId: 'c3',
    periodLabel: '20/03/2026 — 25/03/2026',
    total: 2700,
    issuedAt: '2026-03-20T16:12:00',
  },
  {
    id: 'rc2',
    rentalId: 'al3',
    clientId: 'c2',
    periodLabel: '18/03/2026 — 22/03/2026',
    total: 1520,
    issuedAt: '2026-03-18T13:05:00',
  },
  {
    id: 'rc3',
    rentalId: 'al2',
    clientId: 'c1',
    periodLabel: '24/03/2026 — 27/03/2026',
    total: 930,
    issuedAt: '2026-03-24T14:40:00',
  },
]

export const historyEntries: HistoryEntry[] = [
  {
    id: 'h1',
    scope: 'cliente',
    refName: 'Ricardo Almeida',
    period: 'Mar/2026',
    status: 'concluido',
    notes: 'Hospedagem em Copacabana — quarto Mar Azul',
  },
  {
    id: 'h2',
    scope: 'quarto',
    refName: 'Suite Savassi I',
    period: 'Abr/2026',
    status: 'finalizado',
  },
  {
    id: 'h3',
    scope: 'cliente',
    refName: 'Helena Costa',
    period: 'Fev/2026',
    status: 'cancelado',
    notes: 'Cancelamento antecipado por força maior',
  },
  {
    id: 'h4',
    scope: 'quarto',
    refName: 'Loft Casal Aurora',
    period: 'Mar/2026',
    status: 'concluido',
  },
]

export function getResidenceById(id: string) {
  return residences.find((r) => r.id === id)
}

export function getRoomById(id: string) {
  return rooms.find((r) => r.id === id)
}

export function getClientById(id: string) {
  return clients.find((c) => c.id === id)
}

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
