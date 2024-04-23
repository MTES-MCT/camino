import { DsfrInput } from './dsfr-input'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { caminoDateValidator } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Input',
  component: DsfrInput,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta
const valueChangedAction = action('valueChanged')

export const Default: StoryFn = () => <DsfrInput type={{ type: 'text' }} id="input1" legend={{ main: 'Légende' }} valueChanged={valueChangedAction} />
export const WithDescription: StoryFn = () => <DsfrInput type={{ type: 'text' }} id="input2" legend={{ main: 'Légende', description: 'description' }} valueChanged={valueChangedAction} />
export const WithDescriptionAndPlaceholder: StoryFn = () => (
  <DsfrInput type={{ type: 'text' }} id="input3" legend={{ main: 'Légende', description: 'une URL', placeholder: 'https://' }} valueChanged={valueChangedAction} />
)
export const WithValue: StoryFn = () => <DsfrInput type={{ type: 'text' }} id="input4" legend={{ main: 'Légende' }} initialValue={'valeur initiale'} valueChanged={valueChangedAction} />
export const Disabled: StoryFn = () => <DsfrInput type={{ type: 'text' }} id="input5" disabled={true} legend={{ main: 'Légende' }} initialValue={'valeur initiale'} valueChanged={valueChangedAction} />
export const Required: StoryFn = () => <DsfrInput type={{ type: 'text' }} id="input6" required={true} legend={{ main: 'Légende' }} initialValue={'valeur initiale'} valueChanged={valueChangedAction} />
export const Number: StoryFn = () => <DsfrInput id="input1" type={{ type: 'number', min: 1, max: 10 }} legend={{ main: 'Légende' }} valueChanged={valueChangedAction} />
export const Date: StoryFn = () => (
  <DsfrInput id="input1" type={{ type: 'date' }} legend={{ main: 'Légende' }} valueChanged={valueChangedAction} initialValue={caminoDateValidator.parse('2023-02-26')} />
)
