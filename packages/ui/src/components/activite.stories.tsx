import { PureActivite } from './activite'
import { Meta, StoryFn } from '@storybook/vue3'
import { Activite, ActiviteId, ActiviteIdOrSlug, activiteDocumentIdValidator, activiteIdValidator, activiteSlugValidator } from 'camino-common/src/activite'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { vueRouter } from 'storybook-vue3-router'
import { ActiviteApiClient } from './activite/activite-api-client'
import { action } from '@storybook/addon-actions'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Activite',
  // @ts-ignore en attente de la mise à jour de @storybook/vue3
  component: PureActivite,
  decorators: [vueRouter([{ name: 'titre', path: '/titre/:id' }, { name: 'activite', path: '/activites/:id/edition' }, { path: '/' }])],
}
export default meta

const activite: Activite = {
  suppression: false,
  modification: false,
  date: toCaminoDate('2022-01-01'),
  date_saisie: toCaminoDate('2022-01-01'),
  id: activiteIdValidator.parse('id'),
  slug: activiteSlugValidator.parse('slug'),
  type_id: 'gra',
  activite_statut_id: ACTIVITES_STATUTS_IDS.CLOTURE,
  deposable: false,
  annee: toCaminoAnnee(2022),
  periode_id: 1,
  sections_with_value: [{ id: 'Id', nom: 'Nom de section', elements: [{ type: 'radio', id: 'radio', value: true, nom: 'Un radio button' }] }],
  activite_documents: [{ activite_document_type_id: 'ree', description: 'description', id: activiteDocumentIdValidator.parse('id1') }],
  titre: {
    nom: 'Nom du titre',
    slug: 'slug-du-titre',
  },
}
const deposerActiviteAction = action('deposerActiviteAction')
const supprimerActiviteAction = action('supprimerActiviteAction')
const getActiviteAction = action('getActiviteAction')

const apiClient: Pick<ActiviteApiClient, 'deposerActivite' | 'supprimerActivite' | 'getActivite'> = {
  deposerActivite: (...params: unknown[]) => {
    deposerActiviteAction(params)
    return Promise.resolve()
  },
  supprimerActivite(activiteId: ActiviteId) {
    supprimerActiviteAction(activiteId)
    return Promise.resolve()
  },
  getActivite(activiteId: ActiviteIdOrSlug) {
    getActiviteAction(activiteId)
    return Promise.resolve(activite)
  },
}

export const Loading: StoryFn = () => <PureActivite apiClient={{ ...apiClient, getActivite: () => new Promise(() => ({})) }} activiteId={activite.id} user={{ ...testBlankUser, role: 'super' }} />

export const WithError: StoryFn = () => (
  <PureActivite apiClient={{ ...apiClient, getActivite: () => Promise.reject(new Error('Une erreur est survenue')) }} activiteId={activite.id} user={{ ...testBlankUser, role: 'super' }} />
)

export const NotLogged: StoryFn = () => <PureActivite apiClient={apiClient} activiteId={activite.id} user={null} />

export const Unauthorized: StoryFn = () => <PureActivite apiClient={apiClient} activiteId={activite.id} user={{ ...testBlankUser, role: 'defaut' }} />

export const ACompleter: StoryFn = () => (
  <PureActivite
    apiClient={{
      ...apiClient,
      getActivite(activiteId) {
        getActiviteAction(activiteId)
        return Promise.resolve({
          ...activite,
          deposable: false,
          modification: true,
          type_id: ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"],
          activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION,
        })
      },
    }}
    activiteId={activite.id}
    user={{ ...testBlankUser, role: 'super' }}
  />
)

export const Deposable: StoryFn = () => (
  <PureActivite
    apiClient={{
      ...apiClient,
      getActivite(activiteId) {
        getActiviteAction(activiteId)
        return Promise.resolve({ ...activite, deposable: true, modification: true, activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION })
      },
    }}
    activiteId={activite.id}
    user={{ ...testBlankUser, role: 'super' }}
  />
)

export const Supprimable: StoryFn = () => (
  <PureActivite
    apiClient={{
      ...apiClient,
      getActivite(activiteId) {
        getActiviteAction(activiteId)
        return Promise.resolve({ ...activite, suppression: true, deposable: false, modification: true, activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION })
      },
    }}
    activiteId={activite.id}
    user={{ ...testBlankUser, role: 'super' }}
  />
)
