import { onMounted, ref, watch } from 'vue'
import { TypeAhead } from '@/components/_ui/typeahead'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
export type Element = { id: string; nom: string }

type RemoteFilter = {
  lazy: true
  search: (input: string) => Promise<{ elements: Element[] }>
  load: (ids: string[]) => Promise<{ elements: Element[] }>
}

type LocalFilter = {
  lazy: false
}

type Filter = {
  id: string
  value: string[]
  elements: Element[]
  name: string
} & (LocalFilter | RemoteFilter)
interface Props {
  filter: Filter
  onSelectItems: (e: Element[]) => void
}
export const InputAutocomplete = caminoDefineComponent<Props>(['filter', 'onSelectItems'], props => {
  const selectedItems = ref<Element[]>([])
  const items = ref<Element[]>(props.filter.elements)
  const allKnownItems = ref<Record<string, Element>>({})
  const overrideItems = ref<Element[]>([])

  watch(
    () => props.filter.value,
    newValues => {
      if (newValues) {
        overrideItems.value = newValues.map(id => allKnownItems.value[id]).filter(isNotNullNorUndefined) ?? []

        selectedItems.value = overrideItems.value
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    if (props.filter.lazy && props.filter.value?.length) {
      const result = await props.filter.load(props.filter.value)
      overrideItems.value = result.elements
      for (const element of result.elements) {
        allKnownItems.value[element.id] = element
      }
      // TODO 2022-04-08: ceci est pour le composant parent, pour la traduction notamment (sinon, pour un titreId par exemple, le label est son ID au lieu du nom du titre).
      // C'est étrange, il va falloir corriger tout ça un jour
      props.filter.elements = [...Object.values(allKnownItems.value)]
    }
    for (const element of props.filter.elements) {
      allKnownItems.value[element.id] = element
    }
    // TODO 2022-04-08 des fois, ceci est une chaine vide, des fois un objet. Il faudra supprimer tout ça une fois les composants parents refactorés
    if (Array.isArray(props?.filter?.value)) {
      overrideItems.value = props?.filter?.value.map(id => allKnownItems.value[id]).filter((elem: Element | undefined): elem is Element => elem !== undefined)
      selectedItems.value = overrideItems.value
    }
  })

  const updateHandler = (e: Element[]) => {
    selectedItems.value = e
    // TODO 2022-04-08: ceci est pour le composant parent, une fois refactoré, utiliser uniquement le onSelectItems
    props.filter.value = e.map(({ id }) => id)
    props.onSelectItems(e)
  }

  const search = async (value: string) => {
    if (props.filter.lazy) {
      const result = await props.filter.search(value)
      items.value = [...selectedItems.value, ...result.elements]
      for (const element of result.elements) {
        allKnownItems.value[element.id] = element
      }
      // TODO 2022-04-08: ceci est pour le composant parent, pour la traduction notamment (sinon, pour un titreId par exemple, le label est son ID au lieu du nom du titre).
      // C'est étrange, il va falloir corriger tout ça un jour
      props.filter.elements = [...Object.values(allKnownItems.value)]
    } else {
      items.value = props.filter.elements.filter(item => item.nom.toLowerCase().includes(value.toLowerCase()) || selectedItems.value.some(({ id }) => id === item.id))
    }
  }

  return () => (
    <div class="mb">
      <h5>{props.filter.name}</h5>
      <hr class="mb-s" />

      <TypeAhead
        props={{
          id: 'filters_autocomplete_' + props.filter.name,
          itemKey: 'id',
          placeholder: props.filter.name,
          type: 'multiple',
          items: items.value,
          overrideItems: overrideItems.value,
          minInputLength: props.filter.lazy ? 3 : 1,
          itemChipLabel: item => item.nom,
          onSelectItems: updateHandler,
          onInput: search,
        }}
      />
    </div>
  )
})
