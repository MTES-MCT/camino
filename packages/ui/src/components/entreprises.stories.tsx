import { PureEntreprises } from './entreprises'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { testBlankUser } from 'camino-common/src/tests-utils'

import { vueRouter } from 'storybook-vue3-router'
import { RouteLocationRaw } from 'vue-router'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { ApiClient } from '../api/api-client'

const meta: Meta = {
  title: 'Components/Entreprises',
  // @ts-ignore
  component: PureEntreprises,
  decorators: [vueRouter([{ name: 'entreprises' }, { name: 'entreprise' }])],
}
export default meta

const creerEntrepriseAction = action('creerEntreprise')
const pushRouteAction = action('pushRoute')

const updateUrlQuery = { push: (values: RouteLocationRaw) => Promise.resolve(pushRouteAction(values)) }

const entreprises = [
  { id: entrepriseIdValidator.parse('fr-899600233'), nom: '10 A', legal_siren: '899600233' },
  { id: entrepriseIdValidator.parse('fr-529770646'), nom: '2GRE', legal_siren: '529770646' },
  { id: entrepriseIdValidator.parse('fr-895187920'), nom: '45-8 AVANT-MONTS', legal_siren: '895187920' },
  { id: entrepriseIdValidator.parse('fr-831762786'), nom: '45-8 FONTS-BOUILLANTS', legal_siren: '831762786' },
  { id: entrepriseIdValidator.parse('fr-539449124'), nom: '6EME SENS IMMOBILIER ENTREPRISES', legal_siren: '539449124' },
  { id: entrepriseIdValidator.parse('xx-100000146'), nom: '8 communes de la vallée de Vicdessos', legal_siren: null },
  { id: entrepriseIdValidator.parse('xx-97300a001'), nom: 'Aboeka Alphonse', legal_siren: null },
  { id: entrepriseIdValidator.parse('fr-523359024'), nom: 'ABOEKA METAL', legal_siren: '523359024' },
  { id: entrepriseIdValidator.parse('xx-97300a002'), nom: 'Aboeka Thomas', legal_siren: null },
  { id: entrepriseIdValidator.parse('fr-839888138'), nom: 'ABOUNAMI GOLD', legal_siren: '839888138' },
]
const apiClient: Pick<ApiClient, 'creerEntreprise' | 'titresRechercherByNom' | 'getTitresByIds'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
  creerEntreprise: siren => {
    creerEntrepriseAction(siren)

    return Promise.resolve()
  },
}

export const NonConnecte: StoryFn = () => (
  <PureEntreprises entreprises={entreprises} apiClient={apiClient} user={null} currentRoute={{ name: 'entreprises', query: {} }} updateUrlQuery={updateUrlQuery} />
)

export const canCreateEntreprise: StoryFn = () => (
  <PureEntreprises entreprises={entreprises} apiClient={apiClient} user={{ role: 'super', ...testBlankUser }} currentRoute={{ name: 'entreprises', query: {} }} updateUrlQuery={updateUrlQuery} />
)
