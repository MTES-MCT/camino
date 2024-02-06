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
  component: TypeEdit,
}
export default meta

const onEtapeChange = action('onEtapeChange')
const apiClientMock: Pick<EtapeApiClient, 'getEtapesTypesEtapesStatuts'> = {
  getEtapesTypesEtapesStatuts: () => {
    return Promise.resolve([
      { etapeStatutId: ETAPES_STATUTS.FAIT, etapeTypeId: ETAPES_TYPES.demande, mainStep: false },
      { etapeStatutId: 'aco', etapeTypeId: ETAPES_TYPES.demande, mainStep: false },
      { etapeStatutId: ETAPES_STATUTS.FAIT, etapeTypeId: 'css', mainStep: false },
      { etapeStatutId: ETAPES_STATUTS.FAIT, etapeTypeId: 'mdp', mainStep: true },
      { etapeStatutId: ETAPES_STATUTS.FAIT, etapeTypeId: 'apd', mainStep: true },
    ])
  },
}
// TODO 2023-01-09: changer la notion de etapeIsDemandeEnConstruction qui devrait être géree par le composant type-edit directement
export const Simple: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    apiClient={apiClientMock}
    etape={{
      statutId: ETAPES_STATUTS.FAIT,
      typeId: ETAPES_TYPES.demande,
    }}
  />
)

export const DemandeAvecUnSeulStatut: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={apiClientMock}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: ETAPES_TYPES.classementSansSuite,
    }}
  />
)

export const DemandeSansStatut: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={apiClientMock}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: ETAPES_TYPES.demande,
    }}
  />
)

export const DemandeEnConstruction: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={apiClientMock}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: ETAPES_STATUTS.EN_CONSTRUCTION,
      typeId: ETAPES_TYPES.demande,
    }}
  />
)

export const NouvelleDemande: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={apiClientMock}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
    }}
  />
)

export const Empty: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={{
      getEtapesTypesEtapesStatuts: () => {
        return Promise.resolve([])
      },
    }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
    }}
  />
)

export const NoEtape: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={{
      getEtapesTypesEtapesStatuts: () => {
        return Promise.resolve([])
      },
    }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: 'mfr',
    }}
  />
)

export const SelectedEtapeNotPossible: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={{
      getEtapesTypesEtapesStatuts: () => {
        return Promise.resolve([{ etapeTypeId: 'mcd', etapeStatutId: 'fai', mainStep: false }])
      },
    }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: 'mfr',
    }}
  />
)

export const Loading: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={{ getEtapesTypesEtapesStatuts: () => new Promise(() => ({})) }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
    }}
  />
)

export const WithError: StoryFn = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeDate={toCaminoDate('2022-01-01')}
    apiClient={{ getEtapesTypesEtapesStatuts: () => Promise.reject(new Error('Cassé')) }}
    demarcheId={demarcheIdValidator.parse('demarcheID')}
    etape={{
      statutId: null,
      typeId: null,
    }}
  />
)
