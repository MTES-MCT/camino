import { defineComponent } from 'vue'
import { Filtres } from '../_common/filtres'
import { getInitialFiltres } from '../_ui/filters/filters'
import { ApiClient } from '../../api/api-client'
import { Entreprise } from 'camino-common/src/entreprise'
import { CaminoRouteLocation, routesDefinitions } from '@/router/routes'
import { CaminoRouter } from '@/typings/vue-router'

export type TitreFiltresParams = Pick<ReturnType<typeof getInitialFiltres>, (typeof routesDefinitions)['titres']['meta']['filtres'][number]>
interface Props {
  subtitle: string
  route: CaminoRouteLocation
  router: Pick<CaminoRouter, 'push'>
  paramsUpdate: (params: TitreFiltresParams) => void
  apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds'>
  entreprises: Entreprise[]
}

export const getInitialTitresFiltresParams = (route: CaminoRouteLocation): TitreFiltresParams => {
  return getInitialFiltres(route, routesDefinitions[route.name].meta.filtres)
}
export const TitresFiltres = defineComponent<Props>(props => {
  return () => (
    <Filtres
      filters={routesDefinitions[props.route.name].meta.filtres}
      subtitle={props.subtitle}
      route={props.route}
      updateUrlQuery={props.router}
      apiClient={props.apiClient}
      paramsUpdate={props.paramsUpdate}
      entreprises={props.entreprises}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TitresFiltres.props = ['subtitle', 'route', 'router', 'apiClient', 'paramsUpdate', 'entreprises']
