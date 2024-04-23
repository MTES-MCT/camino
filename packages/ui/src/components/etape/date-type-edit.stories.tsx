import { Meta, StoryFn } from '@storybook/vue3'
import { DateTypeEdit, Props } from './date-type-edit'
import { action } from '@storybook/addon-actions'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { EtapeId } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Etape/DateTypeEdit',
  component: DateTypeEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const completeUpdate = action('completeUpdate')
const getEtapesTypesEtapesStatutsAction = action('getEtapesTypesEtapesStatuts')
const apiClient: Props['apiClient'] = {
  getEtapesTypesEtapesStatuts(demarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) {
    getEtapesTypesEtapesStatutsAction(demarcheId, titreEtapeId, date)

    return Promise.resolve([
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', mainStep: true },
      { etapeTypeId: 'mfr', etapeStatutId: 'aco', mainStep: true },
      { etapeTypeId: 'mdp', etapeStatutId: 'fai', mainStep: true },
    ])
  },
}

const demarcheId = demarcheIdValidator.parse('demarche-id')
export const Default: StoryFn = () => (
  <DateTypeEdit apiClient={apiClient} demarcheId={demarcheId} etape={{ date: toCaminoDate('2023-01-01'), id: null, statutId: null, typeId: null }} completeUpdate={completeUpdate} />
)
export const WithTypeId: StoryFn = () => (
  <DateTypeEdit apiClient={apiClient} demarcheId={demarcheId} etape={{ date: toCaminoDate('2023-01-01'), id: null, statutId: null, typeId: 'mfr' }} completeUpdate={completeUpdate} />
)

export const WithTypeIdAndStatutId: StoryFn = () => (
  <DateTypeEdit apiClient={apiClient} demarcheId={demarcheId} etape={{ date: toCaminoDate('2023-01-01'), id: null, statutId: 'fai', typeId: 'mfr' }} completeUpdate={completeUpdate} />
)

export const EnConstruction: StoryFn = () => (
  <DateTypeEdit apiClient={apiClient} demarcheId={demarcheId} etape={{ date: toCaminoDate('2023-01-01'), id: null, statutId: 'aco', typeId: 'mfr' }} completeUpdate={completeUpdate} />
)

export const Loading: StoryFn = () => (
  <DateTypeEdit
    apiClient={{ ...apiClient, getEtapesTypesEtapesStatuts: () => new Promise(() => ({})) }}
    demarcheId={demarcheId}
    etape={{ date: toCaminoDate('2023-01-01'), id: null, statutId: 'fai', typeId: 'mfr' }}
    completeUpdate={completeUpdate}
  />
)

export const WithError: StoryFn = () => (
  <DateTypeEdit
    apiClient={{ ...apiClient, getEtapesTypesEtapesStatuts: () => Promise.reject(new Error('Une erreur est survenue')) }}
    demarcheId={demarcheId}
    etape={{ date: toCaminoDate('2023-01-01'), id: null, statutId: 'fai', typeId: 'mfr' }}
    completeUpdate={completeUpdate}
  />
)
