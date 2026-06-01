import {
  buildYearSeries,
  buildYearSeriesFromRecorteRows,
  buildYearSeriesInferred,
  buildYearSeriesFromAttributeRows,
  describeRowsForExtractError,
  enrichAttributeRowsWithRecords,
  detectYearKeyFromRows,
  readAttributeFlexible,
  readRecordValue,
  getPlainAttributes,
  recordHasReadableData,
  calcPercentVariation,
  computeVariation,
  areConsecutiveYears,
  computePeriodVariation,
  formatPeriodLabel,
  formatPeriodRangeLabel,
  normalizeYearValueSeries,
  yearsInclude,
  getYearsAllowedForFinal,
  getYearsAllowedForInicial,
  sumValuesForYears,
  toggleConsecutiveYear,
  detectYearField,
  formatPercentVariation,
  formatRecorteLabel,
  formatRecorteLabelFromName,
  formatYearsRangeSummary,
  getAttributeKey,
  getRecorteCandidateFields,
  getRecorteHiddenFieldNames,
  isEmptyCell,
  isNumericRecorteField,
  isYearOutOfTypicalRange,
  parseNumericValue,
  parseYear,
  resolveAttributeKeys,
  schemaToFieldList
} from '../src/utils/prodes-table'
import { Immutable, JimuFieldType, EsriFieldType, type IMDataSourceSchema } from 'jimu-core'

const anexoFields = [
  { jimuName: 'ano', name: 'ano', type: JimuFieldType.Number },
  {
    jimuName: 'amazonia_floresta',
    name: 'amazonia_floresta',
    type: JimuFieldType.String,
    esriType: EsriFieldType.Double
  },
  { jimuName: 'amazonia_n_floresta', name: 'amazonia_n_floresta', type: JimuFieldType.Number },
  { jimuName: 'amazonia_total', name: 'amazonia_total', type: JimuFieldType.Number },
  { jimuName: 'amazonia_legal', name: 'amazonia_legal', type: JimuFieldType.Number },
  { jimuName: 'cerrado', name: 'cerrado', type: JimuFieldType.Number },
  { jimuName: 'caatinga', name: 'caatinga', type: JimuFieldType.Number },
  { jimuName: 'mata_atlantica', name: 'mata_atlantica', type: JimuFieldType.Number },
  { jimuName: 'pampa', name: 'pampa', type: JimuFieldType.Number },
  { jimuName: 'pantanal', name: 'pantanal', type: JimuFieldType.Number }
]

describe('prodes-table utils', () => {
  it('isEmptyCell detects null, empty string and NaN', () => {
    expect(isEmptyCell(null)).toBe(true)
    expect(isEmptyCell('')).toBe(true)
    expect(isEmptyCell('  ')).toBe(true)
    expect(isEmptyCell(Number.NaN)).toBe(true)
    expect(isEmptyCell(0)).toBe(false)
    expect(isEmptyCell(1.5)).toBe(false)
  })

  it('parseNumericValue parses Brazilian decimal format', () => {
    expect(parseNumericValue('1.551,80')).toBe(1551.8)
    expect(parseNumericValue('26.933,02')).toBe(26933.02)
    expect(parseNumericValue(6319.02)).toBe(6319.02)
    expect(parseNumericValue(null)).toBe(null)
  })

  it('parseYear accepts number and string', () => {
    expect(parseYear(2020)).toBe(2020)
    expect(parseYear('2021')).toBe(2021)
    expect(parseYear('x')).toBe(null)
  })

  it('parseYear interprets ArcGIS pt-BR year display (2.001 = 2001)', () => {
    expect(parseYear(2.001)).toBe(2001)
    expect(parseYear(2.011)).toBe(2011)
    expect(parseYear('2.008')).toBe(2008)
    expect(parseYear('2.009')).toBe(2009)
  })

  it('detectYearKeyFromRows finds Ano column from pt-BR year values', () => {
    const rows = [
      { Ano: 2.001, cerrado: 1 },
      { Ano: 2.002, cerrado: 2 },
      { Ano: 2.003, cerrado: 3 }
    ]
    expect(detectYearKeyFromRows(rows, 'ano')).toBe('Ano')
  })

  it('enrichAttributeRowsWithRecords fills recorte values from Jimu records', () => {
    const rows = [
      { OBJECTID: 1, ano: 2008, cerrado: null },
      { OBJECTID: 2, ano: 2009, cerrado: null }
    ]
    const records = [
      {
        getId: () => '1',
        getFieldValue: (name: string) =>
          name === 'cerrado' ? 100 : name === 'ano' ? 2008 : undefined,
        getData: () => ({ attributes: {} })
      },
      {
        getId: () => '2',
        getFieldValue: (name: string) =>
          name === 'cerrado' ? 200 : name === 'ano' ? 2009 : undefined,
        getData: () => ({ attributes: {} })
      }
    ]
    const enriched = enrichAttributeRowsWithRecords(
      rows,
      records as any,
      'ano',
      'cerrado'
    )
    const series = buildYearSeriesFromAttributeRows(enriched, 'ano', 'cerrado')
    expect(series).toEqual([
      { year: 2008, value: 100 },
      { year: 2009, value: 200 }
    ])
  })

  it('buildYearSeriesFromAttributeRows uses only requested recorte column', () => {
    const rows = [
      { Ano: 2.008, amazonia_floresta: 9999, cerrado: 100 },
      { Ano: 2.009, amazonia_floresta: 8888, cerrado: 200 }
    ]
    const fields = [
      { jimuName: 'ano', name: 'Ano', type: JimuFieldType.Number },
      { jimuName: 'amazonia_floresta', name: 'amazonia_floresta', type: JimuFieldType.Number },
      { jimuName: 'cerrado', name: 'cerrado', type: JimuFieldType.Number }
    ]
    const series = buildYearSeriesFromAttributeRows(
      rows,
      'ano',
      'cerrado',
      fields as any
    )
    expect(series).toEqual([
      { year: 2008, value: 100 },
      { year: 2009, value: 200 }
    ])
  })

  it('buildYearSeriesFromAttributeRows infers recorte column when hint does not match key', () => {
    const rows = [
      { Ano: 2.008, amazonia_floresta: 100 },
      { Ano: 2.009, amazonia_floresta: 200 }
    ]
    const series = buildYearSeriesFromAttributeRows(
      rows,
      'ano',
      'amazonia_floresta'
    )
    expect(series).toEqual([
      { year: 2008, value: 100 },
      { year: 2009, value: 200 }
    ])
  })

  it('describeRowsForExtractError lists detected columns', () => {
    const rows = [{ Ano: 2.008, cerrado: 1 }]
    const msg = describeRowsForExtractError(rows, 'cerrado')
    expect(msg).toContain('Ano')
    expect(msg).toContain('cerrado')
    expect(msg).toContain('Recorte configurado')
  })

  it('buildYearSeriesFromAttributeRows reads raw REST attribute rows', () => {
    const rows = [
      { Ano: 2001, amazonia_floresta: null },
      { Ano: 2008, amazonia_floresta: 12418.65 },
      { Ano: 2009, amazonia_floresta: 5886.84 }
    ]
    const series = buildYearSeriesFromAttributeRows(
      rows,
      'ano',
      'amazonia_floresta'
    )
    expect(series).toEqual([
      { year: 2008, value: 12418.65 },
      { year: 2009, value: 5886.84 }
    ])
  })

  it('buildYearSeries handles Ano as 2.00x and sparse amazonia_floresta', () => {
    const fields = [
      { jimuName: 'ano', name: 'Ano', alias: 'Ano', type: JimuFieldType.Number },
      {
        jimuName: 'amazonia_floresta',
        name: 'amazonia_floresta',
        type: JimuFieldType.Number
      }
    ]
    const records = [
      { attributes: { Ano: 2.001, amazonia_floresta: null } },
      { attributes: { Ano: 2.007, amazonia_floresta: null } },
      { attributes: { Ano: 2.008, amazonia_floresta: '12.418,65' } },
      { attributes: { Ano: 2.009, amazonia_floresta: '5.886,84' } }
    ]
    const series = buildYearSeries(records, 'ano', 'amazonia_floresta', fields as any)
    expect(series).toEqual([
      { year: 2008, value: 12418.65 },
      { year: 2009, value: 5886.84 }
    ])
  })

  it('detectYearField prefers ano from anexo schema', () => {
    expect(detectYearField(anexoFields as any)).toBe('ano')
  })

  it('isNumericRecorteField accepts Double esri type', () => {
    const field = anexoFields[1] as any
    expect(isNumericRecorteField(field)).toBe(true)
  })

  it('getAttributeKey prefers service field name', () => {
    expect(getAttributeKey({ jimuName: 'cerrado', name: 'CERRADO', type: JimuFieldType.Number } as any)).toBe('CERRADO')
  })

  it('getRecorteCandidateFields lists 9 recortes including Double field', () => {
    const recortes = getRecorteCandidateFields(anexoFields as any, 'ano')
    expect(recortes.map((f) => f.jimuName).sort()).toEqual(
      [
        'amazonia_floresta',
        'amazonia_legal',
        'amazonia_n_floresta',
        'amazonia_total',
        'caatinga',
        'cerrado',
        'mata_atlantica',
        'pampa',
        'pantanal'
      ].sort()
    )
  })

  it('resolveAttributeKeys maps jimuName to attribute keys', () => {
    const keys = resolveAttributeKeys(anexoFields as any, 'ano', 'cerrado')
    expect(keys).toEqual({ yearKey: 'ano', recorteKey: 'cerrado' })
  })

  it('formatRecorteLabel formats snake_case names', () => {
    expect(formatRecorteLabelFromName('amazonia_legal')).toBe('Amazonia Legal')
    expect(formatRecorteLabel({ jimuName: 'cerrado', name: 'cerrado', type: JimuFieldType.Number } as any)).toBe('Cerrado')
  })

  it('formatYearsRangeSummary describes detected years', () => {
    expect(
      formatYearsRangeSummary([
        { year: 2008, value: 1 },
        { year: 2020, value: 2 }
      ])
    ).toBe('2008–2020 (2 anos)')
  })

  it('getRecorteHiddenFieldNames hides year and OID', () => {
    const fields = [
      { jimuName: 'OBJECTID', type: JimuFieldType.Number, esriType: EsriFieldType.OID },
      { jimuName: 'ano', type: JimuFieldType.Number },
      { jimuName: 'cerrado', type: JimuFieldType.Number }
    ]
    const hidden = getRecorteHiddenFieldNames(fields as any, 'ano')
    expect(hidden).toContain('OBJECTID')
    expect(hidden).toContain('ano')
    expect(hidden).not.toContain('cerrado')
  })

  it('buildYearSeries omits empty cells and sorts by year', () => {
    const records = [
      { attributes: { ano: 2001, cerrado: 10 } },
      { attributes: { ano: 2002, cerrado: null } },
      { attributes: { ano: 2003, cerrado: '30' } },
      { attributes: { ano: 2004, cerrado: '' } }
    ]
    const series = buildYearSeries(records, 'ano', 'cerrado')
    expect(series).toEqual([
      { year: 2001, value: 10 },
      { year: 2003, value: 30 }
    ])
  })

  it('buildYearSeries resolves service field names via schema', () => {
    const records = [
      { attributes: { ANO: 2010, CERRADO: '1.551,80' } }
    ]
    const fields = [
      { jimuName: 'ano', name: 'ANO', type: JimuFieldType.Number },
      { jimuName: 'cerrado', name: 'CERRADO', type: JimuFieldType.Number }
    ]
    const series = buildYearSeries(records, 'ano', 'cerrado', fields as any)
    expect(series).toEqual([{ year: 2010, value: 1551.8 }])
  })

  it('buildYearSeriesInferred resolves service field names on attributes', () => {
    const records = [{ attributes: { ANO: 2015, CERRADO: 2500 } }]
    const series = buildYearSeriesInferred(records, 'ano', 'cerrado')
    expect(series).toEqual([{ year: 2015, value: 2500 }])
  })

  it('readRecordValue uses getDataBeforeMapping when getData is empty', () => {
    const rec = {
      getData: () => ({}),
      getDataBeforeMapping: () => ({ ANO: 2018, cerrado: 100 }),
      getFieldValue: () => undefined
    }
    expect(
      buildYearSeries([rec], 'ano', 'cerrado', [
        { jimuName: 'ano', name: 'ANO', type: JimuFieldType.Number },
        { jimuName: 'cerrado', name: 'cerrado', type: JimuFieldType.Number }
      ] as any)
    ).toEqual([{ year: 2018, value: 100 }])
  })

  it('getPlainAttributes reads flat Jimu getData map (Enterprise)', () => {
    const rec = {
      getData: () => ({ ano: 2010, cerrado: '1.551,80', amazonia_legal: 200 })
    }
    expect(getPlainAttributes(rec)).toMatchObject({
      ano: 2010,
      cerrado: '1.551,80',
      amazonia_legal: 200
    })
    expect(buildYearSeries([rec], 'ano', 'cerrado')).toEqual([
      { year: 2010, value: 1551.8 }
    ])
  })

  it('recordHasReadableData rejects empty getFieldValue stubs', () => {
    const stub = {
      getFieldValue: () => undefined,
      getData: () => ({ attributes: {} })
    }
    expect(recordHasReadableData(stub)).toBe(false)
    expect(
      recordHasReadableData({
        getFieldValue: (name: string) => (name === 'ano' ? 2020 : undefined),
        getData: () => ({ attributes: {} })
      })
    ).toBe(true)
  })

  it('readRecordValue uses getFieldValue when attributes are empty', () => {
    const rec = {
      getData: () => ({ attributes: {} }),
      getFieldValue: (name: string) => {
        if (name === 'ano') return 2015
        if (name === 'cerrado') return '2.500,00'
        return undefined
      }
    }
    expect(readRecordValue(rec, { jimuName: 'ano', name: 'ano', type: JimuFieldType.Number } as any, 'ano')).toBe(2015)
    expect(readRecordValue(rec, { jimuName: 'cerrado', name: 'cerrado', type: JimuFieldType.Number } as any, 'cerrado')).toBe('2.500,00')
    expect(buildYearSeries([rec], 'ano', 'cerrado')).toEqual([{ year: 2015, value: 2500 }])
  })

  it('buildYearSeriesFromRecorteRows reads year columns on matching row', () => {
    const fields = [
      { jimuName: 'recorte', name: 'recorte', type: JimuFieldType.String },
      { jimuName: '2008', name: '2008', type: JimuFieldType.Number },
      { jimuName: '2009', name: '2009', type: JimuFieldType.Number }
    ]
    const records = [
      { attributes: { recorte: 'cerrado', '2008': 10, '2009': 20 } },
      { attributes: { recorte: 'pampa', '2008': 1, '2009': 2 } }
    ]
    const series = buildYearSeriesFromRecorteRows(records, 'cerrado', fields as any)
    expect(series).toEqual([
      { year: 2008, value: 10 },
      { year: 2009, value: 20 }
    ])
  })

  it('readAttributeFlexible matches keys case-insensitively', () => {
    const attrs = { Ano: 2020, Cerrado: 100 }
    expect(
      readAttributeFlexible(attrs, { jimuName: 'ano', name: 'ano', type: JimuFieldType.Number } as any, 'ano')
    ).toBe(2020)
    expect(
      readAttributeFlexible(attrs, { jimuName: 'cerrado', name: 'cerrado', type: JimuFieldType.Number } as any, 'cerrado')
    ).toBe(100)
  })

  it('buildYearSeries handles anexo sparse amazonia_floresta and BR numbers', () => {
    const records = [
      { attributes: { ano: 2007, amazonia_floresta: null } },
      { attributes: { ano: 2008, amazonia_floresta: '1.551,80' } },
      { attributes: { ano: 2009, amazonia_floresta: 2000 } }
    ]
    const series = buildYearSeries(records, 'ano', 'amazonia_floresta')
    expect(series).toEqual([
      { year: 2008, value: 1551.8 },
      { year: 2009, value: 2000 }
    ])
  })

  it('schemaToFieldList reads schema fields', () => {
    const schema = Immutable({
      fields: {
        ano: { jimuName: 'ano', name: 'ano', type: JimuFieldType.Number },
        cerrado: { jimuName: 'cerrado', name: 'cerrado', type: JimuFieldType.Number }
      }
    }) as unknown as IMDataSourceSchema
    expect(schemaToFieldList(schema).map((f) => f.jimuName).sort()).toEqual(['ano', 'cerrado'])
  })

  it('isYearOutOfTypicalRange flags years outside 2001-2025', () => {
    expect(isYearOutOfTypicalRange(2000)).toBe(true)
    expect(isYearOutOfTypicalRange(2020)).toBe(false)
    expect(isYearOutOfTypicalRange(2026)).toBe(true)
  })

  it('calcPercentVariation computes change from initial to final year', () => {
    expect(calcPercentVariation(100, 150)).toBe(50)
    expect(calcPercentVariation(200, 150)).toBe(-25)
    expect(calcPercentVariation(0, 100)).toBe(null)
  })

  it('formatPercentVariation uses two decimal places pt-BR', () => {
    expect(formatPercentVariation(12.3456)).toMatch(/12,35%/)
    expect(formatPercentVariation(-3.1)).toMatch(/-3,10%/)
  })

  it('computeVariation validates year order and missing data', () => {
    const series = [
      { year: 2010, value: 1000 },
      { year: 2020, value: 1250 }
    ]
    const ok = computeVariation(series, 2010, 2020)
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.data.pct).toBe(25)
    }
    expect(computeVariation(series, 2020, 2010).ok).toBe(false)
    expect(computeVariation(series, 2010, 2015).ok).toBe(false)
  })

  it('sumValuesForYears sums multiple years', () => {
    const series = [
      { year: 2010, value: 100 },
      { year: 2011, value: 200 },
      { year: 2020, value: 500 }
    ]
    expect(sumValuesForYears(series, [2010, 2011])).toBe(300)
    expect(sumValuesForYears(series, [2010, 2015])).toBe(null)
  })

  it('formatPeriodLabel formats single and multiple years', () => {
    expect(formatPeriodLabel([2020])).toBe('2020')
    expect(formatPeriodLabel([2010, 2011, 2012])).toBe('2010–2012 (3 anos)')
  })

  it('formatPeriodRangeLabel omits year count', () => {
    expect(formatPeriodRangeLabel([2020])).toBe('2020')
    expect(formatPeriodRangeLabel([2010, 2011, 2012])).toBe('2010–2012')
  })

  it('getYearsAllowedForInicial and getYearsAllowedForFinal enforce order', () => {
    const all = [2008, 2009, 2010, 2018, 2019]
    expect(getYearsAllowedForInicial(all, [2018, 2019])).toEqual([2008, 2009, 2010])
    expect(getYearsAllowedForFinal(all, [2008, 2009])).toEqual([2010, 2018, 2019])
  })

  it('toggleConsecutiveYear toggles and rejects gaps', () => {
    expect(toggleConsecutiveYear([2010], 2011)).toEqual({
      next: [2010, 2011],
      rejected: false
    })
    expect(toggleConsecutiveYear([2010, 2011], 2010)).toEqual({
      next: [2011],
      rejected: false
    })
    expect(toggleConsecutiveYear([2010], 2012)).toEqual({
      next: [2010],
      rejected: true
    })
  })

  it('areConsecutiveYears detects gaps', () => {
    expect(areConsecutiveYears([2010, 2011, 2012])).toBe(true)
    expect(areConsecutiveYears([2010])).toBe(true)
    expect(areConsecutiveYears([2010, 2012])).toBe(false)
  })

  it('computePeriodVariation sums periods and validates rules', () => {
    const series = [
      { year: 2008, value: 100 },
      { year: 2009, value: 150 },
      { year: 2018, value: 400 },
      { year: 2019, value: 500 }
    ]
    const ok = computePeriodVariation(series, [2008, 2009], [2018, 2019])
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.data.valueInicial).toBe(250)
      expect(ok.data.valueFinal).toBe(900)
      expect(ok.data.pct).toBe(260)
    }

    expect(computePeriodVariation(series, [2008], [2018, 2019]).ok).toBe(false)
    expect(computePeriodVariation(series, [2008, 2009], [2009, 2018]).ok).toBe(false)
    expect(computePeriodVariation(series, [2018], [2008]).ok).toBe(false)
    expect(computePeriodVariation(series, [2008, 2010], [2018, 2019]).ok).toBe(false)
  })

  it('yearsInclude matches numeric selection against string years from layer', () => {
    const allowed = getYearsAllowedForFinal(['2001', '2002', '2006'], [2001])
    expect(yearsInclude(allowed, 2006)).toBe(true)
    expect(yearsInclude(allowed, '2006')).toBe(true)
  })

  it('normalizeYearValueSeries coerces string years', () => {
    const rows = normalizeYearValueSeries([
      { year: '2001' as unknown as number, value: 10 },
      { year: '2006' as unknown as number, value: 20 }
    ])
    expect(rows).toEqual([
      { year: 2001, value: 10 },
      { year: 2006, value: 20 }
    ])
  })
})
