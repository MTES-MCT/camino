import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { MetaIndexTable, metasIndex } from '@/store/metas-definitions'
import { useStore } from 'vuex'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'

export type DefinitionTree = {
  joinTable?: MetaIndexTable
  id: MetaIndexTable
  // TOOD 2023-09-19 better type foreignKey
  foreignKey?: string
  definitions?: readonly DefinitionTree[]
}

interface Props {
  definitionsTree: DefinitionTree
  foreignKeys?: Record<string, string>
  rootComponent?: boolean
}
export const DefinitionEdit = defineComponent<Props>(props => {
  const store = useStore()

  const data = ref<AsyncData<true>>({ status: 'LOADING' })
  onMounted(async () => {
    const promises = []
    promises.push(store.dispatch('meta/get', props.definitionsTree.id))
    if (props.definitionsTree.joinTable) {
      promises.push(store.dispatch('meta/get', props.definitionsTree.joinTable))
    }
    await Promise.all(promises)
    data.value = { status: 'LOADED', value: true }
  })

  onUnmounted(async () => {
    await elementSelect(null)
  })

  const rootComponent = computed<boolean>(() => {
    return props.rootComponent ?? true
  })

  const title = computed(() => {
    if ('colonnes' in definition.value) {
      const colonnes = [...definition.value.colonnes]
      return colonnes.find(colonne => colonne.id === props.definitionsTree.foreignKey)?.nom
    } else {
      return definition.value.nom
    }
  })
  const elementSelected = computed(() => {
    return store.getters['meta/elementSelected'](props.definitionsTree.joinTable || props.definitionsTree.id)
  })
  const definition = computed(() => {
    return metasIndex[props.definitionsTree.joinTable ? props.definitionsTree.joinTable : props.definitionsTree.id]
  })
  const elements = computed<{ id: string; nom: string }[]>(() => {
    if (!props.definitionsTree.joinTable) {
      // si pas de table de jointure on peut directement charger les éléments
      return store.getters['meta/elements'](props.definitionsTree.id) ?? []
    }
    // via une table de jointure
    const elementIdsFiltered = store.getters['meta/elements'](props.definitionsTree.joinTable)
      // on garde les lignes en fonction des éléments déjà sélectionnés
      .filter((joinRow: any) => Object.keys(props.foreignKeys ?? {}).every(foreignKey => joinRow[foreignKey] === (props.foreignKeys ?? {})[foreignKey]))
      .map((joinRow: any) => joinRow[props.definitionsTree.foreignKey as string])

    return store.getters['meta/elements']?.(props.definitionsTree.id)?.filter(({ id }: any) => elementIdsFiltered.includes(id)) || []
  })

  const colonnesToEdit = computed(() => {
    if ('colonnes' in definition.value) {
      const colonnes = [...definition.value.colonnes]
      return colonnes.filter((colonne: any) => colonne.id !== 'id').filter(colonne => !('type' in colonne) || colonne.type !== 'entities')
    }
    return []
  })

  const elementToEdit = computed(() => {
    if (!props.definitionsTree.joinTable) {
      return elementSelected.value
    }

    return store.getters['meta/elements'](props.definitionsTree.joinTable).find((joinRow: any) =>
      Object.keys(foreignKeysNew.value).every(foreignKey => joinRow[foreignKey] === foreignKeysNew.value[foreignKey])
    )
  })

  const foreignKeysNew = computed<Record<string, string>>(() => {
    if (props.definitionsTree.foreignKey) {
      return {
        ...props.foreignKeys,
        [props.definitionsTree.foreignKey]: elementSelected.value?.id,
      }
    }
    return { ...props.foreignKeys }
  })

  const selectChange = async (event: any) => {
    const elementId = event.target.value
    const element = elements.value.find(({ id }: { id: string }) => id === elementId)
    await elementSelect(element)
  }
  const labelGet = (element: { id: string; nom: string } | undefined): string => {
    const meta = metasIndex[props.definitionsTree.id]
    if ('labelGet' in meta) {
      return meta.labelGet(element)
    }
    return ''
  }
  const elementSelect = async (element: any) => {
    await store.dispatch('meta/elementSelect', {
      id: props.definitionsTree.joinTable || props.definitionsTree.id,
      element,
    })
  }

  return () => (
    <LoadingElement
      data={data.value}
      renderItem={_ => (
        <div>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h4>{title.value}</h4>
            </div>
            <div class="mb tablet-blob-2-3">
              <select value={elementSelected.value?.id} class="p-s" onChange={selectChange}>
                {elements.value.map(element => {
                  return (
                    <option key={element.id} value={element.id}>
                      {labelGet(element) ?? element.nom}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          {elementSelected.value ? (
            <div class="mb-xl">
              {rootComponent.value || props.definitionsTree.joinTable ? (
                <div class="rnd-s border p-m">
                  <div class="tablet-blobs">
                    {colonnesToEdit.value.map(colonne => (
                      <div key={colonne.id} class="tablet-blob-1-2">
                        <div class="tablet-blobs mb-s">
                          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
                            <h5>{colonne.nom}</h5>
                          </div>
                          <div class="tablet-blob-2-3">{elementToEdit.value[colonne.id] || ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {props.definitionsTree.definitions?.map(definitionChild => (
                <div key={definitionChild.joinTable} class="pl-l">
                  <span class="separator" />
                  <DefinitionEdit definitionsTree={definitionChild} foreignKeys={foreignKeysNew.value} rootComponent={false} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    />
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DefinitionEdit.props = ['definitionsTree', 'foreignKeys', 'rootComponent']
