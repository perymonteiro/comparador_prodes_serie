/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import {
  ARIA_COPY_TABLE,
  ARIA_EXPORT_TABLE,
  MSG_COPIED,
  MSG_COPY_FAILED,
  MSG_EXPORTED,
  MSG_EXPORT_FAILED,
  ROW_LABEL_AREA,
  ROW_LABEL_VARIATION,
  TITLE_COPY_TABLE,
  TITLE_EXPORT_TABLE
} from '../../constants'
import { formatTableArea, formatTableVariation, getVariationTone } from '../../utils/format'
import {
  buildSerieTableClipboardText,
  copyTextToClipboard,
  type SerieTableColumn
} from '../../utils/serie-table'
import { downloadSerieTableXlsx } from '../../utils/serie-xlsx'
import sheetIcon from '../assets/sheet.svg'
import copyIcon from '../assets/copy.svg'

interface SerieTableProps {
  columns: SerieTableColumn[]
  exportFileName: string
}

type ToolbarAction = 'copy' | 'export'
type ToolbarState = 'success' | 'failed'

export const SerieTable = ({ columns, exportFileName }: SerieTableProps) => {
  const [toolbarFeedback, setToolbarFeedback] = React.useState<{
    action: ToolbarAction
    state: ToolbarState
  } | null>(null)
  const resetTimerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const showFeedback = React.useCallback(
    (action: ToolbarAction, state: ToolbarState) => {
      setToolbarFeedback({ action, state })

      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current)
      }
      resetTimerRef.current = window.setTimeout(() => {
        setToolbarFeedback(null)
        resetTimerRef.current = null
      }, 2000)
    },
    []
  )

  const handleCopy = React.useCallback(async () => {
    const text = buildSerieTableClipboardText(columns)
    const ok = await copyTextToClipboard(text)
    showFeedback('copy', ok ? 'success' : 'failed')
  }, [columns, showFeedback])

  const handleExport = React.useCallback(async () => {
    const ok = await downloadSerieTableXlsx(columns, exportFileName)
    showFeedback('export', ok ? 'success' : 'failed')
  }, [columns, exportFileName, showFeedback])

  if (!columns.length) return null

  const feedbackMessage =
    toolbarFeedback?.action === 'copy'
      ? toolbarFeedback.state === 'success'
        ? MSG_COPIED
        : MSG_COPY_FAILED
      : toolbarFeedback?.action === 'export'
        ? toolbarFeedback.state === 'success'
          ? MSG_EXPORTED
          : MSG_EXPORT_FAILED
        : null

  return (
    <div className="serie-table-section">
      <div className="serie-table-toolbar">
        {feedbackMessage && (
          <span className="serie-toolbar-feedback" role="status">
            {feedbackMessage}
          </span>
        )}
        <button
          type="button"
          className="serie-toolbar-btn serie-toolbar-btn--excel"
          aria-label={ARIA_EXPORT_TABLE}
          title={TITLE_EXPORT_TABLE}
          onClick={() => {
            void handleExport()
          }}
        >
          <img
            src={sheetIcon}
            alt=""
            className="serie-toolbar-icon serie-toolbar-icon--excel"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="serie-toolbar-btn serie-toolbar-btn--copy"
          aria-label={ARIA_COPY_TABLE}
          title={TITLE_COPY_TABLE}
          onClick={() => {
            void handleCopy()
          }}
        >
          <img
            src={copyIcon}
            alt=""
            className="serie-toolbar-icon serie-toolbar-icon--copy"
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="serie-table-wrapper">
        <table className="serie-table">
          <tbody>
            <tr>
              <th scope="row" className="serie-table-label">
                Ano
              </th>
              {columns.map((col) => (
                <td key={`year-${col.year}`} className="serie-table-year">
                  {col.year}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="serie-table-label">
                {ROW_LABEL_AREA}
              </th>
              {columns.map((col) => (
                <td key={`area-${col.year}`} className="serie-table-value">
                  {formatTableArea(col.value)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="serie-table-label">
                {ROW_LABEL_VARIATION}
              </th>
              {columns.map((col) => {
                if (col.variationPct == null) {
                  return (
                    <td
                      key={`variation-${col.year}`}
                      className="serie-table-value serie-table-value--empty"
                    />
                  )
                }
                const tone = getVariationTone(col.variationPct)
                return (
                  <td
                    key={`variation-${col.year}`}
                    className={`serie-table-value serie-variation serie-variation--${tone}`}
                  >
                    {formatTableVariation(col.variationPct)}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
