import { PureFormSaveBtn } from './pure-form-save-btn'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Etape/FormSaveBtn',
  // @ts-ignore
  component: PureFormSaveBtn,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const onSaveAction = action('onSave')
const onDeposeAction = action('onDepose')

const onSave = () => {
  return new Promise<void>(resolve =>
    setTimeout(() => {
      onSaveAction()
      resolve(undefined)
    }, 1000)
  )
}
const onDepose = () => {
  return new Promise<void>(resolve =>
    setTimeout(() => {
      onDeposeAction()
      resolve(undefined)
    }, 1000)
  )
}
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

export const SansMessage: StoryFn = () => <PureFormSaveBtn alertes={[]} canSave={true} showDepose={true} canDepose={true} save={onSave} depose={onDepose} />

export const WithError: StoryFn = () => <PureFormSaveBtn alertes={[]} canSave={true} showDepose={true} canDepose={true} save={onSave} depose={onDepose} initialContext={{status: 'ERROR', message: 'Une erreur sauvage apparait'}} />

export const EnregistrementEnCours: StoryFn = () => <PureFormSaveBtn alertes={[]} canSave={true} showDepose={true} canDepose={true} save={onSave} depose={onDepose} initialContext={{status: 'LOADING'}} />