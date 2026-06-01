/** Normaliza recorteField salvo na config (string ou objeto do Select do EXB). */
export function normalizeRecorteFieldConfig (value: unknown): string | undefined {
  if (value == null) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || trimmed === '[object Object]') return undefined
    return trimmed
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const candidates = [
      obj.jimuName,
      obj.name,
      obj.value,
      obj.fieldName,
      obj.key,
      (obj.target as Record<string, unknown> | undefined)?.value
    ]
    for (const candidate of candidates) {
      const normalized = normalizeRecorteFieldConfig(candidate)
      if (normalized) return normalized
    }
  }

  return undefined
}

/** Valor bruto recebido do onChange do Select (varia entre versões do EXB). */
export function extractRecorteSelectValue (
  evt: unknown,
  value: unknown
): unknown {
  if (value != null && value !== '') return value
  const target = (evt as { target?: { value?: unknown } } | null)?.target
  if (target?.value != null && target.value !== '') return target.value
  return value
}
