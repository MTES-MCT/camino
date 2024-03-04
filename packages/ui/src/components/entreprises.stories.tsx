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
const getEntreprisesAction = action('getFilteredEntreprises')
const pushRouteAction = action('pushRoute')

const updateUrlQuery = { push: (values: RouteLocationRaw) => Promise.resolve(pushRouteAction(values)) }

const apiClient: Pick<ApiClient, 'getFilteredEntreprises' | 'creerEntreprise' | 'titresRechercherByNom' | 'getTitresByIds'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
  getFilteredEntreprises: _ => {
    getEntreprisesAction()

    return Promise.resolve({
      total: 1200,
      elements: [
        { id: entrepriseIdValidator.parse('fr-899600233'), nom: '10 A', legalSiren: '899600233', legalEtranger: null },
        { id: entrepriseIdValidator.parse('fr-529770646'), nom: '2GRE', legalSiren: '529770646', legalEtranger: null },
        { id: entrepriseIdValidator.parse('fr-895187920'), nom: '45-8 AVANT-MONTS', legalSiren: '895187920', legalEtranger: null },
        { id: entrepriseIdValidator.parse('fr-831762786'), nom: '45-8 FONTS-BOUILLANTS', legalSiren: '831762786', legalEtranger: null },
        { id: entrepriseIdValidator.parse('fr-539449124'), nom: '6EME SENS IMMOBILIER ENTREPRISES', legalSiren: '539449124', legalEtranger: null },
        { id: entrepriseIdValidator.parse('xx-100000146'), nom: '8 communes de la vallée de Vicdessos', legalSiren: null, legalEtranger: null },
        { id: entrepriseIdValidator.parse('xx-97300a001'), nom: 'Aboeka Alphonse', legalSiren: null, legalEtranger: null },
        { id: entrepriseIdValidator.parse('fr-523359024'), nom: 'ABOEKA METAL', legalSiren: '523359024', legalEtranger: null },
        { id: entrepriseIdValidator.parse('xx-97300a002'), nom: 'Aboeka Thomas', legalSiren: null, legalEtranger: null },
        { id: entrepriseIdValidator.parse('fr-839888138'), nom: 'ABOUNAMI GOLD', legalSiren: '839888138', legalEtranger: null },
      ],
    })
  },
  creerEntreprise: siren => {
    creerEntrepriseAction(siren)

    return Promise.resolve()
  },
}

export const Loading: StoryFn = () => (
  <PureEntreprises
    entreprises={[]}
    apiClient={{ ...apiClient, getFilteredEntreprises: () => new Promise(() => ({})) }}
    user={null}
    currentRoute={{ name: 'entreprises', query: {} }}
    updateUrlQuery={updateUrlQuery}
  />
)

export const NonConnecte: StoryFn = () => <PureEntreprises entreprises={[]} apiClient={apiClient} user={null} currentRoute={{ name: 'entreprises', query: {} }} updateUrlQuery={updateUrlQuery} />

export const canCreateEntreprise: StoryFn = () => (
  <PureEntreprises entreprises={[]} apiClient={apiClient} user={{ role: 'super', ...testBlankUser }} currentRoute={{ name: 'entreprises', query: {} }} updateUrlQuery={updateUrlQuery} />
)
