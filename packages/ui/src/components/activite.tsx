import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LoadingElement } from './_ui/functional-loader'
import { ActiviteId, ActiviteIdOrSlug, activiteIdOrSlugValidator, Activite as CommonActivite } from 'camino-common/src/activite'
import { AsyncData } from '@/api/client-rest'
import { Preview } from './activite/preview'
import { activiteApiClient } from './activite/activite-api-client'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { CaminoAccessError } from './error'

// FIXME test
export const Activite = defineComponent(() => {
  const router = useRouter()
  const route = useRoute()
  const store = useStore()
  const user = computed<User>(() => store.state.user.element)
  const activiteData = ref<AsyncData<CommonActivite>>({ status: 'LOADING' })
  const activiteId = computed<ActiviteIdOrSlug | null>(() => {
    const idOrSlug = Array.isArray(route.params.activiteId) ? route.params.activiteId[0] : route.params.activiteId
    const validated = activiteIdOrSlugValidator.safeParse(idOrSlug)

    if (validated.success) {
      return validated.data
    }
    return null
  })

  const retrieveActivite = async (activiteId: ActiviteIdOrSlug | null) => {
    if (activiteId === null) {
      activiteData.value = { status: 'ERROR', message: "Id ou slug d'activité non trouvé" }
    } else {
      try {
        activiteData.value = { status: 'LOADING' }
        const data = await activiteApiClient.getActivite(activiteId)
        activiteData.value = { status: 'LOADED', value: data }
      } catch (e: any) {
        console.error('error', e)
        activiteData.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }

  watch(activiteId, async () => {
    await retrieveActivite(activiteId.value)
  })

  onMounted(async () => {
    await retrieveActivite(activiteId.value)
  })

  const apiClient = {
    ...activiteApiClient,
    deposerActivite: async (activiteId: ActiviteId) => {
      await activiteApiClient.deposerActivite(activiteId)
      await retrieveActivite(activiteId)
    },
    supprimerActivite: async (activiteId: ActiviteId) => {
      await activiteApiClient.supprimerActivite(activiteId)
      router.back()
    },
  }

  return () => (
    <>
      {canReadActivites(user.value) ? (
        <div>
          <h2>Activité</h2>
          <LoadingElement
            data={activiteData.value}
            renderItem={activite => (
              <div>
                <h6>
                  <router-link to={{ name: 'titre', params: { id: activite.titre.slug } }} class="cap-first">
                    {activite.titre.nom}
                  </router-link>
                </h6>

                <Preview key={activite.id} activite={activite} route={{ name: 'titreActivite', id: activite.slug }} initialOpened={true} apiClient={apiClient} />
              </div>
            )}
          />
        </div>
      ) : (
        <CaminoAccessError user={user.value} />
      )}
    </>
  )
})
