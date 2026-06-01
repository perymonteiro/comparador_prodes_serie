
/** @jsx jsx */
/** @jsxFrag React.Fragment */
import {
  React, jsx, css, Immutable,
  type ImmutableArray, type UseDataSource,
  type IMDataSourceSchema,
  type DataSource,
  AllDataSourceTypes, DataSourceComponent
} from 'jimu-core'
import { Select, Option } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { type IMConfig } from '../config'
import { getDataSourceSchema } from '../utils/data-source'
import {
  extractRecorteSelectValue,
  normalizeRecorteFieldConfig
} from '../utils/recorte-config'
import {
  detectYearField,
  formatRecorteLabel,
  getRecorteCandidateFields,
  schemaToFieldList
} from '../utils/prodes-table'

interface Props {
  id: string
  useDataSources?: ImmutableArray<UseDataSource>
  onSettingChange?: (setting: any) => void
  config?: IMConfig
}

const styles = css`
  &.widget-setting-comparador-prodes-serie {
    width: 100%;
    min-width: 0;
    overflow: visible;
  }
  & * {
    writing-mode: horizontal-tb !important;
    white-space: normal !important;
    word-break: normal !important;
  }
  .jimu-ui_setting-row {
    overflow: visible;
  }
  .jimu-ui_setting-row__label {
    min-width: 0;
    max-width: 100%;
  }
  .jimu-ui_setting-row__content {
    flex: 1 1 100%;
    min-width: 0;
    max-width: 100%;
    overflow: visible;
  }
  .setting-hint {
    font-size: 12px;
    color: #6b6b6b;
    margin-top: 6px;
    line-height: 1.4;
  }
`

const emptyConfig = () => Immutable({} as IMConfig)

const Setting = (props: Props) => {
  const { id, useDataSources, onSettingChange, config } = props
  const useDs = useDataSources?.[0]
  const yearField = config?.yearField
  const recorteField = normalizeRecorteFieldConfig(config?.recorteField)

  const [fieldList, setFieldList] = React.useState(
    [] as ReturnType<typeof schemaToFieldList>
  )

  const recorteOptions = React.useMemo(
    () => getRecorteCandidateFields(fieldList, yearField),
    [fieldList, yearField]
  )

  const applyYearField = React.useCallback(
    (fields: ReturnType<typeof schemaToFieldList>, currentRecorte?: string) => {
      const detected = detectYearField(fields)
      if (!detected) return

      let next = (config ?? emptyConfig()).set('yearField', detected)
      if (currentRecorte === detected) {
        next = next.without('recorteField')
      }
      if (detected !== yearField || currentRecorte === detected) {
        onSettingChange?.({ id, config: next })
      }
    },
    [config, id, onSettingChange, yearField]
  )

  const processSchema = React.useCallback(
    (schema: IMDataSourceSchema) => {
      const fields = schemaToFieldList(schema)
      setFieldList(fields)
      applyYearField(fields, recorteField)
    },
    [applyYearField, recorteField]
  )

  const handleDataSourceCreated = React.useCallback(
    (ds: DataSource) => {
      const schema = getDataSourceSchema(ds)
      if (schema) processSchema(schema)
    },
    [processSchema]
  )

  const handleDataSourceChange = React.useCallback(
    (newUseDataSources: UseDataSource[]) => {
      onSettingChange?.({
        id,
        useDataSources: Immutable(newUseDataSources),
        config: (config ?? emptyConfig())
          .without('yearField')
          .without('recorteField')
      })
      setFieldList([])
    },
    [config, id, onSettingChange]
  )

  React.useEffect(() => {
    const raw = config?.recorteField
    if (raw == null) return
    const normalized = normalizeRecorteFieldConfig(raw)
    if (!normalized) {
      onSettingChange?.({
        id,
        config: (config ?? emptyConfig()).without('recorteField')
      })
      return
    }
    if (typeof raw === 'string' && raw.trim() === normalized) return
    if (typeof raw !== 'string' || raw.trim() !== normalized) {
      onSettingChange?.({
        id,
        config: (config ?? emptyConfig()).set('recorteField', normalized)
      })
    }
  }, [config, id, onSettingChange])

  const handleRecorteSelect = React.useCallback(
    (evt: unknown, value: unknown) => {
      const normalized = normalizeRecorteFieldConfig(
        extractRecorteSelectValue(evt, value)
      )
      const base = config ?? emptyConfig()
      onSettingChange?.({
        id,
        config: normalized
          ? base.set('recorteField', normalized)
          : base.without('recorteField')
      })
    },
    [config, id, onSettingChange]
  )

  return (
    <div className="widget-setting-comparador-prodes-serie jimu-widget-setting w-100" css={styles}>
      {useDs && (
        <DataSourceComponent
          widgetId={id}
          useDataSource={useDs}
          onDataSourceCreated={handleDataSourceCreated}
          onDataSourceSchemaChange={processSchema}
        />
      )}

      <SettingSection title="Dados" className="w-100">
        <SettingRow label="Camada PRODES (Feature Layer)" flow="wrap" level={1}>
          <DataSourceSelector
            widgetId={id}
            isMultiple={false}
            mustUseDataSource
            types={Immutable([AllDataSourceTypes.FeatureLayer])}
            useDataSources={useDataSources}
            onChange={handleDataSourceChange}
          />
        </SettingRow>

        {useDs && (
          <SettingRow label="Recorte geográfico (coluna)" flow="wrap" level={1}>
            <div style={{ width: '100%' }}>
              <Select
                size="sm"
                className="w-100"
                value={recorteField ?? ''}
                placeholder="Selecione o recorte…"
                onChange={(evt, value) => handleRecorteSelect(evt, value)}
                disabled={recorteOptions.length === 0}
              >
                <Option value="">{''}</Option>
                {recorteOptions.map((f) => (
                  <Option
                    key={f.jimuName}
                    value={f.jimuName}
                    active={recorteField === f.jimuName}
                  >
                    {formatRecorteLabel(f)}
                  </Option>
                ))}
              </Select>
              <div className="setting-hint">
                Escolha uma coluna da tabela (ex.: Cerrado, Amazônia legal, Pantanal).
                Os anos exibidos na widget são detectados automaticamente a partir dos
                dados disponíveis para o recorte selecionado.
              </div>
            </div>
          </SettingRow>
        )}
      </SettingSection>
    </div>
  )
}

export default Setting
