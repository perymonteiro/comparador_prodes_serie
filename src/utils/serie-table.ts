import {
  calcPercentVariation,
  getValueForYear,
  type YearValueRow
} from './prodes-table'
import {
  MSG_MISSING_YEARS,
  ROW_LABEL_AREA,
  ROW_LABEL_VARIATION
} from '../constants'
import { formatTableArea, formatTableVariation } from './format'

export interface SerieTableColumn {
  year: number
  value: number
  variationPct: number | null
}

export type BuildSerieTableResult =
  | { ok: true; columns: SerieTableColumn[] }
  | { ok: false; message: string }

const CLIPBOARD_CELL_SEPARATOR = '\t'
const CLIPBOARD_ROW_SEPARATOR = '\n'

function formatVariationCell (variationPct: number | null): string {
  if (variationPct == null) return ''
  return formatTableVariation(variationPct)
}

/** Linhas da tabela exibida (rótulo + valores por ano). */
export function buildSerieTableRows (
  columns: SerieTableColumn[]
): string[][] {
  if (!columns.length) return []

  return [
    ['Ano', ...columns.map((col) => String(col.year))],
    [ROW_LABEL_AREA, ...columns.map((col) => formatTableArea(col.value))],
    [
      ROW_LABEL_VARIATION,
      ...columns.map((col) => formatVariationCell(col.variationPct))
    ]
  ]
}

/** Texto tabular (TSV) para colar no Excel com a mesma estrutura da tabela exibida. */
export function buildSerieTableClipboardText (
  columns: SerieTableColumn[]
): string {
  return buildSerieTableRows(columns)
    .map((row) => row.join(CLIPBOARD_CELL_SEPARATOR))
    .join(CLIPBOARD_ROW_SEPARATOR)
}

export async function copyTextToClipboard (text: string): Promise<boolean> {
  if (!text) return false

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // tenta fallback abaixo
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function buildSerieTable (
  series: YearValueRow[],
  anoInicial: number,
  anoFinal: number
): BuildSerieTableResult {
  if (anoFinal <= anoInicial) {
    return {
      ok: false,
      message: 'O ano final deve ser posterior ao ano inicial.'
    }
  }

  const columns: SerieTableColumn[] = []

  for (let year = anoInicial; year <= anoFinal; year++) {
    const value = getValueForYear(series, year)
    if (value == null) {
      return { ok: false, message: MSG_MISSING_YEARS }
    }

    let variationPct: number | null = null
    if (year > anoInicial) {
      const previousValue = getValueForYear(series, year - 1)
      if (previousValue == null) {
        return { ok: false, message: MSG_MISSING_YEARS }
      }
      variationPct = calcPercentVariation(previousValue, value)
    }

    columns.push({ year, value, variationPct })
  }

  return { ok: true, columns }
}
