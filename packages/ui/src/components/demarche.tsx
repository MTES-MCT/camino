import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '../api/api-client'
import { demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { LoadingElement } from './_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { useState } from '@/utils/vue-tsx-utils'

export const Demarche = defineComponent(() => {
  const router = useRouter()
  const route = useRoute<'demarche'>()
  const [apiCall, setApiCall] = useState<AsyncData<null>>({ status: 'LOADING' })
  onMounted(async () => {
    const response = await apiClient.getDemarcheByIdOrSlug(demarcheIdOrSlugValidator.parse(route.params.demarcheId))
    if ('message' in response) {
      setApiCall({ status: 'NEW_ERROR', error: response })
    } else {
      const { demarche_slug, titre_id } = response
      router.push({ name: 'titre', params: { id: titre_id }, query: { demarcheSlug: demarche_slug } })
    }
  })

  return () => <LoadingElement data={apiCall.value} renderItem={() => null} />
})
