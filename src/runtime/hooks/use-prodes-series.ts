import {
  React,
  type DataSource,
  type IMDataSourceSchema,
  DataSourceStatus
} from 'jimu-core'
import {
  attributeRowsScore,
  describeRowsForExtractError,
  detectYearField,
  enrichAttributeRowsWithRecords,
  loadProdesYearSeries,
  schemaToFieldList,
  type YearValueRow
} from '../../utils/prodes-table'
import {
  ensureDataSourceSchema,
  getQueryableDataSource,
  isProdesDataReady
} from '../../utils/data-source'
import {
  MSG_EXTRACT_FAILED,
  MSG_INVALID_RECORTE,
  MSG_LOAD_FAILED,
  MSG_LOADING_TABLE
} from '../../constants'
import { normalizeRecorteFieldConfig } from '../../utils/recorte-config'

export interface UseProdesSeriesParams {
  recorteField?: string
  yearField?: string
  widgetId?: string
}

export function useProdesSeries ({
  recorteField,
  yearField,
  widgetId
}: UseProdesSeriesParams) {
  const [dsRef, setDsRef] = React.useState<DataSource | null>(null)
  const [dsStatus, setDsStatus] = React.useState<DataSourceStatus | undefined>(undefined)
  const [fieldList, setFieldList] = React.useState(
    [] as ReturnType<typeof schemaToFieldList>
  )
  const [series, setSeries] = React.useState<YearValueRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadingMessage, setLoadingMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [dsInfoVersion, setDsInfoVersion] = React.useState<number | undefined>(
    undefined
  )

  const effectiveYearField = yearField ?? detectYearField(fieldList)
  const effectiveRecorteField = normalizeRecorteFieldConfig(recorteField)

  const applySchema = React.useCallback((schema: IMDataSourceSchema) => {
    setFieldList(schemaToFieldList(schema))
  }, [])

  const handleDataSourceReady = React.useCallback((ds: DataSource) => {
    setDsRef(ds)
    void ensureDataSourceSchema(ds).then((schema) => {
      if (schema) applySchema(schema)
    })
  }, [applySchema])

  const loadSeries = React.useCallback(async () => {
    const main = getQueryableDataSource(dsRef)
    if (!main || !effectiveYearField) {
      setSeries([])
      return
    }

    if (recorteField != null && !effectiveRecorteField) {
      setSeries([])
      setError(MSG_INVALID_RECORTE)
      return
    }

    if (!effectiveRecorteField) {
      setSeries([])
      return
    }

    if (!isProdesDataReady(dsStatus)) return

    setLoading(true)
    setLoadingMessage(MSG_LOADING_TABLE)
    setError(null)

    const fetchOpts = {
      yearFieldJimu: effectiveYearField,
      recorteFieldJimu: effectiveRecorteField,
      fields: fieldList.length > 0 ? fieldList : undefined,
      widgetId
    }

    try {
      const { series: built, records, rows } = await loadProdesYearSeries(
        main,
        fetchOpts
      )
      setSeries(built)

      if (built.length === 0) {
        if (rows.length === 0 && records.length === 0) {
          setError(MSG_LOAD_FAILED)
        } else if (rows.length > 0 && attributeRowsScore(rows) <= 1) {
          setError(MSG_LOAD_FAILED)
        } else {
          setError(
            MSG_EXTRACT_FAILED +
              describeRowsForExtractError(
                rows,
                effectiveRecorteField,
                fieldList.length > 0 ? fieldList : undefined
              )
          )
        }
      }
    } catch {
      setError(MSG_LOAD_FAILED)
      setSeries([])
    } finally {
      setLoading(false)
      setLoadingMessage(null)
    }
  }, [
    dsRef,
    dsStatus,
    effectiveYearField,
    effectiveRecorteField,
    recorteField,
    fieldList,
    widgetId
  ])

  const handleDataSourceInfoChange = React.useCallback(
    (info: { status?: DataSourceStatus; version?: number }) => {
      setDsStatus(info?.status)
      if (info?.version != null) {
        setDsInfoVersion(info.version)
      }
    },
    []
  )

  React.useEffect(() => {
    if (!effectiveRecorteField || !effectiveYearField || !dsRef) return
    if (!isProdesDataReady(dsStatus)) return
    loadSeries()
  }, [
    effectiveRecorteField,
    effectiveYearField,
    dsRef,
    dsStatus,
    dsInfoVersion,
    fieldList,
    loadSeries
  ])

  const waitingForLayer =
    !dsRef ||
    dsStatus === DataSourceStatus.Loading ||
    dsStatus === DataSourceStatus.NotReady ||
    dsStatus === DataSourceStatus.Unloaded

  return {
    series,
    loading,
    loadingMessage,
    error,
    handleDataSourceReady,
    handleDataSourceInfoChange,
    applySchema,
    waitingForLayer
  }
}
