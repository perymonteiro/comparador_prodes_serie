import { calcPercentVariation, normalizeYearValueSeries, type YearValueRow } from './prodes-table'
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
  anoInicialRaw: number,
  anoFinalRaw: number
): BuildSerieTableResult {
  const anoInicial = Number(anoInicialRaw)
  const anoFinal = Number(anoFinalRaw)

  if (!Number.isFinite(anoInicial) || !Number.isFinite(anoFinal)) {
    return { ok: false, message: MSG_MISSING_YEARS }
  }

  if (anoFinal <= anoInicial) {
    return {
      ok: false,
      message: 'O ano final deve ser posterior ao ano inicial.'
    }
  }

  const normalizedSeries = normalizeYearValueSeries(series)

  const rowsInRange = normalizedSeries
    .filter((row) => row.year >= anoInicial && row.year <= anoFinal)
    .sort((a, b) => a.year - b.year)

  if (!rowsInRange.length) {
    return { ok: false, message: MSG_MISSING_YEARS }
  }

  if (rowsInRange[0].year !== anoInicial || rowsInRange[rowsInRange.length - 1].year !== anoFinal) {
    return { ok: false, message: MSG_MISSING_YEARS }
  }

  const columns: SerieTableColumn[] = rowsInRange.map((row, index) => {
    let variationPct: number | null = null
    if (index > 0) {
      const previousValue = rowsInRange[index - 1].value
      if (previousValue == null || row.value == null) {
        return null
      }
      variationPct = calcPercentVariation(previousValue, row.value)
    }
    if (row.value == null) {
      return null
    }
    return { year: row.year, value: row.value, variationPct }
  })

  if (columns.some((col) => col == null)) {
    return { ok: false, message: MSG_MISSING_YEARS }
  }

  return { ok: true, columns: columns as SerieTableColumn[] }
}
