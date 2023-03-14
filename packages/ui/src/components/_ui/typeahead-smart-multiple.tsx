import { onMounted, ref, watch, Ref } from 'vue'
import { TypeAhead } from '@/components/_ui/typeahead'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

export type Element<T extends string> = { id: T; nom: string }

type RemoteFilter<T extends string> = {
  lazy: true
  search: (input: string) => Promise<{ elements: Element<T>[] }>
  load: (ids: T[]) => Promise<{ elements: Element<T>[] }>
}

type LocalFilter = {
  lazy: false
}

type Filter<T extends string> = {
  id: string
  value: T[]
  elements: Element<T>[]
  name: string
} & (LocalFilter | RemoteFilter<T>)
export type Props<T extends string> = {
  filter: Filter<T>
  onSelectItems: (e: Element<T>[]) => void
}

const GenericTypeAheadSmartMultiple = <ID extends string>() =>
  caminoDefineComponent<Props<ID>>(['filter', 'onSelectItems'], props => {
    const selectedItems = ref<Element<ID>[]>([]) as Ref<Element<ID>[]>
    const items = ref<Element<ID>[]>(props.filter.elements) as Ref<Element<ID>[]>
    const allKnownItems = ref<Record<string, Element<ID>>>({})
    const overrideItems = ref<Element<ID>[]>([]) as Ref<Element<ID>[]>

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
        items.value = result.elements
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
        overrideItems.value = props?.filter?.value.map(id => allKnownItems.value[id]).filter((elem: Element<ID> | undefined): elem is Element<ID> => elem !== undefined)
        selectedItems.value = overrideItems.value
      }
    })

    const updateHandler = (e: Element<ID>[]) => {
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
      <TypeAhead
        overrideItems={overrideItems.value}
        props={{
          id: 'filters_autocomplete_' + props.filter.name,
          itemKey: 'id',
          placeholder: props.filter.name,
          type: 'multiple',
          items: items.value,
          minInputLength: props.filter.lazy ? 3 : 1,
          itemChipLabel: item => item.nom,
          onSelectItems: updateHandler,
          onInput: search,
        }}
      />
    )
  })

export const TypeAheadSmartMultiple = <T extends string = string>(props: Props<T>): JSX.Element => {
  const Autocomplete = GenericTypeAheadSmartMultiple<T>()
  return <Autocomplete filter={props.filter} onSelectItems={props.onSelectItems} />
}