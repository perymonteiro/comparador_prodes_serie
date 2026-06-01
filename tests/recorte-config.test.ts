import {
  extractRecorteSelectValue,
  normalizeRecorteFieldConfig
} from '../src/utils/recorte-config'

describe('normalizeRecorteFieldConfig', () => {
  it('retorna string trimada', () => {
    expect(normalizeRecorteFieldConfig('  cerrado  ')).toBe('cerrado')
  })

  it('rejeita [object Object] salvo incorretamente', () => {
    expect(normalizeRecorteFieldConfig('[object Object]')).toBeUndefined()
  })

  it('extrai jimuName de objeto do Select', () => {
    expect(
      normalizeRecorteFieldConfig({ jimuName: 'amazonia_floresta', name: 'X' })
    ).toBe('amazonia_floresta')
  })

  it('extrai value ou name quando jimuName ausente', () => {
    expect(normalizeRecorteFieldConfig({ value: 'pantanal' })).toBe('pantanal')
    expect(normalizeRecorteFieldConfig({ name: 'pampa' })).toBe('pampa')
  })
})

describe('extractRecorteSelectValue', () => {
  it('prioriza value do onChange', () => {
    expect(extractRecorteSelectValue(null, 'cerrado')).toBe('cerrado')
  })

  it('usa evt.target.value como fallback', () => {
    expect(
      extractRecorteSelectValue({ target: { value: 'caatinga' } }, '')
    ).toBe('caatinga')
  })
})
