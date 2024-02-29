import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MetaIndexTable, metasIndex } from '../store/metas-definitions'
import { canReadMetas } from 'camino-common/src/permissions/metas'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { useRoute } from 'vue-router'
import { capitalize } from 'camino-common/src/strings'
import { userMemoized } from '@/moi'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
export const Meta = defineComponent(() => {
  const store = useStore()
  const route = useRoute()
  const id = computed<MetaIndexTable>(() => {
    return route.params.id as unknown as MetaIndexTable
  })

  const loaded = computed<boolean>(() => {
    return isNotNullNorUndefined(elements.value)
  })

  onMounted(async () => {
    user.value = await userMemoized()
    await get()
  })
  onBeforeUnmount(() => {
    store.commit('meta/reset')
  })
  const definition = computed(() => {
    return metasIndex[id.value]
  })

  const elements = computed(() => {
    return store.getters['meta/elements'](id.value)
  })
  const user = ref<User>(null)

  const get = async () => {
    if (!canReadMetas(user.value)) {
      await store.dispatch('pageError', user.value)
    } else {
      await store.dispatch('meta/get', id.value)
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

                  {elements.value.map((element: any) => (
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
