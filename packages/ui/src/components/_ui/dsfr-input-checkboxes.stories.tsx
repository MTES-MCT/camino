import { DsfrInputCheckboxes } from './dsfr-input-checkboxes'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/InputCheckboxes',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DsfrInputCheckboxes,
}
export default meta

const valueChangedAction = action('valueChanged')

export const Checked: StoryFn = () => (
  <DsfrInputCheckboxes
    legend={{ main: 'Label', description: 'Description' }}
    valueChanged={valueChangedAction}
    elements={
      [
        { legend: { main: 'checkbox1', description: 'avec description' }, itemId: '1' },
        { legend: { main: 'checkbox2' }, itemId: '2' },
        { legend: { main: 'checkbox3' }, itemId: '3' },
      ] as const
    }
    initialCheckedValue={['1', '2', '3']}
  />
)
export const NotChecked: StoryFn = () => (
  <DsfrInputCheckboxes
    legend={{ main: 'Label' }}
    valueChanged={valueChangedAction}
    elements={
      [
        { legend: { main: 'checkbox1' }, itemId: '1' },
        { legend: { main: 'checkbox2' }, itemId: '2' },
        { legend: { main: 'checkbox3' }, itemId: '3' },
      ] as const
    }
    initialCheckedValue={[]}
  />
)
export const Small: StoryFn = () => (
  <DsfrInputCheckboxes
    legend={{ main: 'Label' }}
    valueChanged={valueChangedAction}
    size="sm"
    elements={
      [
        { legend: { main: 'checkbox1' }, itemId: '1' },
        { legend: { main: 'checkbox2' }, itemId: '2' },
        { legend: { main: 'checkbox3' }, itemId: '3' },
      ] as const
    }
    initialCheckedValue={[]}
  />
)
export const Disabled: StoryFn = () => (
  <DsfrInputCheckboxes
    legend={{ main: 'C’est désactivé' }}
    disabled={true}
    valueChanged={valueChangedAction}
    elements={
      [
        { legend: { main: 'checkbox1' }, itemId: '1' },
        { legend: { main: 'checkbox2' }, itemId: '2' },
        { legend: { main: 'checkbox3' }, itemId: '3' },
      ] as const
    }
    initialCheckedValue={['1', '3']}
  />
)
