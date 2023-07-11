
import { ref, watch } from 'vue'
import Filters from '../_ui/filters.vue'
import { caminoDefineComponent } from '../../utils/vue-tsx-utils'
type MultipleType = 'custom' | 'select' | 'checkboxes' | 'autocomplete'
type Filtre = {
  id: string
  type: MultipleType | 'input'
  elementsFormat?: (id: string, metas: unknown) => unknown
  clean?: (value: unknown) => unknown
}

type Filter = Omit<Filtre, 'type'> & {
  elements?: unknown
} & ({type: MultipleType, value?: string[]} | {type: 'input', value?: unknown})

export interface Props {
  filtres: readonly Filtre[],
  params: Record<string, unknown>
  metas: unknown,
  initialized: boolean,
  subtitle?: string,
  toggle?: (open: boolean) => void
  paramsUpdate: (value: unknown) => void
}
export const Filtres = caminoDefineComponent<Props>([
  'filtres',
  'params',
  'metas',
  'initialized',
  'subtitle',
 'toggle', 'paramsUpdate' ] , (props) => {

  const opened = ref<boolean>(false)
  const filters = ref<Filter[]>([])

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
    const params = filters.value.reduce<Record<string, unknown>>((acc, filtre) => {
      let value

      if (filtre.type === 'custom' || filtre.type === 'select' || filtre.type === 'checkboxes' || filtre.type === 'autocomplete') {
        value = (filtre.value ?? []).filter(v => v !== '')
      } else {
        value = filtre.value
      }

      if (filtre.clean) {
        value = filtre.clean(value)
      }

      acc[filtre.id] = value

      return acc
    }, {})

    props.paramsUpdate(params)
  }

  const init = () => {
    filters.value = props.filtres.map(filtre => {
      const newFilter: Filter = {...filtre}
      if (filtre.elementsFormat) {
        newFilter.elements = filtre.elementsFormat(filtre.id, props.metas)
      }

      return newFilter
    })

    Object.keys(props.params).forEach(id => {
      const preference = props.params[id]
      const filtre = filters.value.find(filtre => filtre.id === id)

      if (!filtre) return

      filtre.value = preference
    })
  }

  watch(() => props.metas, () => {
    if (props.initialized) {
                validate()
              }
  },{ deep: true})

  watch(() => props.initialized, (_new, old) => {
    if (!old) {
      init()
    }
  })

  return () => <>
  {props.initialized ? <Filters v-model:filters={filters.value} class="flex-grow" button="Valider" opened={opened.value} title="Filtres" subtitle={props.subtitle} onValidate={validate} onToggle={toggle} /> :
  <div v-else class="py-s px-m mb-s border rnd-s">…</div>}
</>


 })
