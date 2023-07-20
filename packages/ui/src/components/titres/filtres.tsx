import { defineComponent } from 'vue'
import { Filtres } from '../_common/filtres'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { getInitialFiltres } from '../_ui/filters/filters'
import { CaminoFiltres } from '../_ui/filters/camino-filtres'

export type TitreFiltresParams = Pick<ReturnType<typeof getInitialFiltres>, (typeof filtres)[number]>
interface Props {
  initialized: boolean
  subtitle: string
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  router: Pick<Router, 'push'>
  metas: unknown
  paramsUpdate: (params: TitreFiltresParams) => void
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
  return () => (
    <Filtres filters={filtres} subtitle={props.subtitle} initialized={props.initialized} route={props.route} updateUrlQuery={props.router} metas={props.metas} paramsUpdate={props.paramsUpdate} />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TitresFiltres.props = ['initialized', 'subtitle', 'route', 'router', 'metas', 'paramsUpdate']
