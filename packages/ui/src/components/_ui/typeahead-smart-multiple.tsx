import { onMounted, ref, watch, Ref, defineComponent } from 'vue'

import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { levenshtein } from 'camino-common/src/strings'
import { TypeAheadMultiple } from './typeahead-multiple'

export type Element<T extends string> = { id: T; nom: string }

type RemoteFilter<T extends string> = {
  lazy: true
  search: (input: string) => Promise<{ elements: Element<T>[] }>
  load: (ids: T[]) => Promise<{ elements: Element<T>[] }>
}

type LocalFilter = {
  lazy: false
}

export type Filter<T extends string> = {
  value: T[]
  elements: Element<T>[]
  name: string
} & (LocalFilter | RemoteFilter<T>)
type Props<T extends string> = {
  filter: Filter<T>
  onSelectItems: (e: Element<T>[]) => void
}

export const TypeAheadSmartMultiple = defineComponent(<ID extends string>(props: Props<ID>) => {
  const selectedItems = ref<Element<ID>[]>([]) as Ref<Element<ID>[]>
  const items = ref<Element<ID>[]>(props.filter.elements) as Ref<Element<ID>[]>
  const allKnownItems = ref<Record<string, Element<ID>>>({})
  const overrideItems = ref<Element<ID>[]>([]) as Ref<Element<ID>[]>

  watch(
    () => props.filter.value,
    newValues => {
      overrideItems.value = newValues.map(id => allKnownItems.value[id]).filter(isNotNullNorUndefined) ?? []

      selectedItems.value = overrideItems.value
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
      const elements = [...Object.values(allKnownItems.value)]
      props.filter.elements.splice(0, props.filter.elements.length, ...elements)
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
      const elements = [...Object.values(allKnownItems.value)]
      props.filter.elements.splice(0, props.filter.elements.length, ...elements)
    } else if (!value.length) {
      items.value = props.filter.elements
    } else {
      items.value = props.filter.elements
        .filter(item => item.nom.toLowerCase().includes(value.toLowerCase()) || selectedItems.value.some(({ id }) => id === item.id))
        .sort((a, b) => {
          let aLabel = a.nom
          if (!a.nom.toLowerCase().includes(value.toLowerCase())) {
            aLabel = a.id
          }
          let bLabel = b.nom
          if (!b.nom.toLowerCase().includes(value.toLowerCase())) {
            bLabel = b.id
          }

          return levenshtein(aLabel.toLowerCase(), value.toLowerCase()) - levenshtein(bLabel.toLowerCase(), value.toLowerCase())
        })
    }
  }

  return () => (
    <TypeAheadMultiple
      overrideItems={overrideItems.value}
      props={{
        id: 'filters_autocomplete_' + props.filter.name,
        itemKey: 'id',
        placeholder: props.filter.name,
        items: items.value,
        minInputLength: props.filter.lazy ? 3 : 0,
        itemChipLabel: item => item.nom,
        onSelectItems: updateHandler,
        onInput: search,
      }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TypeAheadSmartMultiple.props = ['filter', 'onSelectItems']
