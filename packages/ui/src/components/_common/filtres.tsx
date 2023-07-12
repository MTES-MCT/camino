import { defineComponent, ref, watch, Ref } from 'vue'
import { z, ZodType } from 'zod'
import Filters from '../_ui/filters.vue'
import { administrationTypeIdValidator } from 'camino-common/src/static/administrations'
import { getKeys } from 'camino-common/src/typescript-tools'
type MultipleType = 'custom' | 'select' | 'checkboxes' | 'autocomplete'
export type Filtre<FiltreId> = {
  id: FiltreId
  validator: ZodType
  type: MultipleType | 'input'
  elementsFormat?: (id: FiltreId, metas: unknown) => unknown
}

type FilterType<FiltreId> = Omit<Filtre<FiltreId>, 'type'> & {
  elements?: unknown
} & ({ type: MultipleType; value?: string[] } | { type: 'input'; value?: string })

export interface Props<FiltreId extends string, Filtres extends { [key in FiltreId]: Filtre<key> }> {
  filtres: Filtres
  params: { [key in FiltreId]: z.infer<Filtres[key]['validator']> }
  metas: unknown
  initialized: boolean
  subtitle?: string
  toggle?: (open: boolean) => void
  paramsUpdate: (value: { [key in FiltreId]: z.infer<Filtres[key]['validator']> }) => void
}

const isFiltreId = <FiltreId extends string>(id: string): id is FiltreId => true
export const Filtres = defineComponent(<FiltreId extends string, Filtres extends { [key in FiltreId]: Filtre<key> }>(props: Props<FiltreId, Filtres>) => {
  const opened = ref<boolean>(false)
  const filters = ref<FilterType<FiltreId>[]>([]) as Ref<FilterType<FiltreId>[]>

  const toggle = () => {
    opened.value = !opened.value

    init()
    props.toggle?.(opened.value)
  }

  const close = () => {
    opened.value = false
  }

  const validate = () => {
    // les champs textes sont mis à jour onBlur
    // pour les prendre en compte lorsqu'on valide en appuyant sur "entrée"
    // met le focus sur le bouton de validation (dans la méthode close())

    close()

    window.scrollTo({ top: 0, behavior: 'smooth' })

    // formate les valeurs des filtres
    const params = filters.value.reduce<Record<FiltreId, z.infer<Filtres[FiltreId]['validator']>>>((acc, filtre) => {
      let value: string | string[] | undefined

      if (filtre.type === 'custom' || filtre.type === 'select' || filtre.type === 'checkboxes' || filtre.type === 'autocomplete') {
        value = (filtre.value ?? []).filter(v => v !== '')
      } else {
        value = filtre.value
      }

      acc[filtre.id] = filtre.validator.parse(filtre.value)

      return acc
    }, {} as Record<FiltreId, z.infer<Filtres[FiltreId]['validator']>>)

    props.paramsUpdate(params)
  }

  const init = () => {
    // @ts-ignore on arrive pas à garder le lien avec FiltreId
    filters.value = getKeys(props.filtres, isFiltreId)
      .map(id => props.filtres[id])
      .map(filtre => {
        const newFilter: FilterType<string> = { ...filtre }
        if (filtre.elementsFormat) {
          newFilter.elements = filtre.elementsFormat(filtre.id, props.metas)
        }

        return newFilter
      })

    Object.keys(props.params)
      .filter(isFiltreId<FiltreId>)
      .forEach(id => {
        const preference = props.params[id]
        const filtre = filters.value.find(filtre => filtre.id === id)

        if (!filtre) return

        filtre.value = preference
      })
  }

  watch(
    () => props.metas,
    () => {
      if (props.initialized) {
        validate()
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
        <Filters v-model:filters={filters.value} class="flex-grow" button="Valider" opened={opened.value} title="Filtres" subtitle={props.subtitle} onValidate={validate} onToggle={toggle} />
      ) : (
        <div v-else class="py-s px-m mb-s border rnd-s">
          …
        </div>
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Filtres.props = ['filtres', 'params', 'metas', 'initialized', 'subtitle', 'toggle', 'paramsUpdate']

const toto = () => {
  const filtres = { noms: { id: 'noms', type: 'input', validator: z.string() }, typesIds: { id: 'typesIds', type: 'input', validator: z.array(administrationTypeIdValidator) } } as const
  const filtresParam = {
    noms: '',
    typesIds: [],
  }

  return (
    <Filtres
      filtres={filtres}
      subtitle={'zizi'}
      initialized={true}
      metas={{}}
      params={filtresParam}
      paramsUpdate={pa => {
        console.log(pa)
        console.log(pa.noms)
      }}
    />
  )
}
