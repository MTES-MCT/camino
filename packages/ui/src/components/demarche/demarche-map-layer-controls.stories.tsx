import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { LayersControl } from './demarche-map-layer-controls'

const meta: Meta = {
  title: 'Components/Demarche/DemarcheMapLayerControls',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: LayersControl,
}
export default meta

const onMouseLeaveAction = action('onMouseLeaveAction')
const setLayerAction = action('setLayerAction')
const selectedOverlayLayerNamesAction = action('selectedOverlayLayerNamesAction')

export const Default: StoryFn = () => (
  <LayersControl
    id="test"
    style=""
    onMouseleave={onMouseLeaveAction}
    setLayer={setLayerAction}
    selectedOverlayLayerNames={selectedOverlayLayerNamesAction}
    defaultOverlayLayer={['Contours']}
    overlays={['Contours', 'Façades maritimes', 'Forages']}
  />
)
