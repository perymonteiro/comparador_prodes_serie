import { Immutable } from 'jimu-core'

/** Consulta padrão: todos os registros da tabela PRODES (padrão EXB). */
export const PRODES_TABLE_QUERY = Immutable({
  where: '1=1',
  outFields: ['*'],
  returnGeometry: false,
  pageSize: 2000
})

export const MSG_NOT_CONFIGURED =
  'Esta ferramenta ainda não foi configurada pelo autor da experiência.'

export const MSG_NO_DATA = 'Não há dados disponíveis para este recorte.'

export const MSG_LOAD_FAILED = 'Não foi possível carregar os dados da camada.'

export const MSG_LOADING_TABLE = 'Carregando dados da tabela PRODES…'

export const MSG_INVALID_RECORTE =
  'Recorte geográfico inválido na configuração. Abra as configurações desta widget e selecione o recorte novamente.'

export const MSG_EXTRACT_FAILED =
  'Registros encontrados, mas não foi possível extrair ano e valores para este recorte. ' +
  'Confirme se a tabela tem uma linha por ano (coluna "ano") ou uma linha por recorte (colunas com anos), ' +
  'e se a coluna do recorte possui valores preenchidos.'

export const LABEL_ANO_INICIAL = 'Ano inicial'
export const LABEL_ANO_FINAL = 'Ano final'
export const PLACEHOLDER_ANO_INICIAL = 'Selecione o ano inicial'
export const PLACEHOLDER_ANO_FINAL = 'Selecione o ano final'
export const HINT_ANO_FINAL_POSTERIOR =
  'O ano final deve ser posterior ao ano inicial.'
export const ROW_LABEL_AREA = 'Incremento de desmatamento (km²)'
export const ROW_LABEL_VARIATION =
  'Variação em relação ao ano anterior (%)'
export const MSG_MISSING_YEARS =
  'Um ou mais anos do intervalo não possuem dado para este recorte.'

export const ARIA_COPY_TABLE = 'Copiar tabela para a área de transferência'
export const TITLE_COPY_TABLE = 'Copiar tabela'
export const MSG_COPIED = 'Copiado!'
export const MSG_COPY_FAILED = 'Não foi possível copiar a tabela.'

export const ARIA_EXPORT_TABLE = 'Exportar tabela como arquivo Excel (.xlsx)'
export const TITLE_EXPORT_TABLE = 'Exportar para Excel'
export const MSG_EXPORTED = 'Arquivo gerado!'
export const MSG_EXPORT_FAILED = 'Não foi possível gerar o arquivo Excel.'
