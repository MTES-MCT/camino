import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '../api/api-client'
import { demarcheIdOrSlugValidator } from 'camino-common/src/demarche'

export const Demarche = defineComponent(() => {
  const router = useRouter()

  onMounted(async () => {
    const { demarche_slug, titre_id } = await apiClient.getDemarcheByIdOrSlug(demarcheIdOrSlugValidator.parse(router.currentRoute.value.params.demarcheId))

    router.push({ name: 'titre', params: { id: titre_id }, query: { demarche_slug } })
  })

  return () => null
})
