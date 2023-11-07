import { Meta, StoryFn } from '@storybook/vue3'
import { CaminoMap } from './index'
const meta: Meta = {
  title: 'Components/MapNoStoryshots',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: CaminoMap,
}
export default meta

export const DefaultNoSnapshot: StoryFn = () => <CaminoMap class="map map-detail mb-s" geojsonLayers={[]} markerLayers={[]} loading={false} mapUpdate={() => {}} />
