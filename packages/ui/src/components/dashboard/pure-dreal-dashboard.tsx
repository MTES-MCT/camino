import { markRaw, onMounted, ref } from 'vue'
import { TableAuto } from '../_ui/table-auto'
import { List } from '../_ui/list'
import { PureDGTMStats } from './pure-dgtm-stats'
import {
  nomColumn,
  nomCell,
  referencesColumn,
  titulairesColumn,
  statutCell,
  referencesCell,
  titulairesCell,
  typeColumn,
  typeCell,
  activitesCell,
  activiteAutoColumn,
  statutAutoColumn,
} from '@/components/titres/table-utils'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { Column, ComponentColumnData, TableRow, TextColumnData } from '../_ui/table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DashboardApiClient } from './dashboard-api-client'

export interface Props {
  apiClient: Pick<DashboardApiClient, 'getDrealTitres' | 'getDgtmStats'>
  isDGTM: boolean
}

const derniereEtapeColumn: Column<'derniereEtape'> = {
  id: 'derniereEtape',
  name: 'Dernière étape',
}

const prochainesEtapesColumn: Column<'prochainesEtapes'> = {
  id: 'prochainesEtapes',
  name: 'Prochaines étapes',
}

const columns = [nomColumn, typeColumn, statutAutoColumn, activiteAutoColumn, referencesColumn, titulairesColumn, derniereEtapeColumn] as const

const columnsEnAttente = [nomColumn, typeColumn, statutAutoColumn, titulairesColumn, derniereEtapeColumn, prochainesEtapesColumn] as const

export const PureDrealDashboard = caminoDefineComponent<Props>(['apiClient', 'isDGTM'], props => {
  const data = ref<
    AsyncData<{
      drealTitres: TableRow[]
      drealTitresBloques: TableRow[]
    }>
  >({ status: 'LOADING' })
  const initialColumnId = columns[3].id

  type Columns = (typeof columns)[number]['id'] | (typeof columnsEnAttente)[number]['id']

  const prochainesEtapesCell = (titre: CommonTitreDREAL) => ({
    component: markRaw(List),
    props: {
      elements: titre.prochainesEtapes?.map(id => EtapesTypes[id].nom),
      mini: true,
    },
    class: 'mb--xs',
    value: titre.prochainesEtapes?.map(id => EtapesTypes[id].nom).join(', '),
  })
  const titresLignesBuild = (titres: CommonTitreDREAL[]): TableRow<Columns>[] => {
    return titres.map(titre => {
      const columns: {
        [key in Columns]: ComponentColumnData | TextColumnData
      } = {
        nom: nomCell(titre),
        type: typeCell(titre.type_id),
        statut: statutCell(titre),
        activites: activitesCell(titre),
        references: referencesCell(titre),
        titulaires: titulairesCell(titre),
        derniereEtape: {
          value: titre.derniereEtape ? `${EtapesTypes[titre.derniereEtape.etapeTypeId].nom} (${titre.derniereEtape.date})` : '',
        },
        prochainesEtapes: prochainesEtapesCell(titre),
      }
      return {
        id: titre.id,
        link: { name: 'titre', params: { id: titre.slug } },
        columns,
      }
    })
  }

  onMounted(async () => {
    try {
      const titres = await props.apiClient.getDrealTitres()
      data.value = {
        status: 'LOADED',
        value: {
          drealTitres: titresLignesBuild(titres.filter(titre => !titre.enAttenteDeDREAL)),
          drealTitresBloques: titresLignesBuild(titres.filter(titre => titre.enAttenteDeDREAL)),
        },
      }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })

  return () => (
    <div>
      <div class="desktop-blobs">
        <div class="desktop-blob-2-3">
          <h1 class="mt-xs mb-xxl">Tableau de bord {props.isDGTM ? 'DGTM' : ''}</h1>
        </div>
      </div>
      {props.isDGTM ? (
        <div class="mb-l">
          <h3>
            Statistiques
            <router-link to={{ name: 'Stats DGTM' }}> Voir plus </router-link>
          </h3>
          <PureDGTMStats apiClient={props.apiClient} />
        </div>
      ) : null}
      <div class="line-neutral width-full mb-l"></div>
      <LoadingElement
        data={data.value}
        renderItem={item => {
          if (item.drealTitresBloques.length) {
            return (
              <TableAuto caption="Titres en attente de la DREAL" class="mb-xxl" columns={columnsEnAttente} rows={item.drealTitresBloques} initialSort={{ column: initialColumnId, order: 'asc' }} />
            )
          }
          return null
        }}
      />
      <LoadingElement
        data={data.value}
        renderItem={item => (
          <TableAuto caption="Titres en cours d’instruction" columns={columns} rows={item.drealTitres} initialSort={{ column: initialColumnId, order: 'asc' }} class="width-full-p" />
        )}
      />
    </div>
  )
})
