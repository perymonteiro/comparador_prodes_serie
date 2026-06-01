import { React } from 'jimu-core'
import {
  getYearsAllowedForFinal,
  getYearsAllowedForInicial,
  yearsInclude,
  type YearValueRow
} from '../../utils/prodes-table'
import { buildSerieTable } from '../../utils/serie-table'

export function useYearRangeSelection (
  series: YearValueRow[],
  availableYears: number[],
  recorteField?: string
) {
  const [anoInicial, setAnoInicial] = React.useState<number | null>(null)
  const [anoFinal, setAnoFinal] = React.useState<number | null>(null)

  const yearsForInicial = React.useMemo(
    () =>
      getYearsAllowedForInicial(
        availableYears,
        anoFinal != null ? [anoFinal] : []
      ),
    [availableYears, anoFinal]
  )

  const yearsForFinal = React.useMemo(
    () =>
      getYearsAllowedForFinal(
        availableYears,
        anoInicial != null ? [anoInicial] : []
      ),
    [availableYears, anoInicial]
  )

  const tableResult = React.useMemo(() => {
    if (anoInicial == null || anoFinal == null) return null
    return buildSerieTable(series, anoInicial, anoFinal)
  }, [anoInicial, anoFinal, series])

  const hasSelection = anoInicial != null || anoFinal != null

  const clearSelection = React.useCallback(() => {
    setAnoInicial(null)
    setAnoFinal(null)
  }, [])

  const handleAnoInicialChange = React.useCallback((year: number | null) => {
    setAnoInicial(year)
  }, [])

  const handleAnoFinalChange = React.useCallback((year: number | null) => {
    setAnoFinal(year)
  }, [])

  React.useEffect(() => {
    setAnoInicial(null)
    setAnoFinal(null)
  }, [recorteField])

  React.useEffect(() => {
    if (anoInicial == null || anoFinal == null) return
    const allowedFinal = getYearsAllowedForFinal(availableYears, [anoInicial])
    if (!yearsInclude(allowedFinal, anoFinal)) {
      setAnoFinal(null)
    }
  }, [anoInicial, anoFinal, availableYears])

  React.useEffect(() => {
    if (anoInicial == null || anoFinal == null) return
    const allowedInicial = getYearsAllowedForInicial(availableYears, [anoFinal])
    if (!yearsInclude(allowedInicial, anoInicial)) {
      setAnoInicial(null)
    }
  }, [anoInicial, anoFinal, availableYears])

  return {
    anoInicial,
    anoFinal,
    yearsForInicial,
    yearsForFinal,
    tableResult,
    hasSelection,
    clearSelection,
    handleAnoInicialChange,
    handleAnoFinalChange
  }
}
