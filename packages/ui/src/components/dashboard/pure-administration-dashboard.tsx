import { computed, markRaw, onMounted, ref } from 'vue'
import { TableAuto } from '../_ui/table-auto'
import { List } from '../_ui/list'
import { PureDGTMStats } from './pure-dgtm-stats'
import { nomColumn, nomCell, referencesColumn, titulairesColumn, statutCell, referencesCell, titulairesCell, typeColumn, typeCell, statutAutoColumn } from '@/components/titres/table-utils'
import { CommonTitreAdministration } from 'camino-common/src/titres'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { Column, ComponentColumnData, TableRow, TextColumnData } from '../_ui/table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DashboardApiClient } from './dashboard-api-client'
import { AdminUserNotNull, isAdministrationAdmin, isAdministrationEditeur } from 'camino-common/src/roles'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { PageContentHeader } from '../_common/page-header-content'
import { CaminoRouterLink } from '../../router/camino-router-link'
import { DsfrSeparator } from '../_ui/dsfr-separator'

interface Props {
  apiClient: Pick<DashboardApiClient, 'getAdministrationTitres' | 'getDgtmStats'>
  user: AdminUserNotNull
}

const derniereEtapeColumn: Column<'derniereEtape'> = {
  id: 'derniereEtape',
  name: 'Dernière étape',
}

const prochainesEtapesColumn: Column<'prochainesEtapes'> = {
  id: 'prochainesEtapes',
  name: 'Prochaines étapes',
}

const columns = [nomColumn, typeColumn, statutAutoColumn, referencesColumn, titulairesColumn, derniereEtapeColumn] as const

const columnsEnAttente = [nomColumn, typeColumn, statutAutoColumn, titulairesColumn, derniereEtapeColumn, prochainesEtapesColumn] as const

export const PureAdministrationDashboard = caminoDefineComponent<Props>(['apiClient', 'user'], props => {
  const isDGTM = computed<boolean>(() => {
    return (isAdministrationAdmin(props.user) || isAdministrationEditeur(props.user)) && props.user.administrationId === ADMINISTRATION_IDS['DGTM - GUYANE']
  })
  const data = ref<
    AsyncData<{
      administrationTitres: TableRow[]
      administrationTitresBloques: TableRow[]
    }>
  >({ status: 'LOADING' })
  const initialColumnId = columns[3].id

  type Columns = (typeof columns)[number]['id'] | (typeof columnsEnAttente)[number]['id']

  const prochainesEtapesCell = (titre: CommonTitreAdministration) => ({
    component: markRaw(List),
    props: {
      elements: titre.prochainesEtapes?.map(id => EtapesTypes[id].nom),
      mini: true,
    },
    class: 'mb--xs',
    value: titre.prochainesEtapes?.map(id => EtapesTypes[id].nom).join(', '),
  })
  const titresLignesBuild = (titres: CommonTitreAdministration[]): TableRow<Columns>[] => {
    return titres.map(titre => {
      const columns: {
        [key in Columns]: ComponentColumnData | TextColumnData
      } = {
        nom: nomCell(titre),
        type: typeCell(titre.type_id),
        statut: statutCell(titre),
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
      const titres = await props.apiClient.getAdministrationTitres()
      data.value = {
        status: 'LOADED',
        value: {
          administrationTitres: titresLignesBuild(titres.filter(titre => !titre.enAttenteDeAdministration)),
          administrationTitresBloques: titresLignesBuild(titres.filter(titre => titre.enAttenteDeAdministration)),
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
    <div class="dsfr">
      <PageContentHeader nom="Tableau de bord" download={null} renderButton={null} />
      {isDGTM.value ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2>Statistiques</h2>
            <CaminoRouterLink to={{ name: 'Stats DGTM' }} title="Voir la page de statistiques DGTM">
              Voir plus
            </CaminoRouterLink>
          </div>

          <PureDGTMStats apiClient={props.apiClient} />
          <DsfrSeparator />
        </>
      ) : null}
      <LoadingElement
        data={data.value}
        renderItem={item => {
          if (item.administrationTitresBloques.length) {
            return (
              <TableAuto
                caption="Titres en attente de votre administration"
                columns={columnsEnAttente}
                rows={item.administrationTitresBloques}
                initialSort={{ colonne: initialColumnId, ordre: 'asc' }}
              />
            )
          }

          return null
        }}
      />
      <LoadingElement
        data={data.value}
        renderItem={item => <TableAuto caption="Titres en cours d’instruction" columns={columns} rows={item.administrationTitres} initialSort={{ colonne: initialColumnId, ordre: 'asc' }} />}
      />
    </div>
  )
})
