import { DsfrTextarea } from './dsfr-textarea'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Textarea',
  component: DsfrTextarea,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta
const valueChangedAction = action('valueChanged')

export const Default: StoryFn = () => <DsfrTextarea id="textarea1" legend={{ main: 'Légende' }} valueChanged={valueChangedAction} />
export const WithDescriptionAndPlaceholder: StoryFn = () => <DsfrTextarea id="textarea3" legend={{ main: 'Légende', description: 'une URL' }} valueChanged={valueChangedAction} />
export const WithValue: StoryFn = () => <DsfrTextarea id="textarea4" legend={{ main: 'Légende' }} initialValue={'valeur initiale'} valueChanged={valueChangedAction} />
export const Required: StoryFn = () => <DsfrTextarea id="textarea6" required={true} legend={{ main: 'Légende' }} initialValue={'valeur initiale'} valueChanged={valueChangedAction} />
