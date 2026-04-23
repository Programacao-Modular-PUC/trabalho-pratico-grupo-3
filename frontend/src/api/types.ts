export type PageResponse<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

export type Usuario = {
  id: number
  email: string
  ativo: boolean
  roles: string[]
  createdAt?: string
  updatedAt?: string
}

export type Cliente = {
  id: number
  nome: string
  cpf: string
  endereco: string
  telefone: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export type Proprietario = {
  id: number
  usuarioId: number
  nome: string
  telefone: string
  email: string
}

export type Residencia = {
  id: number
  endereco: string
  numero: string
  bairro: string
  cep: string
  telefone: string
  email: string
  proprietarioId: number
  proprietarioNome: string
}

export type QuartoImagemRef = {
  id: number
  /** Caminho relativo (ex.: /api/media/quarto-imagens/1) servido pelo backend. */
  url: string
}

export type Quarto = {
  id: number
  tipoQuarto: string
  valorBaseDiaria: string
  possuiArCondicionado: boolean
  possuiHidromassagem: boolean
  ativo: boolean
  imagens?: QuartoImagemRef[]
  residenciaId: number
  residenciaEndereco: string
  residenciaNumero: string
  proprietarioId: number
  proprietarioNome: string
  numCamasSolteiro?: number | null
  adicionalDiariaPorCamaExtra?: string | null
  tipoCamaCasal?: 'COMUM' | 'QUEEN_OU_KING' | null
  permiteBerco?: boolean | null
  taxaDiariaBerco?: string | null
  adicionalConfortoCamaComum?: string | null
  adicionalConfortoQueenKing?: string | null
  famCamasSolteiro?: number | null
  famCamaCasalComum?: number | null
  famCamaCasalGrande?: number | null
  famAmbientesDistintos?: number | null
  capacidadeMaximaHospedes?: number | null
}

export type Reserva = {
  id: number
  clienteId: number
  clienteNome: string
  quartoId: number
  tipoQuarto: string
  residenciaId: number
  residenciaEndereco: string
  dataHoraEntrada: string
  dataHoraSaida: string
  status: string
  valorPrevisto?: string
  numeroHospedes?: number | null
  solicitaBerco?: boolean
}

export type Aluguel = {
  id: number
  status: string
  dataHoraEntrada: string
  dataHoraSaida: string
  numeroDiarias: number
  valorTotal: string
  clienteId: number
  clienteNome: string
  quartoId: number
  tipoQuarto: string
  residenciaId: number
  residenciaEndereco: string
  pagamentoId?: number
  pagamentoStatus?: string
  formaPagamento?: string
  numeroHospedes?: number | null
  solicitaBerco?: boolean
}

export type Pagamento = {
  id: number
  valor: string
  status: string
  formaPagamento: string
  dataPagamento?: string | null
  aluguelId: number
}

export type Recibo = {
  aluguelId: number
  dataHoraEntrada: string
  dataHoraSaida: string
  numeroDiarias: number
  totalAPagar: string
  numeroHospedes?: number | null
  solicitaBerco?: boolean
  clienteId: number
  clienteNome: string
  clienteEmail: string
  quartoId: number
  tipoQuarto: string
  possuiArCondicionado: boolean
  possuiHidromassagem: boolean
  residenciaId: number
  residenciaEndereco: string
  residenciaNumero: string
  residenciaBairro: string
  residenciaCep: string
  pagamentoId: number
  valorPagamento: string
  statusPagamento: string
  formaPagamento: string
}

export type HistoricoLinha = {
  tipo: string
  id: number
  status: string
  periodoInicio: string
  periodoFim: string
  valor: string | null
  quartoId: number
  residenciaResumo: string
  registradoEm: string
}
