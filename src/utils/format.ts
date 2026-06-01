export type VariationTone = 'positive' | 'negative' | 'neutral'

export const getVariationTone = (pct: number): VariationTone => {
  if (pct > 0) return 'positive'
  if (pct < 0) return 'negative'
  return 'neutral'
}

export const formatTableArea = (value: number): string =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

export const formatTableVariation = (pct: number): string => {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}
