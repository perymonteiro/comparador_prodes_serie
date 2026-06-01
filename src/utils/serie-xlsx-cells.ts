export function columnLetter (index: number): string {
  let n = index + 1
  let letters = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

export function buildAbsoluteRange (
  sheetName: string,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): string {
  const absStart = `$${columnLetter(startCol)}$${startRow + 1}`
  const absEnd = `$${columnLetter(endCol)}$${endRow + 1}`
  const absRange =
    absStart === absEnd ? absStart : `${absStart}:${absEnd}`
  return `${sheetName}!${absRange}`
}

function escapeXml (value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatOoxmlNumber (value: number): string {
  if (!Number.isFinite(value)) return '0'
  const rounded = Math.round(value * 100) / 100
  return String(rounded)
}

export function buildNumCacheXml (values: number[]): string {
  const points = values
    .map(
      (value, index) =>
        `<c:pt idx="${index}"><c:v>${formatOoxmlNumber(value)}</c:v></c:pt>`
    )
    .join('')
  return `<c:formatCode>General</c:formatCode><c:ptCount val="${values.length}"/>${points}`
}

export function buildStrCacheXml (value: string): string {
  return `<c:ptCount val="1"/><c:pt idx="0"><c:v>${escapeXml(
    value
  )}</c:v></c:pt>`
}

export function buildStrListCacheXml (values: string[]): string {
  const points = values
    .map(
      (value, index) =>
        `<c:pt idx="${index}"><c:v>${escapeXml(value)}</c:v></c:pt>`
    )
    .join('')
  return `<c:ptCount val="${values.length}"/>${points}`
}

export { escapeXml, formatOoxmlNumber }
