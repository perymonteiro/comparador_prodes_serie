/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { Select, Option } from 'jimu-ui'

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
    (_evt: unknown, selected: unknown) => {
      if (selected == null || selected === '') {
        onChange(null)
        return
      }
      const year = Number(selected)
      onChange(Number.isFinite(year) ? year : null)
    },
    [onChange]
  )

  return (
    <Select
      size="sm"
      className="w-100"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={handleChange}
      disabled={disabled || availableYears.length === 0}
    >
      <Option value="">{''}</Option>
      {availableYears.map((year) => (
        <Option key={year} value={year} active={value === year}>
          {year}
        </Option>
      ))}
    </Select>
  )
})

YearSelect.displayName = 'YearSelect'
