import { defineComponent, ref, watch } from 'vue'
import { Filters, getInitialFiltres } from '../_ui/filters/filters'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { CaminoFiltres, caminoFiltres } from '../_ui/filters/camino-filtres'

export type Params = { [key in Props['filters'][number]]: (typeof caminoFiltres)[key]['validator']['_output'] }
export interface Props {
  filters: readonly CaminoFiltres[]
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  metas: unknown
  initialized: boolean
  subtitle?: string
  toggle?: (open: boolean) => void
  paramsUpdate: (params: Params) => void
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

      window.scrollTo({ top: 0, behavior: 'smooth' })

      filtresValues.value = params
      props.paramsUpdate(params)
    }
  }

  watch(
    () => props.metas,
    () => {
      if (props.initialized) {
        validate(filtresValues.value)
      }
    },
    { deep: true }
  )

  return () => (
    <>
      {props.initialized ? (
        <Filters
          updateUrlQuery={props.updateUrlQuery}
          route={props.route}
          metas={props.metas}
          filters={props.filters}
          class="flex-grow"
          opened={opened.value}
          subtitle={props.subtitle}
          validate={validate}
          toggle={toggle}
        />
      ) : (
        <div class="py-s px-m mb-s border rnd-s">…</div>
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Filtres.props = ['filters', 'metas', 'initialized', 'subtitle', 'toggle', 'paramsUpdate', 'route', 'updateUrlQuery']
