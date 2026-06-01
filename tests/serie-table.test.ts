import {
  buildSerieTable,
  buildSerieTableClipboardText,
  buildSerieTableRows
} from '../src/utils/serie-table'
import { formatTableArea, formatTableVariation } from '../src/utils/format'
import {
  buildSerieExportFileName,
  buildSerieTableWorksheetXml,
  buildSerieTableXlsxBlob,
  buildSerieTableXlsxRows
} from '../src/utils/serie-xlsx'
import {
  buildChartXml,
  buildDrawingXml,
  buildSerieChartSpec
} from '../src/utils/serie-xlsx-chart'
import {
  ROW_LABEL_AREA,
  ROW_LABEL_VARIATION
} from '../src/constants'

const mockupSeries = [
  { year: 2021, value: 824.47 },
  { year: 2022, value: 789.41 },
  { year: 2023, value: 723.13 },
  { year: 2024, value: 842.44 },
  { year: 2025, value: 291.21 }
]

describe('buildSerieTable', () => {
  it('rejects when ano final is not after ano inicial', () => {
    const result = buildSerieTable(mockupSeries, 2025, 2021)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('posterior')
    }
  })

  it('rejects equal years', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2021)
    expect(result.ok).toBe(false)
  })

  it('builds columns for sparse years in range (skips gaps)', () => {
    const sparse = [
      { year: 2021, value: 100 },
      { year: 2023, value: 200 }
    ]
    const result = buildSerieTable(sparse, 2021, 2023)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.columns).toHaveLength(2)
    expect(result.columns[1].variationPct).toBeCloseTo(100, 5)
  })

  it('returns error when ano inicial or final is missing from series', () => {
    const sparse = [
      { year: 2021, value: 100 },
      { year: 2023, value: 200 }
    ]
    const result = buildSerieTable(sparse, 2021, 2025)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('não possuem dado')
    }
  })

  it('builds columns for 2021–2025 with null variation on first year', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2025)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.columns).toHaveLength(5)
    expect(result.columns[0]).toEqual({
      year: 2021,
      value: 824.47,
      variationPct: null
    })
  })

  it('computes year-over-year variations matching mockup values', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2025)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const variations = result.columns
      .map((col) => col.variationPct)
      .filter((v): v is number => v != null)

    expect(variations[0]).toBeCloseTo(-4.25, 2)
    expect(variations[1]).toBeCloseTo(-8.4, 1)
    expect(variations[2]).toBeCloseTo(16.5, 1)
    expect(variations[3]).toBeCloseTo(-65.43, 2)
  })
})

describe('formatTableArea and formatTableVariation', () => {
  it('formats area without unit suffix', () => {
    expect(formatTableArea(824.47)).toBe('824,47')
  })

  it('formats variation with explicit sign and without percent symbol', () => {
    expect(formatTableVariation(16.5)).toBe('+16,50')
    expect(formatTableVariation(-4.25)).toBe('-4,25')
  })
})

describe('buildSerieTableRows and clipboard text', () => {
  it('builds row matrix for export and clipboard', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2025)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const rows = buildSerieTableRows(result.columns)
    expect(rows).toEqual([
      ['Ano', '2021', '2022', '2023', '2024', '2025'],
      [
        ROW_LABEL_AREA,
        '824,47',
        '789,41',
        '723,13',
        '842,44',
        '291,21'
      ],
      [ROW_LABEL_VARIATION, '', '-4,25', '-8,40', '+16,50', '-65,43']
    ])
  })

  it('builds tab-separated rows for Excel paste', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2025)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const text = buildSerieTableClipboardText(result.columns)
    const lines = text.split('\n')

    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('Ano\t2021\t2022\t2023\t2024\t2025')
    expect(lines[1]).toBe(
      `${ROW_LABEL_AREA}\t824,47\t789,41\t723,13\t842,44\t291,21`
    )
    expect(lines[2]).toBe(
      `${ROW_LABEL_VARIATION}\t\t-4,25\t-8,40\t+16,50\t-65,43`
    )
  })
})

describe('serie xlsx export helpers', () => {
  it('builds a safe export file name', () => {
    expect(buildSerieExportFileName('pantanal', 2021, 2025)).toBe(
      'prodes-serie-pantanal-2021-2025.xlsx'
    )
  })

  it('builds typed rows with numeric metric cells', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2023)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const rows = buildSerieTableXlsxRows(result.columns)
    expect(rows[0][1]).toEqual({ kind: 'number', value: 2021 })
    expect(rows[1][1]).toEqual({ kind: 'number', value: 824.47 })
    expect(rows[2][1]).toEqual({ kind: 'empty' })
    expect(rows[2][2]).toEqual({ kind: 'number', value: expect.closeTo(-4.25, 2) })
  })

  it('generates worksheet xml with numeric cells and native chart drawing', async () => {
    const result = buildSerieTable(mockupSeries, 2021, 2023)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const rows = buildSerieTableXlsxRows(result.columns)
    const sheetXml = buildSerieTableWorksheetXml(rows, true)
    expect(sheetXml).toContain('<v>2021</v>')
    expect(sheetXml).toContain('<v>2022</v>')
    expect(sheetXml).toContain('<v>824.47</v>')
    expect(sheetXml).toContain('<v>789.41</v>')
    expect(sheetXml).toContain('<v>-4.25</v>')
    expect(sheetXml).not.toContain('824,47')
    expect(sheetXml).toMatch(/<c r="B2"><v>824\.47<\/v><\/c>/)
    expect(sheetXml).toContain('<drawing r:id="rId1"/>')

    const blob = await buildSerieTableXlsxBlob(rows, result.columns)
    expect(blob.type).toContain('spreadsheetml')
    expect(blob.size).toBeGreaterThan(500)
  })
})

describe('serie xlsx chart', () => {
  it('builds chart spec with cell range formulas', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2025)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const spec = buildSerieChartSpec(result.columns)
    expect(spec).not.toBeNull()
    if (!spec) return

    expect(spec.categoryFormula).toBe('PRODES!$B$1:$F$1')
    expect(spec.valueFormula).toBe('PRODES!$B$2:$F$2')
    expect(spec.seriesNameFormula).toBe('PRODES!$A$2')
    expect(spec.years).toEqual([2021, 2022, 2023, 2024, 2025])
    expect(spec.values[0]).toBe(824.47)
  })

  it('builds native column chart without legend linked to sheet cells', () => {
    const result = buildSerieTable(mockupSeries, 2021, 2023)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const spec = buildSerieChartSpec(result.columns)
    expect(spec).not.toBeNull()
    if (!spec) return

    const chartXml = buildChartXml(spec)
    expect(chartXml).toContain('barDir val="col"')
    expect(chartXml).toContain('PRODES!$B$1:$D$1')
    expect(chartXml).toContain('PRODES!$B$2:$D$2')
    expect(chartXml).toMatch(/<c:cat>[\s\S]*<c:numRef>/)
    expect(chartXml).toContain('<c:v>2021</c:v>')
    expect(chartXml).toContain('<c:v>824.47</c:v>')
    expect(chartXml).not.toContain('<c:legend>')
    expect(buildDrawingXml(3)).toContain('<xdr:twoCellAnchor>')
    expect(buildDrawingXml(3)).toContain('<c:chart r:id="rId1"/>')
    expect(buildDrawingXml(25)).toContain('<xdr:col>30</xdr:col>')
  })
})
