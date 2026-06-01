import { React } from 'jimu-core'
import _Widget from '../src/runtime/widget'
import { widgetRender, wrapWidget } from 'jimu-for-test'
import { MSG_NOT_CONFIGURED } from '../src/constants'

const render = widgetRender()
describe('test comparador_prodes_serie widget', () => {
  it('shows not configured message when missing data source and recorte', () => {
    const Widget = wrapWidget(_Widget, {
      config: {}
    })
    const { queryByText } = render(<Widget widgetId="Widget_1" />)
    expect(queryByText(MSG_NOT_CONFIGURED).tagName).toBe('P')
  })
})
