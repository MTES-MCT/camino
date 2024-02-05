import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { DsfrToggle } from './dsfr-toggle'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Toggle',
  component: DsfrToggle,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta
const valueChangedAction = action('valueChanged')

export const DefaultTrue: StoryFn = () => <DsfrToggle id="toggle1" legendLabel="Légende" valueChanged={valueChangedAction} initialValue={true} />
export const DefaultFalse: StoryFn = () => <DsfrToggle id="toggle2" legendLabel="Légende" valueChanged={valueChangedAction} initialValue={false} />
export const WithHint: StoryFn = () => <DsfrToggle id="toggle3" legendLabel="Légende" legendHint="une URL" valueChanged={valueChangedAction} initialValue={true} />
