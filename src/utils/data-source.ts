import {
  type DataSource,
  type IMDataSourceSchema,
  DataSourceStatus
} from 'jimu-core'

type DataSourceWithMain = DataSource & {
  getMainDataSource?: () => DataSource
  getSchema?: () => IMDataSourceSchema
}

/** Antes do query do DataSourceComponent terminar, registros costumam vir sem atributos. */
export const isProdesDataReady = (status?: DataSourceStatus): boolean =>
  status === DataSourceStatus.Loaded

export const isQueryableStatus = (status?: DataSourceStatus): boolean =>
  status === DataSourceStatus.Loaded ||
  status === DataSourceStatus.Loading

export const getMainDataSource = (ds: DataSource | null): DataSource | null => {
  if (!ds) return null
  const main = (ds as DataSourceWithMain).getMainDataSource?.()
  return main ?? ds
}

/** Usa a instância da camada selecionada (ex.: Planilha1) quando ela já é consultável. */
export const getQueryableDataSource = (ds: DataSource | null): DataSource | null => {
  if (!ds) return null
  const q = ds as DataSourceWithMain & {
    query?: (p: object) => Promise<unknown>
    load?: (p: object) => Promise<unknown>
    loadAll?: (p: object) => Promise<unknown>
  }
  if (
    typeof q.query === 'function' ||
    typeof q.load === 'function' ||
    typeof q.loadAll === 'function'
  ) {
    return ds
  }
  return getMainDataSource(ds)
}

export async function ensureDataSourceSchema (
  ds: DataSource
): Promise<IMDataSourceSchema | undefined> {
  const existing = getDataSourceSchema(ds)
  if (existing?.fields && Object.keys(existing.fields).length > 0) {
    return existing
  }
  const fetchSchema = (ds as DataSourceWithMain & {
    fetchSchema?: () => Promise<IMDataSourceSchema>
  }).fetchSchema
  if (typeof fetchSchema === 'function') {
    try {
      return await fetchSchema.call(ds)
    } catch {
      return existing
    }
  }
  return existing
}

export const getDataSourceSchema = (
  ds: DataSource
): IMDataSourceSchema | undefined =>
  (ds as DataSourceWithMain).getSchema?.()
