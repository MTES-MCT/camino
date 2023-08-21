import { defineComponent, ref, watch } from 'vue'
import { Filters, getInitialFiltres } from '../_ui/filters/filters'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { CaminoFiltres, caminoFiltres } from '../_ui/filters/camino-filtres'
import { ApiClient } from '../../api/api-client'

export type Params = { [key in Props['filters'][number]]: (typeof caminoFiltres)[key]['validator']['_output'] }
export interface Props {
  filters: readonly CaminoFiltres[]
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  subtitle?: string
  toggle?: (open: boolean) => void
  paramsUpdate: (params: Params) => void
  apiClient: Pick<ApiClient, 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
}

export const Filtres = defineComponent((props: Props) => {
  const opened = ref<boolean>(false)
  const filtresValues = ref(getInitialFiltres(props.route, props.filters))

  const toggle = () => {
    opened.value = !opened.value

    props.toggle?.(opened.value)
  }

  const close = () => {
    opened.value = false
  }

  const validate = (params: Params) => {
    if (JSON.stringify(filtresValues.value) !== JSON.stringify(params)) {
      // les champs textes sont mis à jour onBlur
      // pour les prendre en compte lorsqu'on valide en appuyant sur "entrée"
      // met le focus sur le bouton de validation (dans la méthode close())
      close()

      filtresValues.value = params
      props.paramsUpdate(params)
    }
  }

  return () => (
    <Filters
      updateUrlQuery={props.updateUrlQuery}
      route={props.route}
      apiClient={props.apiClient}
      filters={props.filters}
      class="flex-grow"
      opened={opened.value}
      subtitle={props.subtitle}
      validate={validate}
      toggle={toggle}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Filtres.props = ['filters', 'apiClient', 'subtitle', 'toggle', 'paramsUpdate', 'route', 'updateUrlQuery']
