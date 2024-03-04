import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LoadingElement } from './_ui/functional-loader'
import { ActiviteId, ActiviteIdOrSlug, activiteIdOrSlugValidator, Activite as CommonActivite } from 'camino-common/src/activite'
import { AsyncData } from '@/api/client-rest'
import { Preview } from './activite/preview'
import { ActiviteApiClient, activiteApiClient } from './activite/activite-api-client'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { User } from 'camino-common/src/roles'
import { CaminoAccessError } from './error'
import { userKey } from '@/moi'

export const Activite = defineComponent(() => {
  const router = useRouter()
  const user = inject(userKey)

  const activiteId = computed<ActiviteIdOrSlug | null>(() => {
    const idOrSlug = Array.isArray(router.currentRoute.value.params.activiteId) ? router.currentRoute.value.params.activiteId[0] : router.currentRoute.value.params.activiteId
    const validated = activiteIdOrSlugValidator.safeParse(idOrSlug)

    if (validated.success) {
      return validated.data
    }

    return null
  })

  const apiClient = {
    ...activiteApiClient,
    supprimerActivite: async (activiteId: ActiviteId) => {
      await activiteApiClient.supprimerActivite(activiteId)
      router.back()
    },
  }

  return () => <PureActivite user={user} activiteId={activiteId.value} apiClient={apiClient} />
})

interface Props {
  user: User
  activiteId: ActiviteIdOrSlug | null
  apiClient: Pick<ActiviteApiClient, 'getActivite' | 'deposerActivite' | 'supprimerActivite'>
}
export const PureActivite = defineComponent<Props>(props => {
  const activiteData = ref<AsyncData<CommonActivite>>({ status: 'LOADING' })
  const apiClient = {
    ...props.apiClient,
    deposerActivite: async (activiteId: ActiviteId) => {
      await props.apiClient.deposerActivite(activiteId)
      await retrieveActivite(activiteId)
    },
  }

  const retrieveActivite = async (activiteId: ActiviteIdOrSlug | null) => {
    if (activiteId === null) {
      activiteData.value = { status: 'ERROR', message: "Id ou slug d'activité non trouvé" }
    } else {
      try {
        activiteData.value = { status: 'LOADING' }
        const data = await props.apiClient.getActivite(activiteId)
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

  watch(
    () => props.activiteId,
    async () => {
      await retrieveActivite(props.activiteId)
    }
  )

  onMounted(async () => {
    await retrieveActivite(props.activiteId)
  })

  return () => (
    <>
      {canReadActivites(props.user) ? (
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

                <Preview key={activite.id} activite={activite} initialOpened={true} apiClient={apiClient} />
              </div>
            )}
          />
        </div>
      ) : (
        <CaminoAccessError user={props.user} />
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureActivite.props = ['user', 'activiteId', 'apiClient']
