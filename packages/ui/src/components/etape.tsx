import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { AsyncData } from '../api/client-rest'
import { useStore } from 'vuex'
import { LoadingElement } from './_ui/functional-loader'
import { User } from 'camino-common/src/roles'
import { etapeIdValidator } from 'camino-common/src/etape'

// FIXME étape solo
export const Etape = defineComponent(() => {
  const route = useRoute()
  const store = useStore()

  const _etapeId = etapeIdValidator.parse(route.params.id)
  const data = ref<AsyncData<{ etape: unknown; titre: unknown }>>({ status: 'LOADING' })

  const _user = computed<User>(() => {
    return store.state.user.element
  })

  const loadEtape = async () => {
    try {
      // data.value = { status: 'LOADED', value: { etape, titre } }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }

  onMounted(async () => {
    await loadEtape()
  })

  return () => (
    <>
      <LoadingElement
        data={data.value}
        renderItem={({ etape, titre }) => (
          <>
            {etape} {titre}
          </>
        )}
      />
    </>
  )
})
