import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrSelect } from './dsfr-select'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Select',
  // @ts-ignore il n'aime pas le côté générique du composant
  component: DsfrSelect,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const onvalueChangedAction = action('valueChanged')
const items = [
  { id: 'id1', label: 'premier label' },
  { id: 'id2', label: 'second label' },
] as const

export const Default: StoryFn = () => <DsfrSelect id="select" legend={{ main: 'label de cadix' }} items={items} initialValue={null} valueChanged={onvalueChangedAction} />
export const WithDescriptionAndPlaceholder: StoryFn = () => (
  <DsfrSelect id="select" legend={{ main: 'label de cadix', description: 'Description', placeholder: 'Placeholder custom' }} items={items} initialValue={null} valueChanged={onvalueChangedAction} />
)
export const AlreadySelectedItem: StoryFn = () => <DsfrSelect id="select" legend={{ main: 'label de cadix' }} items={items} initialValue={'id1'} valueChanged={onvalueChangedAction} />

export const Disabled: StoryFn = () => <DsfrSelect id="select" disabled={true} legend={{ main: 'label de cadix' }} items={items} initialValue={'id1'} valueChanged={onvalueChangedAction} />
export const Required: StoryFn = () => <DsfrSelect id="select" required={true} legend={{ main: 'label de cadix' }} items={items} initialValue={'id1'} valueChanged={onvalueChangedAction} />


export const ElementDisabled: StoryFn = () => <DsfrSelect id="select" required={true} legend={{ main: 'label de cadix' }} items={[
  { id: 'id1', label: 'premier label' },
  { id: 'id2', label: 'second label' },
  { id: 'id3', label: 'troisième label désactivé', disabled: true },
]} initialValue={'id1'} valueChanged={onvalueChangedAction} />
