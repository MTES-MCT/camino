import { Preview } from './preview'
import { Meta, StoryFn } from '@storybook/vue3'
import { Activite, activiteIdValidator, activiteSlugValidator } from 'camino-common/src/activite'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { vueRouter } from 'storybook-vue3-router'
import { ActiviteApiClient } from './activite-api-client'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Activite/Preview',
  // @ts-ignore en attente de la mise à jour de @storybook/vue3
  component: Preview,
  decorators: [vueRouter([{ path: '/activites/:activiteId/edition' }])],
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
  sections_with_value: [],
  activite_documents: [],
  titre: {
    nom: 'Nom du titre',
    slug: 'slug-du-titre',
  },
}
const deposerActiviteAction = action('deposerActiviteAction')
const supprimerActiviteAction = action('supprimerActiviteAction')

const apiClient: Pick<ActiviteApiClient, 'deposerActivite' | 'supprimerActivite'> = {
  deposerActivite: (...params: unknown[]) => {
    deposerActiviteAction(params)

    return Promise.resolve()
  },
  supprimerActivite(activiteId) {
    supprimerActiviteAction(activiteId)

    return Promise.resolve()
  },
}

export const OuvertParDefaut: StoryFn = () => <Preview apiClient={apiClient} activite={activite} initialOpened={true} />
export const FermeParDefaut: StoryFn = () => <Preview apiClient={apiClient} activite={activite} initialOpened={false} />

export const ACompleter: StoryFn = () => (
  <Preview
    apiClient={apiClient}
    activite={{
      ...activite,
      deposable: false,
      modification: true,
      type_id: ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"],
      activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION,
    }}
    initialOpened={false}
  />
)

export const Deposable: StoryFn = () => (
  <Preview apiClient={apiClient} activite={{ ...activite, deposable: true, modification: true, activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION }} initialOpened={false} />
)

export const Supprimable: StoryFn = () => (
  <Preview apiClient={apiClient} activite={{ ...activite, suppression: true, deposable: false, modification: true, activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION }} initialOpened={false} />
)
