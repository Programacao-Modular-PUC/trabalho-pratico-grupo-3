export type UserRole = 'admin' | 'client'

export type RoomType = 'individual' | 'casal'

export type RoomStatus = 'disponivel' | 'reservado' | 'ocupado'

export type ReservationStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida'

export type PaymentStatus = 'pendente' | 'parcial' | 'pago' | 'estornado'

export interface Residence {
  id: string
  address: string
  number: string
  neighborhood: string
  cep: string
  phone: string
  email: string
  roomCount: number
}

export interface Room {
  id: string
  residenceId: string
  /** Nome simplificado da residência/local para listagens rápidas */
  locationName: string
  label: string
  type: RoomType
  baseDaily: number
  hasAc: boolean
  hasJacuzzi: boolean
  hasWifi: boolean
  hasBreakfast: boolean
  finalDaily: number
  status: RoomStatus
  /** Texto curto para listagens e cards de exploração */
  summary: string
  /** Texto completo para tela/modal de detalhes */
  fullDescription: string
  /** URLs de imagens (primeira = capa) */
  images: string[]
  /** Texto de disponibilidade para UI (mock) */
  availabilityNote?: string
}

export interface Client {
  id: string
  name: string
  cpf: string
  address: string
  phone: string
  email: string
}

export interface Reservation {
  id: string
  clientId: string
  residenceId: string
  roomId: string
  checkIn: string
  checkOut: string
  status: ReservationStatus
  estimatedValue: number
}

export interface Rental {
  id: string
  clientId: string
  roomId: string
  residenceId: string
  checkIn: string
  checkOut: string
  nights: number
  total: number
  paymentStatus: PaymentStatus
  active: boolean
}

export interface Receipt {
  id: string
  rentalId: string
  clientId: string
  periodLabel: string
  total: number
  issuedAt: string
}

export interface HistoryEntry {
  id: string
  scope: 'cliente' | 'quarto'
  refName: string
  period: string
  status: 'finalizado' | 'cancelado' | 'concluido'
  notes?: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: UserRole
  avatarUrl?: string
  preferences?: string
}
