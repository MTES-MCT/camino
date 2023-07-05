import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Journaux as JournauxData, JournauxQueryParams } from 'camino-common/src/journaux'
import { TitreId } from 'camino-common/src/titres'
import { markRaw, onMounted, ref } from 'vue'
import { Differences } from './differences'
import { AsyncData } from '@/api/client-rest'
import { JournauxApiClient } from './journaux-api-client'
import { LoadingElement } from '../_ui/functional-loader'
import { Params, TablePagination, Props as TablePaginationProps } from '../_ui/table-pagination'
import { TableRow, TableSortEvent } from '../_ui/table'

interface Props {
  titreId: TitreId | null
  apiClient: Pick<JournauxApiClient, 'getJournaux'>
}

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

export const isTableSortEvent = (event: Params | TableSortEvent): event is TableSortEvent => {
  return 'column' in event && 'order' in event
}
export const Journaux = caminoDefineComponent<Props>(['titreId', 'apiClient'], props => {
  const data = ref<AsyncData<JournauxData>>({ status: 'LOADING' })
  const params = ref<JournauxQueryParams>({
    page: 1,
    recherche: null,
    titreId: props.titreId,
  })
  const colonnes = () => {
    const data = [
      { id: 'date', name: 'Date' },
      { id: 'titre', name: 'Titre' },
      { id: 'utilisateur', name: 'Utilisateur' },
      { id: 'operation', name: 'Action' },
      { id: 'differences', name: 'Modifications' },
    ] as const

    if (!props.titreId) {
      return data
    }
    return data.filter(({ id }) => id !== 'titre')
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

  const paramsTableUpdate = async (event: Params | TableSortEvent) => {
    if (!isTableSortEvent(event)) {
      if (event.page) {
        params.value.page = event.page
        await load()
      }
    }
  }

  return () => (
    <>
      <LoadingElement
        data={data.value}
        renderItem={item => {
          let pagination: TablePaginationProps['pagination'] = {}
          if (item.total > item.elements.length) {
            pagination = {
              page: params.value.page,
            }
          }

          const res = item.total > item.elements.length ? `${item.elements.length} / ${item.total}` : item.elements.length
          const resultat = `${res} résultat${item.elements.length > 1 ? 's' : ''}`

          return (
            <>
              <div class="tablet-blobs tablet-flex-direction-reverse">
                <div class="tablet-blob-2-3 flex">
                  <div class="py-m h5 bold mb-xs">{resultat}</div>
                </div>
              </div>

              <div class="line-neutral width-full" />
              <TablePagination
                data={{
                  columns: colonnes(),
                  rows: lignes(item),
                  total: item.total,
                }}
                pagination={pagination}
                paramsUpdate={paramsTableUpdate}
              />
            </>
          )
        }}
      />
    </>
  )
})
