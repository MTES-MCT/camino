import { defineComponent, ref } from 'vue'
import { Filters, getInitialFiltres } from '../_ui/filters/filters'
import { CaminoFiltre, caminoFiltres } from 'camino-common/src/filters'
import { ApiClient } from '../../api/api-client'
import { Entreprise } from 'camino-common/src/entreprise'
import { CaminoRouteLocation } from '@/router/routes'
import { CaminoRouter } from '@/typings/vue-router'

type Params = { [key in Props['filters'][number]]: (typeof caminoFiltres)[key]['validator']['_output'] }
interface Props {
  filters: readonly CaminoFiltre[]
  route: CaminoRouteLocation
  updateUrlQuery: Pick<CaminoRouter, 'push'>
  subtitle?: string
  toggle?: (open: boolean) => void
  paramsUpdate: (params: Params) => void
  apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds'>
  entreprises: Entreprise[]
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
      // TODO 2024-05-29 ici on clone car, par un hasard étrange, on se retrouve parfois avec la même référence d'objet qui est passée tout le temps, du coup validate est appelé avec la même valeur que filtresValues alors que ça vient de changer...'
      // Il faut qu'on change ce comportement, probablement en faisant en sorte que les filtres utilisent le routeur, et que personne d'autre ne s'en serve pour calculer les filtres initiaux, mais utilisent plutôt les callback des filtres
      const newParams = structuredClone(params)

      filtresValues.value = newParams
      props.paramsUpdate(newParams)
    }
  }

  return () => (
    <Filters
      updateUrlQuery={props.updateUrlQuery}
      route={props.route}
      apiClient={props.apiClient}
      entreprises={props.entreprises}
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
