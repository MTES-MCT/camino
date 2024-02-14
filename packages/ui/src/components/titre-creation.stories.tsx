import { Meta, StoryFn } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { PureTitreCreation } from './titre-creation'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { ApiClient } from '@/api/api-client'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { action } from '@storybook/addon-actions'
import { etapeIdValidator } from 'camino-common/src/etape'
import { LinkableTitre } from './titre/titres-link-form-api-client'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/TitreCreation',
  // @ts-ignore
  component: PureTitreCreation,
  decorators: [vueRouter([{ name: 'meta' }])],
}
export default meta

const getEntreprisesAction = action('getEntreprises')
const createTitreAction = action('createTitre')
const loadLinkableTitresAction = action('loadLinkableTitres')

const entreprise1Id = entrepriseIdValidator.parse('id1')
const titreId2 = titreIdValidator.parse('id2')

const linkableTitres: LinkableTitre[] = [
  {
    id: titreIdValidator.parse('id1'),
    nom: 'Abttis Coucou',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2016-10-28'),
        demarcheDateFin: toCaminoDate('2017-03-17'),
      },
    ],
  },
  {
    id: titreId2,
    nom: 'Affluent Crique Saint Bernard',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2008-11-30'),
        demarcheDateFin: toCaminoDate('2019-02-27'),
      },
    ],
  },
  {
    id: titreIdValidator.parse('id3'),
    nom: 'Nouveau titre',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2008-11-30'),
        demarcheDateFin: toCaminoDate('2019-02-27'),
      },
    ],
  },
]

const apiClient: Pick<ApiClient, 'getEntreprises' | 'createTitre' | 'loadLinkableTitres'> = {
  getEntreprises: () => {
    getEntreprisesAction()

    return Promise.resolve([
      { id: entreprise1Id, nom: 'entreprise 1', legal_siren: null },
      { id: entrepriseIdValidator.parse('id2'), nom: 'entreprise 2', legal_siren: null },
    ])
  },
  createTitre: value => {
    createTitreAction(value)

    return new Promise(resolve => {
      setTimeout(() => resolve(etapeIdValidator.parse('etapeId')), 1000)
    })
  },
  loadLinkableTitres:
    (...params) =>
    () => {
      loadLinkableTitresAction(params)

      return Promise.resolve(linkableTitres)
    },
}

export const Default: StoryFn = () => <PureTitreCreation user={{ ...testBlankUser, role: 'super' }} apiClient={apiClient} />
export const OnlyOneEntreprise: StoryFn = () => (
  <PureTitreCreation
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={{
      ...apiClient,
      getEntreprises: () => {
        return Promise.resolve([{ id: entrepriseIdValidator.parse('id1'), nom: 'entreprise 1', legal_siren: null }])
      },
    }}
  />
)

export const OnlyOneEntrepriseUserEntreprise: StoryFn = () => (
  <PureTitreCreation
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entreprise1Id }] }}
    apiClient={{
      ...apiClient,
      getEntreprises: () => {
        return Promise.resolve([{ id: entreprise1Id, nom: 'entreprise 1', legal_siren: null }])
      },
    }}
  />
)

export const NoEntreprise: StoryFn = () => (
  <PureTitreCreation
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [] }}
    apiClient={{
      ...apiClient,
      getEntreprises: () => {
        return Promise.resolve([{ id: entreprise1Id, nom: 'entreprise 1', legal_siren: null }])
      },
    }}
  />
)

export const Full: StoryFn = () => (
  <PureTitreCreation
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClient}
    initialValue={{
      entrepriseId: entreprise1Id,
      nom: 'Titre full',
      references: [{ nom: 'REF', referenceTypeId: 'brg' }],
      typeId: 'axm',
      titreFromIds: [titreId2],
    }}
  />
)
