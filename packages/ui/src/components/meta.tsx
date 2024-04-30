import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue'
import { MetaIndexTable, metasIndex } from '../metas-definitions'
import { canReadMetas } from 'camino-common/src/permissions/metas'
import { useRoute } from 'vue-router'
import { capitalize } from 'camino-common/src/strings'
import { userKey } from '@/moi'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
export const Meta = defineComponent(() => {
  const route = useRoute()
  const user = inject(userKey)

  const values = ref<{ [key in MetaIndexTable]?: unknown[] }>({})

  const id = computed<MetaIndexTable>(() => {
    return route.params.id as unknown as MetaIndexTable
  })

  const loaded = computed<boolean>(() => {
    return isNotNullNorUndefined(elements.value)
  })

  onMounted(async () => {
    await get()
  })

  const definition = computed(() => {
    return metasIndex[id.value]
  })

  const getDef = async (id: MetaIndexTable) => {
    try {
      if (isNotNullNorUndefined(metasIndex[id])) {
        const definition = metasIndex[id]
        if ('get' in definition) {
          const elements = await definition.get()
          values.value = { ...values.value, [id]: elements }
        }
        if ('colonnes' in definition) {
          for (const colonne of definition.colonnes) {
            if ('type' in colonne && colonne.type === 'entities' && isNotNullNorUndefined(colonne.entities) && isNullOrUndefined(values.value[colonne.entities])) {
              const entities = await metasIndex[colonne.entities].get()

              values.value = { ...values.value, [colonne.entities]: entities }
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
  const elements = computed(() => {
    return values.value[id.value]
  })

  const get = async () => {
    if (!canReadMetas(user)) {
      // TODO 2024-04-16 afficher une jolie alerte dans la page
      console.error('impossible d’accéder à cette page')
    } else {
      await getDef(id.value)
    }
  }

  const elementKeyFind = (element: any): string => {
    if ('ids' in definition.value) {
      return definition.value.ids.map(id => element[id]).join('-')
    } else {
      return element.id
    }
  }

  watch(
    () => route.params.id,
    async id => {
      if (route.name === 'meta' && isNotNullNorUndefined(id) && id !== '') {
        await get()
      }
    }
  )

  return () => (
    <>
      {loaded.value ? (
        <div>
          <router-link to={{ name: 'metas' }}>
            <h5>Métas</h5>
          </router-link>
          <h1>{capitalize(definition.value.nom)}</h1>

          <div class="line-neutral width-full" />

          <div class="mb-xxl width-full-p">
            <div>
              <div class="overflow-scroll-x mb">
                <table>
                  <tr>
                    {'colonnes' in definition.value ? (
                      <>
                        {definition.value.colonnes.map(colonne => (
                          <th key={colonne.id} class={['class' in colonne ? colonne.class : null, 'min-width-5']}>
                            {colonne.nom}
                          </th>
                        ))}
                      </>
                    ) : null}
                  </tr>

                  {elements.value?.map((element: any) => (
                    <tr key={elementKeyFind(element)}>
                      {'colonnes' in definition.value ? (
                        <>
                          {definition.value.colonnes.map(colonne => (
                            <td key={colonne.id}>
                              <div>{element[colonne.id]}</div>
                            </td>
                          ))}
                        </>
                      ) : null}
                    </tr>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
})
