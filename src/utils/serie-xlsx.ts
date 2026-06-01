import {
  ROW_LABEL_AREA,
  ROW_LABEL_VARIATION
} from '../constants'
import type { SerieTableColumn } from './serie-table'
import {
  buildChartXml,
  buildContentTypesXml,
  buildDrawingRelsXml,
  buildDrawingXml,
  buildSerieChartSpec,
  buildSheetRelsXml,
  DRAWING_REL_ID
} from './serie-xlsx-chart'
import {
  columnLetter,
  escapeXml,
  formatOoxmlNumber
} from './serie-xlsx-cells'

type JSZipInstance = {
  file: (name: string, data: string) => void
  folder: (name: string) => JSZipInstance | null
  generateAsync: (options: {
    type: 'blob'
    mimeType?: string
    compression?: string
  }) => Promise<Blob>
}

function createZip (): JSZipInstance {
  const JSZip = require('jszip') as new () => JSZipInstance
  return new JSZip()
}

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export type XlsxCell =
  | { kind: 'text'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'empty' }

function cellRef (col: number, row: number): string {
  return `${columnLetter(col)}${row + 1}`
}

function buildCellXml (ref: string, cell: XlsxCell): string {
  if (cell.kind === 'empty') return ''

  if (cell.kind === 'text') {
    return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(
      cell.value
    )}</t></is></c>`
  }

  return `<c r="${ref}"><v>${formatOoxmlNumber(cell.value)}</v></c>`
}

/** Matriz tipada para exportação xlsx (rótulos em texto, métricas em número). */
export function buildSerieTableXlsxRows (
  columns: SerieTableColumn[]
): XlsxCell[][] {
  if (!columns.length) return []

  return [
    [
      { kind: 'text', value: 'Ano' },
      ...columns.map((col) => ({ kind: 'number' as const, value: col.year }))
    ],
    [
      { kind: 'text', value: ROW_LABEL_AREA },
      ...columns.map((col) => ({ kind: 'number' as const, value: col.value }))
    ],
    [
      { kind: 'text', value: ROW_LABEL_VARIATION },
      ...columns.map((col) =>
        col.variationPct == null
          ? ({ kind: 'empty' as const })
          : { kind: 'number' as const, value: col.variationPct }
      )
    ]
  ]
}

function buildWorksheetXml (
  rows: XlsxCell[][],
  includeDrawing = false
): string {
  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, colIndex) => buildCellXml(cellRef(colIndex, rowIndex), cell))
        .join('')
      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join('')

  const drawing = includeDrawing
    ? `<drawing r:id="${DRAWING_REL_ID}"/>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetData>${rowXml}</sheetData>${drawing}
</worksheet>`
}

export function buildSerieTableWorksheetXml (
  rows: XlsxCell[][],
  includeDrawing = false
): string {
  return buildWorksheetXml(rows, includeDrawing)
}

function sanitizeFileName (fileName: string): string {
  const trimmed = fileName.trim() || 'prodes-serie.xlsx'
  const withExt = trimmed.toLowerCase().endsWith('.xlsx')
    ? trimmed
    : `${trimmed}.xlsx`
  return withExt.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
}

export async function buildSerieTableXlsxBlob (
  rows: XlsxCell[][],
  columns?: SerieTableColumn[]
): Promise<Blob> {
  const zip = createZip()
  const chartSpec =
    columns && columns.length > 0 ? buildSerieChartSpec(columns) : null
  const includeChart = chartSpec != null

  const worksheetXml = buildWorksheetXml(rows, includeChart)

  zip.file('[Content_Types].xml', buildContentTypesXml(includeChart))
  zip.folder('_rels')?.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  )
  zip.folder('xl')?.folder('_rels')?.file(
    'workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  )
  zip.folder('xl')?.file(
    'workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="PRODES" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
  )
  zip.folder('xl')?.folder('worksheets')?.file('sheet1.xml', worksheetXml)

  if (includeChart && chartSpec) {
    zip.folder('xl')?.folder('worksheets')?.folder('_rels')?.file(
      'sheet1.xml.rels',
      buildSheetRelsXml()
    )
    zip.folder('xl')?.folder('drawings')?.file(
      'drawing1.xml',
      buildDrawingXml(columns?.length ?? 5)
    )
    zip.folder('xl')?.folder('drawings')?.folder('_rels')?.file(
      'drawing1.xml.rels',
      buildDrawingRelsXml()
    )
    zip.folder('xl')?.folder('charts')?.file(
      'chart1.xml',
      buildChartXml(chartSpec)
    )
  }

  return zip.generateAsync({
    type: 'blob',
    mimeType: XLSX_MIME,
    compression: 'DEFLATE'
  })
}

export function downloadBlob (blob: Blob, fileName: string): void {
  const safeName = sanitizeFileName(fileName)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = safeName
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export async function downloadSerieTableXlsx (
  columns: SerieTableColumn[],
  fileName: string
): Promise<boolean> {
  const rows = buildSerieTableXlsxRows(columns)
  if (!rows.length) return false

  try {
    const blob = await buildSerieTableXlsxBlob(rows, columns)
    downloadBlob(blob, fileName)
    return true
  } catch {
    return false
  }
}

export function buildSerieExportFileName (
  recorteSlug: string,
  anoInicial: number,
  anoFinal: number
): string {
  const safeRecorte = recorteSlug
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const recortePart = safeRecorte || 'recorte'
  return `prodes-serie-${recortePart}-${anoInicial}-${anoFinal}.xlsx`
}

export {
  buildSerieChartSpec,
  buildChartXml,
  buildDrawingXml
} from './serie-xlsx-chart'
