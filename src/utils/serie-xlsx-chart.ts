import { ROW_LABEL_AREA } from '../constants'
import type { SerieTableColumn } from './serie-table'
import {
  buildAbsoluteRange,
  buildNumCacheXml,
  buildStrCacheXml,
  escapeXml
} from './serie-xlsx-cells'

export const SHEET_NAME = 'PRODES'
export const DRAWING_REL_ID = 'rId1'
export const CHART_REL_ID = 'rId1'

const CATEGORY_AXIS_ID = 48650112
const VALUE_AXIS_ID = 48672768

const CHART_ANCHOR_FROM_ROW = 4
const CHART_ANCHOR_TO_ROW = 34

export interface SerieChartSpec {
  sheetName: string
  categoryFormula: string
  valueFormula: string
  seriesNameFormula: string
  years: number[]
  values: number[]
  seriesName: string
}

export function buildSerieChartSpec (
  columns: SerieTableColumn[],
  sheetName = SHEET_NAME
): SerieChartSpec | null {
  if (!columns.length) return null

  const firstDataCol = 1
  const lastDataCol = columns.length
  const yearRow = 0
  const valueRow = 1
  const seriesNameCol = 0

  return {
    sheetName,
    categoryFormula: buildAbsoluteRange(
      sheetName,
      firstDataCol,
      yearRow,
      lastDataCol,
      yearRow
    ),
    valueFormula: buildAbsoluteRange(
      sheetName,
      firstDataCol,
      valueRow,
      lastDataCol,
      valueRow
    ),
    seriesNameFormula: buildAbsoluteRange(
      sheetName,
      seriesNameCol,
      valueRow,
      seriesNameCol,
      valueRow
    ),
    years: columns.map((col) => col.year),
    values: columns.map((col) => col.value),
    seriesName: ROW_LABEL_AREA
  }
}

export function buildChartXml (spec: SerieChartSpec): string {
  const catCache = buildNumCacheXml(spec.years)
  const valCache = buildNumCacheXml(spec.values)
  const nameCache = buildStrCacheXml(spec.seriesName)

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<c:lang val="pt-BR"/>
<c:chart>
<c:plotArea>
<c:layout/>
<c:barChart>
<c:barDir val="col"/>
<c:grouping val="clustered"/>
<c:varyColors val="0"/>
<c:ser>
<c:idx val="0"/>
<c:order val="0"/>
<c:tx>
<c:strRef>
<c:f>${escapeXml(spec.seriesNameFormula)}</c:f>
<c:strCache>${nameCache}</c:strCache>
</c:strRef>
</c:tx>
<c:cat>
<c:numRef>
<c:f>${escapeXml(spec.categoryFormula)}</c:f>
<c:numCache>${catCache}</c:numCache>
</c:numRef>
</c:cat>
<c:val>
<c:numRef>
<c:f>${escapeXml(spec.valueFormula)}</c:f>
<c:numCache>${valCache}</c:numCache>
</c:numRef>
</c:val>
</c:ser>
<c:dLbls>
<c:showLegendKey val="0"/>
<c:showVal val="0"/>
<c:showCatName val="0"/>
<c:showSerName val="0"/>
<c:showPercent val="0"/>
<c:showBubbleSize val="0"/>
</c:dLbls>
<c:gapWidth val="150"/>
<c:axId val="${CATEGORY_AXIS_ID}"/>
<c:axId val="${VALUE_AXIS_ID}"/>
</c:barChart>
<c:catAx>
<c:axId val="${CATEGORY_AXIS_ID}"/>
<c:scaling>
<c:orientation val="minMax"/>
</c:scaling>
<c:delete val="0"/>
<c:axPos val="b"/>
<c:tickLblPos val="nextTo"/>
<c:crossAx val="${VALUE_AXIS_ID}"/>
<c:crosses val="autoZero"/>
<c:auto val="1"/>
<c:lblAlgn val="ctr"/>
<c:lblOffset val="100"/>
</c:catAx>
<c:valAx>
<c:axId val="${VALUE_AXIS_ID}"/>
<c:scaling>
<c:orientation val="minMax"/>
</c:scaling>
<c:delete val="0"/>
<c:axPos val="l"/>
<c:title>
<c:tx>
<c:rich>
<a:bodyPr rot="-5400000" vert="horz"/>
<a:lstStyle/>
<a:p>
<a:pPr>
<a:defRPr sz="900"/>
</a:pPr>
<a:r>
<a:rPr lang="pt-BR"/>
<a:t>${escapeXml(spec.seriesName)}</a:t>
</a:r>
</a:p>
</c:rich>
</c:tx>
<c:overlay val="0"/>
</c:title>
<c:numFmt formatCode="General" sourceLinked="1"/>
<c:majorTickMark val="out"/>
<c:minorTickMark val="none"/>
<c:tickLblPos val="nextTo"/>
<c:crossAx val="${CATEGORY_AXIS_ID}"/>
<c:crosses val="autoZero"/>
<c:crossBetween val="between"/>
</c:valAx>
</c:plotArea>
<c:plotVisOnly val="1"/>
<c:dispBlanksAs val="gap"/>
</c:chart>
</c:chartSpace>`
}

export function buildDrawingXml (columnCount = 5): string {
  const endCol = Math.max(12, columnCount + 5)

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<xdr:twoCellAnchor>
<xdr:from>
<xdr:col>0</xdr:col>
<xdr:colOff>0</xdr:colOff>
<xdr:row>${CHART_ANCHOR_FROM_ROW}</xdr:row>
<xdr:rowOff>0</xdr:rowOff>
</xdr:from>
<xdr:to>
<xdr:col>${endCol}</xdr:col>
<xdr:colOff>0</xdr:colOff>
<xdr:row>${CHART_ANCHOR_TO_ROW}</xdr:row>
<xdr:rowOff>0</xdr:rowOff>
</xdr:to>
<xdr:graphicFrame macro="">
<xdr:nvGraphicFramePr>
<xdr:cNvPr id="2" name="Gráfico PRODES"/>
<xdr:cNvGraphicFramePr/>
</xdr:nvGraphicFramePr>
<xdr:xfrm>
<a:off x="0" y="0"/>
<a:ext cx="0" cy="0"/>
</xdr:xfrm>
<a:graphic>
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
<c:chart r:id="${CHART_REL_ID}"/>
</a:graphicData>
</a:graphic>
</xdr:graphicFrame>
<xdr:clientData/>
</xdr:twoCellAnchor>
</xdr:wsDr>`
}

export function buildDrawingRelsXml (): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="${CHART_REL_ID}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>
</Relationships>`
}

export function buildSheetRelsXml (): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="${DRAWING_REL_ID}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`
}

export function buildContentTypesXml (includeChart: boolean): string {
  const chartOverrides = includeChart
    ? `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>
<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
${chartOverrides}
</Types>`
}
