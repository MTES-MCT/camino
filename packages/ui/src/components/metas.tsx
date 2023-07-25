import { computed, defineComponent } from 'vue'
import { Liste } from './_common/liste'
import { useRoute } from 'vue-router'
import { canReadMetas } from 'camino-common/src/permissions/metas'
import { CaminoAccessError } from './error'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { TableRow } from './_ui/table'
import { metasIndex } from '@/store/metas-definitions'
const metasColonnes = [
  {
    id: 'nom',
    name: 'Nom',
    noSort: true,
  },
] as const

interface Meta {
  nom: string
  linkName?: string
  id: string
}
const metasLignesBuild = (): TableRow[] =>
  Object.entries(metasIndex).map(([id, element]) => {
    const columns = {
      nom: { value: element.nom },
    }

    const link = 'linkName' in element ? { name: element.linkName } : { name: 'meta', params: { id } }

    return {
      id,
      link,
      columns,
    }
  })

// FIXME add tests
export const Metas = defineComponent(() => {
  const route = useRoute()
  const store = useStore()
  const user = computed<User>(() => store.state.user.element)
  return () => (
    <>
      {canReadMetas(user.value) ? (
        <Liste colonnes={metasColonnes} download={null} listeFiltre={null} renderButton={null} nom="métas" route={route} paramsUpdate={() => {}} total={0} lignes={metasLignesBuild()} />
      ) : (
        <CaminoAccessError user={user.value} />
      )}
    </>
  )
})
