import { DsfrInputRadio } from './dsfr-input-radio'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Radio',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DsfrInputRadio,
}
export default meta
const valueChangedAction = action('valueChanged')

export const Default: StoryFn = () => (
  <DsfrInputRadio
    id="input1"
    legend={{ main: 'Légende' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1' }, itemId: '1' },
      { legend: { main: 'checkbox2' }, itemId: '2' },
      { legend: { main: 'checkbox3' }, itemId: '3' },
    ]}
  />
)

export const WithDescription: StoryFn = () => (
  <DsfrInputRadio
    id="input2"
    legend={{ main: 'Légende', description: 'description' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1', description: 'avec description' }, itemId: '1' },
      { legend: { main: 'checkbox2' }, itemId: '2' },
      { legend: { main: 'checkbox3' }, itemId: '3' },
    ]}
  />
)
export const WithValue: StoryFn = () => (
  <DsfrInputRadio
    id="input4"
    legend={{ main: 'Légende' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1', description: 'avec description' }, itemId: '1' },
      { legend: { main: 'checkbox2' }, itemId: '2' },
      { legend: { main: 'checkbox3' }, itemId: '3' },
    ]}
    initialValue="1"
  />
)
export const Disabled: StoryFn = () => (
  <DsfrInputRadio
    id="input5"
    disabled={true}
    legend={{ main: 'Légende' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1', description: 'avec description' }, itemId: '1' },
      { legend: { main: 'checkbox2' }, itemId: '2' },
      { legend: { main: 'checkbox3' }, itemId: '3' },
    ]}
  />
)
export const Required: StoryFn = () => (
  <DsfrInputRadio
    id="input6"
    required={true}
    legend={{ main: 'Légende' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1', description: 'avec description' }, itemId: '1' },
      { legend: { main: 'checkbox2' }, itemId: '2' },
      { legend: { main: 'checkbox3' }, itemId: '3' },
    ]}
  />
)

export const Small: StoryFn = () => (
  <DsfrInputRadio
    id="input6"
    size="sm"
    required={true}
    legend={{ main: '' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1' }, itemId: '1' },
      { legend: { main: 'checkbox2' }, itemId: '2' },
      { legend: { main: 'checkbox3' }, itemId: '3' },
    ]}
  />
)
export const Horizontal: StoryFn = () => (
  <DsfrInputRadio
    id="input6"
    required={true}
    orientation="horizontal"
    legend={{ main: 'Légende' }}
    valueChanged={valueChangedAction}
    elements={[
      { legend: { main: 'checkbox1' }, itemId: '1' },
      { legend: { main: 'checkbox2' }, itemId: '2' },
      { legend: { main: 'checkbox3' }, itemId: '3' },
    ]}
  />
)
