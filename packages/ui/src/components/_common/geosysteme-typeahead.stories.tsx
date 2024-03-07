import { Meta, StoryFn } from '@storybook/vue3'
import { GeoSystemeTypeahead } from './geosysteme-typeahead'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Common/GeoSystemeTypeahead',
  // @ts-ignore
  component: GeoSystemeTypeahead,
}
export default meta

const geoSystemeSelected = action('geoSystemeSelected')

export const Default: StoryFn = () => <GeoSystemeTypeahead geoSystemeSelected={geoSystemeSelected} disabled={false} alwaysOpen={true} />
export const WithGeoSystemeAlreadySelected: StoryFn = () => <GeoSystemeTypeahead geoSystemeId="2154" disabled={true} />
