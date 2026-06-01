/** @jsx jsx */
import { React, jsx } from 'jimu-core'

export interface YearSelectProps {
  availableYears: number[]
  value: number | null
  placeholder: string
  onChange: (year: number | null) => void
  disabled?: boolean
}

export const YearSelect = React.memo((props: YearSelectProps) => {
  const { availableYears, value, placeholder, onChange, disabled } = props

  const handleChange = React.useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      const raw = evt.target.value
      if (!raw) {
        onChange(null)
        return
      }
      const year = Number(raw)
      onChange(Number.isFinite(year) ? year : null)
    },
    [onChange]
  )

  return (
    <select
      className="comparador-year-select w-100"
      value={value != null ? String(value) : ''}
      onChange={handleChange}
      disabled={disabled || availableYears.length === 0}
      aria-label={placeholder}
    >
      <option value="">{placeholder}</option>
      {availableYears.map((year) => (
        <option key={year} value={String(year)}>
          {year}
        </option>
      ))}
    </select>
  )
})

YearSelect.displayName = 'YearSelect'
