import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { SubstanceLegaleTypeahead } from './substance-legale-typeahead'

const meta: Meta = {
  title: 'Components/Common/SubstanceLegaleTypeahead',
  // @ts-ignore
  component: SubstanceLegaleTypeahead,
}
export default meta

const substanceLegaleSelected = action('substanceLegaleSelected')

export const Default: StoryFn = () => <SubstanceLegaleTypeahead substanceLegaleIds={['auru', 'aloh']} substanceLegaleSelected={substanceLegaleSelected} alwaysOpen={true} />
export const WithSubstanceTypeAlreadySelected: StoryFn = () => <SubstanceLegaleTypeahead substanceLegaleIds={['auru', 'aloh']} initialValue="auru" substanceLegaleSelected={substanceLegaleSelected} />
