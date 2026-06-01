/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetProps,
  DataSourceComponent,
  QueryScope
} from 'jimu-core'
import { Loading, Label, Button } from 'jimu-ui'
import type { IMConfig } from '../config'
import {
  HINT_ANO_FINAL_POSTERIOR,
  LABEL_ANO_FINAL,
  LABEL_ANO_INICIAL,
  MSG_NOT_CONFIGURED,
  MSG_NO_DATA,
  PLACEHOLDER_ANO_FINAL,
  PLACEHOLDER_ANO_INICIAL,
  PRODES_TABLE_QUERY
} from '../constants'
import { normalizeRecorteFieldConfig } from '../utils/recorte-config'
import { buildSerieExportFileName } from '../utils/serie-xlsx'
import { SerieTable } from './components/serie-table'
import { useProdesSeries } from './hooks/use-prodes-series'
import { useYearRangeSelection } from './hooks/use-year-range-selection'
import { widgetStyles } from './styles'
import { YearSelect } from './year-select'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const useDs = props.useDataSources?.[0]
  const yearField = props.config?.yearField
  const recorteField = normalizeRecorteFieldConfig(props.config?.recorteField)

  const {
    series,
    loading,
    loadingMessage,
    error,
    handleDataSourceReady,
    handleDataSourceInfoChange,
    applySchema,
    waitingForLayer
  } = useProdesSeries({
    recorteField,
    yearField,
    widgetId: props.id
  })

  const availableYears = React.useMemo(
    () => series.map((r) => r.year),
    [series]
  )

  const {
    anoInicial,
    anoFinal,
    yearsForInicial,
    yearsForFinal,
    tableResult,
    hasSelection,
    clearSelection,
    handleAnoInicialChange,
    handleAnoFinalChange
  } = useYearRangeSelection(series, availableYears, recorteField)

  const isConfigured = Boolean(useDs && recorteField)
  const showForm =
    isConfigured && !loading && !waitingForLayer && !error && series.length > 0

  const exportFileName = React.useMemo(() => {
    if (anoInicial == null || anoFinal == null || !recorteField) {
      return 'prodes-serie.xlsx'
    }
    return buildSerieExportFileName(recorteField, anoInicial, anoFinal)
  }, [anoInicial, anoFinal, recorteField])

  return (
    <div className="widget-comparador-prodes-serie jimu-widget" css={widgetStyles}>
      {useDs && (
        <DataSourceComponent
          useDataSource={useDs}
          widgetId={props.id}
          query={PRODES_TABLE_QUERY}
          queryScope={QueryScope.InAllData}
          queryAll
          onDataSourceCreated={handleDataSourceReady}
          onDataSourceSchemaChange={(schema) => {
            applySchema(schema)
          }}
          onDataSourceInfoChange={handleDataSourceInfoChange}
        />
      )}

      {!isConfigured && <p>{MSG_NOT_CONFIGURED}</p>}

      {isConfigured && (loading || waitingForLayer) && (
        <div>
          <Loading />
          {loadingMessage && (
            <p className="comparador-hint">{loadingMessage}</p>
          )}
        </div>
      )}

      {isConfigured && error && <p className="comparador-error">{error}</p>}

      {isConfigured &&
        !loading &&
        !waitingForLayer &&
        !error &&
        series.length === 0 && <p>{MSG_NO_DATA}</p>}

      {showForm && (
        <div className="comparador-form">
          <div className="comparador-field-row">
            <Label>{LABEL_ANO_INICIAL}</Label>
            <YearSelect
              availableYears={yearsForInicial}
              value={anoInicial}
              placeholder={PLACEHOLDER_ANO_INICIAL}
              onChange={handleAnoInicialChange}
            />
          </div>

          <div className="comparador-field-row">
            <Label>{LABEL_ANO_FINAL}</Label>
            <YearSelect
              availableYears={yearsForFinal}
              value={anoFinal}
              placeholder={PLACEHOLDER_ANO_FINAL}
              onChange={handleAnoFinalChange}
            />
            <div className="comparador-hint">{HINT_ANO_FINAL_POSTERIOR}</div>
          </div>

          <div className="comparador-actions">
            <Button
              size="sm"
              type="secondary"
              className="comparador-btn-limpar"
              disabled={!hasSelection}
              onClick={clearSelection}
            >
              Limpar
            </Button>
          </div>

          {anoInicial != null &&
            anoFinal != null &&
            tableResult != null &&
            tableResult.ok === false && (
            <p className="comparador-error comparador-error--block">
              {tableResult.message}
            </p>
          )}

          {tableResult != null && tableResult.ok === true && (
            <SerieTable
              columns={tableResult.columns}
              exportFileName={exportFileName}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Widget
