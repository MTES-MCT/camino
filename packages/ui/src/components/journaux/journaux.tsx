import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Journaux as JournauxData, JournauxQueryParams } from 'camino-common/src/journaux'
import { TitreId } from 'camino-common/src/titres'
import { markRaw, onMounted, ref } from 'vue'
import { Differences } from './differences'
import { AsyncData } from '@/api/client-rest'
import { JournauxApiClient } from './journaux-api-client'
import { LoadingElement } from '../_ui/functional-loader'
import { TableRow } from '../_ui/table'
import { useRoute } from 'vue-router'
import { Liste, Params } from '../_common/liste'

interface Props {
  titreId: TitreId | null
  apiClient: Pick<JournauxApiClient, 'getJournaux'>
}

const colonnesData = [
  { id: 'date', name: 'Date', noSort: true },
  { id: 'titre', name: 'Titre', noSort: true },
  { id: 'utilisateur', name: 'Utilisateur', noSort: true },
  { id: 'operation', name: 'Action', noSort: true },
  { id: 'differences', name: 'Modifications', noSort: true },
] as const

type ColonneId = (typeof colonnesData)[number]['id']

const lignes = (journaux: JournauxData): TableRow[] => {
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
        value: journal.utilisateur ? `${journal.utilisateur.nom} ${journal.utilisateur.prenom}` : 'Système',
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

export const Journaux = caminoDefineComponent<Props>(['titreId', 'apiClient'], props => {
  const data = ref<AsyncData<JournauxData>>({ status: 'LOADING' })
  const params = ref<JournauxQueryParams>({
    page: 1,
    recherche: null,
    titreId: props.titreId,
    intervalle: 10,
  })

  const route = useRoute()
  const colonnes = () => {
    if (!props.titreId) {
      return colonnesData
    }
    return colonnesData.filter(({ id }) => id !== 'titre')
  }

  const load = async () => {
    data.value = { status: 'LOADING' }
    try {
      const values = await props.apiClient.getJournaux(params.value)
      data.value = { status: 'LOADED', value: values }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }

  onMounted(async () => {
    await load()
  })

  const paramsTableUpdate = async (event: Params<ColonneId, never, never>) => {
    if (event.page) {
      params.value.page = event.page
      await load()
    }
  }

  return () => (
    <>
      <LoadingElement
        data={data.value}
        renderItem={item => (
          <Liste listeFiltre={null} renderButton={null} download={null} colonnes={colonnes()} route={route} lignes={lignes(item)} nom="Journaux" paramsUpdate={paramsTableUpdate} total={item.total} />
        )}
      />
    </>
  )
})
