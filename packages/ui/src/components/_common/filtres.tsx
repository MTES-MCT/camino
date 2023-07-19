import { defineComponent, ref, watch, Ref } from 'vue'
import { z } from 'zod'
import { Filters, getInitialFiltres } from '../_ui/filters/filters'
import { getKeys } from 'camino-common/src/typescript-tools'
import { FiltersDeclaration } from '../_ui/filters/all-filters'
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

    init()
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

      // FIXME plus utile ?
      // // formate les valeurs des filtres
      // const params = filters.value.reduce<{ [key in FiltreId]: z.infer<Filtres[key]['validator']> }>((acc, filtre) => {
      //   let value: string | string[] | undefined

      //   if (filtre.type === 'etape' || filtre.type === 'checkboxes' || filtre.type === 'autocomplete') {
      //     value = (filtre.value ?? []).filter(v => v !== '')
      //   } else {
      //     value = filtre.value
      //   }

      //   // TODO 2023-07-17 pourquoi ce as est nécessaire ?
      //   acc[filtre.id as FiltreId] = filtre.validator.parse(value)

      //   return acc
      // }, {} as { [key in FiltreId]: z.infer<Filtres[key]['validator']> })

      filtresValues.value = params
      props.paramsUpdate(params)
    }
  }

  const init = () => {
    // FIXME tester avec les entreprises et bouger ce code dans le composant filters ?
    // filters.value = getKeys(props.filtres, isFiltreId)
    //   .map(id => props.filtres[id])
    //   .map(filtre => {
    //     const newFilter: typeof filtre = { ...filtre }
    //     if (filtre.type === 'autocomplete' && !filtre.lazy && filtre.elementsFormat) {
    //       // @ts-ignore TODO 2023-07-13 supprimer elementsFormat et tout ce qui s'en suit
    //       newFilter.elements = filtre.elementsFormat(filtre.id, props.metas)
    //     }
    //     return newFilter
    //   })
    // FIXME plus utile ?
    // Object.keys(props.params)
    //   .filter(isFiltreId<FiltreId>)
    //   .forEach(id => {
    //     const preference = props.params[id]
    //     const filtre = filters.value.find(filtre => filtre.id === id)
    //     if (!filtre) return
    //     filtre.value = preference
    //   })
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

  watch(
    () => props.initialized,
    (_new, old) => {
      if (!old) {
        init()
      }
    }
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
