import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '../api/api-client'
import { demarcheIdOrSlugValidator } from 'camino-common/src/demarche'

export const Demarche = defineComponent(() => {
  const router = useRouter()
  const route = useRoute<'demarche'>()

  onMounted(async () => {
    const { demarche_slug, titre_id } = await apiClient.getDemarcheByIdOrSlug(demarcheIdOrSlugValidator.parse(route.params.demarcheId))

    router.push({ name: 'titre', params: { id: titre_id }, query: { demarcheSlug: demarche_slug } })
  })

  return () => null
})
