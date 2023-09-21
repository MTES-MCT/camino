import { DsfrInputCheckboxes } from './dsfr-input-checkboxes'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/InputCheckboxes',
  component: DsfrInputCheckboxes,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const valueChangedAction = action('valueChanged')

export const Checked: StoryFn = () => (
  <DsfrInputCheckboxes
    legend={{ main: 'Label', description: 'Description' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1', description: 'avec description' }, initialValue: true, itemId: '1' },
      { legend: { main: 'checkbox2' }, initialValue: true, itemId: '2' },
      { legend: { main: 'checkbox3' }, initialValue: true, itemId: '3' },
    ]}
  />
)
export const NotChecked: StoryFn = () => (
  <DsfrInputCheckboxes
    legend={{ main: 'Label' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1' }, initialValue: false, itemId: '1' },
      { legend: { main: 'checkbox2' }, initialValue: false, itemId: '2' },
      { legend: { main: 'checkbox3' }, initialValue: false, itemId: '3' },
    ]}
  />
)
export const Disabled: StoryFn = () => (
  <DsfrInputCheckboxes
    legend={{ main: 'C’est désactivé' }}
    disabled={true}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1' }, initialValue: true, itemId: '1' },
      { legend: { main: 'checkbox2' }, initialValue: false, itemId: '2' },
      { legend: { main: 'checkbox3' }, initialValue: true, itemId: '3' },
    ]}
  />
)
