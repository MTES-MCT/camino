import { DsfrInputCheckbox } from './dsfr-input-checkbox'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/InputCheckbox',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DsfrInputCheckbox,
}
export default meta

const valueChangedAction = action('valueChanged')

export const Checked: StoryFn = () => <DsfrInputCheckbox initialValue={true} legend={{ main: 'Label', description: 'Description' }} valueChanged={valueChangedAction} />
export const NotChecked: StoryFn = () => <DsfrInputCheckbox initialValue={false} legend={{ main: 'Label' }} valueChanged={valueChangedAction} />
export const Disabled: StoryFn = () => <DsfrInputCheckbox legend={{ main: 'C’est désactivé' }} disabled={true} valueChanged={valueChangedAction} />
