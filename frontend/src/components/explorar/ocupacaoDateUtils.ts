export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const

export const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

export function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function buildMonthWeeks(cursor: Date) {
  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const first = new Date(y, m, 1)
  const startPad = first.getDay()
  const lastDay = new Date(y, m + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= lastDay; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const w: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    w.push(cells.slice(i, i + 7))
  }
  return { year: y, month: m, weeks: w }
}
