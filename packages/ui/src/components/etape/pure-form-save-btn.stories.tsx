import { PureFormSaveBtn } from './pure-form-save-btn'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { CaminoError } from 'camino-common/src/zod-tools'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'

const meta: Meta = {
  title: 'Components/Etape/FormSaveBtn',
  // @ts-ignore
  component: PureFormSaveBtn,
}
export default meta

const onSaveAction = action('onSave')
const onDeposeAction = action('onDepose')

const onSave = () => {
  return new Promise<{ id: EtapeId } | null | CaminoError<string>>(resolve =>
    setTimeout(() => {
      onSaveAction()
      resolve(null)
    }, 1000)
  )
}
const onDepose = () => {
  return new Promise<{ id: EtapeId } | CaminoError<string>>(resolve =>
    setTimeout(() => {
      onDeposeAction()
      resolve({
        id: etapeIdValidator.parse('etapeId'),
      })
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
    etapeTypeId={ETAPES_TYPES.demande}
  />
)

export const DemandeEnConstructionComplete: StoryFn = () => (
  <PureFormSaveBtn canSave={true} showDepose={true} canDepose={true} alertes={[{ message: 'alerte', url: 'google.com' }]} save={onSave} depose={onDepose} etapeTypeId={ETAPES_TYPES.demande} />
)

export const CompletudeDeLaDemandeImcomplete: StoryFn = () => (
  <PureFormSaveBtn
    canSave={false}
    showDepose={false}
    canDepose={true}
    alertes={[{ message: 'alerte', url: 'google.com' }]}
    save={onSave}
    depose={onDepose}
    etapeTypeId={ETAPES_TYPES.completudeDeLaDemande}
  />
)

export const CompletudeDeLaDemandeComplete: StoryFn = () => (
  <PureFormSaveBtn
    canSave={true}
    showDepose={false}
    canDepose={true}
    alertes={[{ message: 'alerte', url: 'google.com' }]}
    save={onSave}
    depose={onDepose}
    etapeTypeId={ETAPES_TYPES.completudeDeLaDemande}
  />
)

export const SansMessage: StoryFn = () => <PureFormSaveBtn alertes={[]} canSave={true} showDepose={true} canDepose={true} save={onSave} depose={onDepose} etapeTypeId={ETAPES_TYPES.demande} />

export const WithError: StoryFn = () => (
  <PureFormSaveBtn
    alertes={[]}
    canSave={true}
    showDepose={true}
    canDepose={true}
    save={onSave}
    depose={onDepose}
    etapeTypeId={ETAPES_TYPES.demande}
    initialContext={{ status: 'ERROR', message: 'Une erreur sauvage apparait' }}
  />
)

export const EnregistrementEnCours: StoryFn = () => (
  <PureFormSaveBtn alertes={[]} canSave={true} showDepose={true} canDepose={true} save={onSave} depose={onDepose} etapeTypeId={ETAPES_TYPES.demande} initialContext={{ status: 'LOADING' }} />
)

export const AvisComplet: StoryFn = () => (
  <PureFormSaveBtn alertes={[]} canSave={true} showDepose={true} canDepose={true} save={onSave} depose={onDepose} etapeTypeId={ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives} />
)
