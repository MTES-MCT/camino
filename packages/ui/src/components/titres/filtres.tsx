import { defineComponent } from 'vue'
import { Filtres } from '../_common/filtres'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { getInitialFiltres } from '../_ui/filters/filters'
import { CaminoFiltres } from '../_ui/filters/camino-filtres'
import { ApiClient } from '../../api/api-client'

export type TitreFiltresParams = Pick<ReturnType<typeof getInitialFiltres>, (typeof filtres)[number]>
interface Props {
  subtitle: string
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  router: Pick<Router, 'push'>
  paramsUpdate: (params: TitreFiltresParams) => void
  apiClient: Pick<ApiClient, 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
}
const filtres = [
  'titresIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'communes',
  'departements',
  'regions',
  'facadesMaritimes',
  'domainesIds',
  'typesIds',
  'statutsIds',
] as const satisfies readonly CaminoFiltres[]

export const getInitialTitresFiltresParams = (route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>): TitreFiltresParams => {
  return getInitialFiltres(route, filtres)
}
// FIXME matomo track avec tout le truc bizarre des paramètres de la route
export const TitresFiltres = defineComponent<Props>(props => {
  return () => <Filtres filters={filtres} subtitle={props.subtitle} route={props.route} updateUrlQuery={props.router} apiClient={props.apiClient} paramsUpdate={props.paramsUpdate} />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TitresFiltres.props = ['subtitle', 'route', 'router', 'apiClient', 'paramsUpdate']
