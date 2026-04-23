import type { Quarto } from '../api/types'
import { localIso } from './format'

/** Alinhado ao padrão em `application.yml` (horário de corte das diárias). */
export const PREVIEW_DIARIA_HOUR = 12

/** Padrão `application.yml` (extras) + regras de família (alinhado ao backend). */
export const PREVIEW_PRICING = {
  extraAr: 0.2,
  extraHidro: 0.25,
} as const

export const PREVIEW_FAMILIA = {
  percentualAcrescimoSobreBasePorHospedeAcimaPrimeiro: 0.04,
  taxaDiariaPorAmbiente: 12,
  descontoProgressivoPorHospedeGrupo: 0.02,
  descontoGrupoMaximo: 0.2,
} as const

function parseLocalDateTime(value: string): Date | null {
  if (!value) return null
  const normalized = localIso(value)
  const d = new Date(normalized)
  return Number.isNaN(d.getTime()) ? null : d
}

function calendarDaysBetween(a: Date, b: Date): number {
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.floor((end - start) / 86_400_000)
}

function boundaryOnDate(ref: Date, hour: number): Date {
  const d = new Date(ref)
  d.setHours(hour, 0, 0, 0)
  return d
}

function isDepoisCorte(dt: Date, hour: number): boolean {
  const b = boundaryOnDate(dt, hour)
  return dt.getTime() > b.getTime()
}

function alinharInicio(entrada: Date, hour: number): Date {
  const b = boundaryOnDate(entrada, hour)
  return entrada.getTime() > b.getTime() ? b : new Date(b.getTime() - 86_400_000)
}

function alinharFim(saida: Date, hour: number): Date {
  const b = boundaryOnDate(saida, hour)
  return saida.getTime() > b.getTime() ? new Date(b.getTime() + 86_400_000) : b
}

/**
 * Espelha `DailyCalculatorServiceImpl` (regra das 12h) para pré-visualização no front.
 * Não substitui a validação da API.
 */
export function previewNumeroDiarias(entradaStr: string, saidaStr: string, hour = PREVIEW_DIARIA_HOUR): number | null {
  const entrada = parseLocalDateTime(entradaStr)
  const saida = parseLocalDateTime(saidaStr)
  if (!entrada || !saida) return null
  if (saida.getTime() <= entrada.getTime()) return null

  const diffDias = calendarDaysBetween(entrada, saida)
  const ciDepois = isDepoisCorte(entrada, hour)
  const coDepois = isDepoisCorte(saida, hour)

  if (diffDias <= 1) {
    if (diffDias === 0) return 1
    if (ciDepois && !coDepois) return 1
    if (!ciDepois && coDepois) return 2
    if (ciDepois && coDepois) return 2
    return 1
  }

  const inicio = alinharInicio(entrada, hour)
  const fim = alinharFim(saida, hour)
  if (fim.getTime() <= inicio.getTime()) return 1

  const minutes = (fim.getTime() - inicio.getTime()) / 60_000
  const dias = Math.ceil(minutes / (24 * 60))
  return dias <= 0 ? null : dias
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function n(v: string | null | undefined): number {
  if (v === null || v === undefined || v === '') return 0
  const x = Number(v)
  return Number.isNaN(x) ? 0 : x
}

function capacidadeFamiliaLocal(q: Pick<Quarto, 'famCamasSolteiro' | 'famCamaCasalComum' | 'famCamaCasalGrande'>) {
  const s = q.famCamasSolteiro ?? 0
  const cc = q.famCamaCasalComum ?? 0
  const cg = q.famCamaCasalGrande ?? 0
  return s + 2 * (cc + cg)
}

export type HospedagemCotacaoPreview = {
  /** Obrigatório para FAMILIA; recomendado para CASAL; ignorado no INDIVIDUAL. */
  numeroHospedes?: number
  solicitaBerco?: boolean
}

/**
 * Pós-regra de tipo, antes de extras AR/hidro — espelha `RegrasEspecificasTipoQuartoDiariaStrategy`.
 */
export function previewBasePorTipoAposRegras(
  quarto: Pick<
    Quarto,
    | 'tipoQuarto'
    | 'valorBaseDiaria'
    | 'numCamasSolteiro'
    | 'adicionalDiariaPorCamaExtra'
    | 'tipoCamaCasal'
    | 'permiteBerco'
    | 'taxaDiariaBerco'
    | 'adicionalConfortoCamaComum'
    | 'adicionalConfortoQueenKing'
    | 'famCamasSolteiro'
    | 'famCamaCasalComum'
    | 'famCamaCasalGrande'
    | 'famAmbientesDistintos'
    | 'capacidadeMaximaHospedes'
  >,
  cot: HospedagemCotacaoPreview = {},
) {
  const base = n(quarto.valorBaseDiaria)
  if (Number.isNaN(base)) return 0
  const t = quarto.tipoQuarto
  if (t === 'INDIVIDUAL') {
    const camas = Math.max(1, quarto.numCamasSolteiro ?? 1)
    const adic = n(quarto.adicionalDiariaPorCamaExtra)
    return base + adic * Math.max(0, camas - 1)
  }
  if (t === 'CASAL') {
    const isQueen = quarto.tipoCamaCasal === 'QUEEN_OU_KING'
    const conf = isQueen ? n(quarto.adicionalConfortoQueenKing) : n(quarto.adicionalConfortoCamaComum)
    let sub = base + conf
    if (cot.solicitaBerco && quarto.permiteBerco) {
      sub += n(quarto.taxaDiariaBerco)
    }
    return sub
  }
  if (t === 'FAMILIA') {
    const fam = PREVIEW_FAMILIA
    const cap = quarto.capacidadeMaximaHospedes ?? Math.max(1, capacidadeFamiliaLocal(quarto))
    const hIn = cot.numeroHospedes ?? 1
    const h = Math.min(Math.max(1, hIn), cap)
    const fatorHospedes = 1 + fam.percentualAcrescimoSobreBasePorHospedeAcimaPrimeiro * (h - 1)
    const partePessoas = base * fatorHospedes
    const amb = (quarto.famAmbientesDistintos ?? 0) * fam.taxaDiariaPorAmbiente
    const bruto = partePessoas + amb
    if (h < 3) return bruto
    let des = (h - 2) * fam.descontoProgressivoPorHospedeGrupo
    if (des > fam.descontoGrupoMaximo) des = fam.descontoGrupoMaximo
    return bruto * (1 - des)
  }
  return base
}

function extrasMultiplicador(
  ar: boolean,
  hid: boolean,
  p: typeof PREVIEW_PRICING = PREVIEW_PRICING,
) {
  let f = 1
  if (ar) f += p.extraAr
  if (hid) f += p.extraHidro
  return f
}

export function previewValorDiariaUnitaria(
  quarto: Pick<
    Quarto,
    | 'tipoQuarto'
    | 'valorBaseDiaria'
    | 'possuiArCondicionado'
    | 'possuiHidromassagem'
    | 'numCamasSolteiro'
    | 'adicionalDiariaPorCamaExtra'
    | 'tipoCamaCasal'
    | 'permiteBerco'
    | 'taxaDiariaBerco'
    | 'adicionalConfortoCamaComum'
    | 'adicionalConfortoQueenKing'
    | 'famCamasSolteiro'
    | 'famCamaCasalComum'
    | 'famCamaCasalGrande'
    | 'famAmbientesDistintos'
    | 'capacidadeMaximaHospedes'
  >,
  cot: HospedagemCotacaoPreview = {},
  p = PREVIEW_PRICING,
) {
  const apos = previewBasePorTipoAposRegras(quarto, cot)
  const mult = extrasMultiplicador(!!quarto.possuiArCondicionado, !!quarto.possuiHidromassagem, p)
  return roundMoney(apos * mult)
}

export type HospedagemPreview = {
  numeroDiarias: number
  valorDiaria: number
  valorTotal: number
}

export function previewHospedagem(
  quarto: Parameters<typeof previewValorDiariaUnitaria>[0],
  entradaStr: string,
  saidaStr: string,
  cot: HospedagemCotacaoPreview = {},
): HospedagemPreview | null {
  const nDias = previewNumeroDiarias(entradaStr, saidaStr)
  if (nDias === null || nDias <= 0) return null
  const valorDiaria = previewValorDiariaUnitaria(quarto, cot)
  return {
    numeroDiarias: nDias,
    valorDiaria,
    valorTotal: roundMoney(valorDiaria * nDias),
  }
}
