import { action } from '@storybook/addon-actions'
import { FiltersInput } from './filters-input'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Ui/Filters/FiltersInput',
  // @ts-ignore
  component: FiltersInput,
}
export default meta


export const Administrations: StoryFn = () => (
  <FiltersInput filter='nomsAdministration' initialValue='Plop' onFilterInput={action('onFilterInput')} />
)
