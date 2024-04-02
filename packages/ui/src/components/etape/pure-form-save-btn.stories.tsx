import { PureFormSaveBtn } from './pure-form-save-btn'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Etape/FormSaveBtn',
  component: PureFormSaveBtn,
  argTypes: {},
}
export default meta

const onSave = action('onSave')
const onDepose = action('onDepose')

export const DemandeEnConstructionIncomplete: StoryFn = () => (
  <PureFormSaveBtn
    canSave={true}
    showDepose={true}
    canDepose={false}
    alertes={[
      { message: 'Superposition', url: '' },
      { message: 'alerte', url: 'google.com' },
    ]}
    save={onSave}
    depose={onDepose}
  />
)

export const DemandeEnConstructionComplete: StoryFn = () => (
  <PureFormSaveBtn canSave={true} showDepose={true} canDepose={true} alertes={[{ message: 'alerte', url: 'google.com' }]} save={onSave} depose={onDepose} />
)

export const CompletudeDeLaDemandeImcomplete: StoryFn = () => (
  <PureFormSaveBtn canSave={false} showDepose={false} canDepose={true} alertes={[{ message: 'alerte', url: 'google.com' }]} save={onSave} depose={onDepose} />
)

export const CompletudeDeLaDemandeComplete: StoryFn = () => (
  <PureFormSaveBtn canSave={true} showDepose={false} canDepose={true} alertes={[{ message: 'alerte', url: 'google.com' }]} save={onSave} depose={onDepose} />
)

export const SansMessage: StoryFn = () => <PureFormSaveBtn canSave={true} showDepose={true} canDepose={true} save={onSave} depose={onDepose} />
