import { FunctionalComponent, defineComponent, inject } from 'vue'
import { Liste } from './_common/liste'
import { useRoute } from 'vue-router'
import { canReadMetas } from 'camino-common/src/permissions/metas'
import { CaminoAccessError } from './error'
import { User } from 'camino-common/src/roles'
import { Column, TableRow } from './_ui/table'
import { metasIndex } from '@/metas-definitions'
import { userKey } from '@/moi'
import { CaminoRouteLocation } from '@/router/routes'
const metasColonnes = [
  {
    id: 'nom',
    name: 'Nom',
    noSort: true,
  },
] as const satisfies readonly Column[]

const metasLignesBuild = (): Promise<{ values: TableRow[]; total: number }> => {
  const data = Object.entries(metasIndex).map(([id, element]) => {
    const columns = {
      nom: { value: element.nom },
    }

    const link = { name: 'meta', params: { id } }

    return {
      id,
      link,
      columns,
    }
  })

  return Promise.resolve({ values: data, total: data.length })
}

interface Props {
  user: User
  currentRoute: CaminoRouteLocation
}
export const PureMetas: FunctionalComponent<Props> = props => {
  if (canReadMetas(props.user)) {
    return <Liste colonnes={metasColonnes} download={null} listeFiltre={null} renderButton={null} nom="métas" route={props.currentRoute} getData={metasLignesBuild} />
  } else {
    return <CaminoAccessError user={props.user} />
  }
}

export const Metas = defineComponent(() => {
  const route = useRoute()
  const user = inject(userKey)

  return () => <PureMetas user={user} currentRoute={route} />
})
