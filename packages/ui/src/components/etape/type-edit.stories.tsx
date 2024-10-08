import { TypeEdit } from './type-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { action } from '@storybook/addon-actions'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { toCaminoDate } from 'camino-common/src/date'
import { EtapeApiClient } from './etape-api-client'

const meta: Meta = {
  title: 'Components/Etape/TypeEdit',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: TypeEdit,
}
export default meta

const onEtapeChange = action('onEtapeChange')
const apiClientMock: Pick<EtapeApiClient, 'getEtapesTypesEtapesStatuts'> = {
  getEtapesTypesEtapesStatuts: () => {
    return Promise.resolve({
      [ETAPES_TYPES.demande]: { etapeStatutIds: [ETAPES_STATUTS.FAIT], mainStep: false },
      css: { etapeStatutIds: [ETAPES_STATUTS.FAIT], mainStep: false },
      mdp: { etapeStatutIds: [ETAPES_STATUTS.FAIT], mainStep: true },
      apd: { etapeStatutIds: [ETAPES_STATUTS.FAIT], mainStep: true },
    })
  },
}
export const DemandeAvecUnSeulStatut: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={apiClientMock}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: ETAPES_TYPES.classementSansSuite,
      date: toCaminoDate('2022-01-01'),
    }}
  />
)

export const DemandeSansStatut: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={apiClientMock}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: ETAPES_TYPES.demande,
      date: toCaminoDate('2022-01-01'),
    }}
  />
)

export const NouvelleDemande: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={apiClientMock}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
      date: toCaminoDate('2022-01-01'),
    }}
  />
)

export const Empty: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={{
      getEtapesTypesEtapesStatuts: () => {
        return Promise.resolve({})
      },
    }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
      date: toCaminoDate('2022-01-01'),
    }}
  />
)

export const NoEtape: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={{
      getEtapesTypesEtapesStatuts: () => {
        return Promise.resolve({})
      },
    }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: 'mfr',
      date: toCaminoDate('2022-01-01'),
    }}
  />
)

export const SelectedEtapeNotPossible: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={{
      getEtapesTypesEtapesStatuts: () => {
        return Promise.resolve({ mcd: { etapeStatutIds: ['fai'], mainStep: false } })
      },
    }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: 'mfr',
      date: toCaminoDate('2022-01-01'),
    }}
  />
)

export const Loading: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={{ getEtapesTypesEtapesStatuts: () => new Promise(() => ({})) }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
      date: toCaminoDate('2022-01-01'),
    }}
  />
)

export const WithError: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    apiClient={{ getEtapesTypesEtapesStatuts: () => Promise.reject(new Error('Cassé')) }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
      date: toCaminoDate('2022-01-01'),
    }}
  />
)
