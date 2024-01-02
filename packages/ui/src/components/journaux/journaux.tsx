import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Journaux as JournauxData } from 'camino-common/src/journaux'
import { markRaw } from 'vue'
import { Differences } from './differences'
import { TableRow } from '../_ui/table'
import { useRouter } from 'vue-router'
import { Liste, Params } from '../_common/liste'
import { CaminoFiltre } from 'camino-common/src/filters'
import { ApiClient } from '@/api/api-client'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  apiClient: Pick<ApiClient, 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds' | 'getJournaux'>
}

const colonnesData = [
  { id: 'date', name: 'Date', noSort: true },
  { id: 'titre', name: 'Titre', noSort: true },
  { id: 'utilisateur', name: 'Utilisateur', noSort: true },
  { id: 'operation', name: 'Action', noSort: true },
  { id: 'differences', name: 'Modifications', noSort: true },
] as const

type ColonneId = (typeof colonnesData)[number]['id']

const lignes = (journaux: JournauxData): TableRow<ColonneId>[] => {
  return journaux.elements.map(journal => {
    const date = new Date(Number.parseInt(journal.date))
    const columns = {
      date: {
        value: date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      },
      titre: {
        value: journal.titre?.nom,
      },
      utilisateur: {
        value: isNotNullNorUndefined(journal.utilisateur) ? `${journal.utilisateur.nom} ${journal.utilisateur.prenom}` : 'Système',
      },
      operation: {
        value: journal.operation,
      },
      differences: {
        component: markRaw(Differences),
        value: journal.id,
        props: {
          journal,
        },
      },
    }

    return {
      id: journal.id,
      link: { name: 'etape', params: { id: journal.elementId } },
      columns,
    }
  })
}

const filtres = ['titresIds'] as const satisfies readonly CaminoFiltre[]

export const Journaux = caminoDefineComponent<Props>(['apiClient'], props => {
  const router = useRouter()

  const getData = async (event: Params<string>) => {
    const values = await props.apiClient.getJournaux({ page: event.page ?? 1, recherche: null, ...event.filtres })

    return { total: values.total, values: lignes(values) }
  }

  return () => (
    <Liste
      listeFiltre={{
        filtres,
        apiClient: props.apiClient,
        updateUrlQuery: router,
      }}
      renderButton={null}
      download={null}
      colonnes={colonnesData}
      route={router.currentRoute.value}
      getData={getData}
      nom="Journaux"
    />
  )
})
