import { computed, defineComponent, onMounted, ref } from 'vue'
import { TableSimple } from '../_ui/table-simple'
import { List } from '../_ui/list'
import { PureDGTMStats } from './pure-dgtm-stats'
import { nomColumn, nomCell, referencesColumn, titulairesColumn, statutCell, referencesCell, titulairesCell, typeColumn, typeCell, statutColumn } from '@/components/titres/table-utils'
import { CommonTitreAdministration } from 'camino-common/src/titres'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { Column, ComponentColumnData, JSXElementColumnData, TableRow, TextColumnData } from '../_ui/table'
import { DashboardApiClient } from './dashboard-api-client'
import { AdminUserNotNull, isAdministrationAdmin, isAdministrationEditeur } from 'camino-common/src/roles'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { PageContentHeader } from '../_common/page-header-content'
import { CaminoRouterLink } from '../../router/camino-router-link'
import { DsfrSeparator } from '../_ui/dsfr-separator'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'

interface Props {
  apiClient: Pick<DashboardApiClient, 'getAdministrationTitres' | 'getDgtmStats'>
  user: AdminUserNotNull
  entreprises: Entreprise[]
}

const derniereEtapeColumn: Column<'derniereEtape'> = {
  id: 'derniereEtape',
  contentTitle: 'Dernière étape',
}

const prochainesEtapesColumn: Column<'prochainesEtapes'> = {
  id: 'prochainesEtapes',
  contentTitle: 'Prochaines étapes',
}

const columns = [nomColumn, typeColumn, statutColumn, referencesColumn, titulairesColumn, derniereEtapeColumn] as const
type ColumnId = (typeof columns)[number]['id']

const columnsEnAttente = [nomColumn, typeColumn, statutColumn, titulairesColumn, derniereEtapeColumn, prochainesEtapesColumn] as const
type ColumnEnAttenteId = (typeof columnsEnAttente)[number]['id']

export const PureAdministrationDashboard = defineComponent<Props>(props => {
  const isDGTM = computed<boolean>(() => {
    return (isAdministrationAdmin(props.user) || isAdministrationEditeur(props.user)) && props.user.administrationId === ADMINISTRATION_IDS['DGTM - GUYANE']
  })

  const data = ref<
    AsyncData<{
      administrationTitres: TableRow<ColumnId>[]
      administrationTitresBloques: TableRow<ColumnEnAttenteId>[]
    }>
  >({ status: 'LOADING' })

  type Columns = (typeof columns)[number]['id'] | (typeof columnsEnAttente)[number]['id']

  const prochainesEtapesCell = (titre: CommonTitreAdministration): JSXElementColumnData => ({
    type: 'jsx',
    jsxElement: <List elements={titre.prochainesEtapes?.map(id => EtapesTypes[id].nom)} mini={true} />,
    value: titre.prochainesEtapes?.map(id => EtapesTypes[id].nom).join(', '),
  })
  const titresLignesBuild = (titres: CommonTitreAdministration[], entreprisesIndex: Record<EntrepriseId, string>): TableRow<Columns>[] => {
    return titres.map(titre => {
      const columns: {
        [key in Columns]: JSXElementColumnData | ComponentColumnData | TextColumnData
      } = {
        nom: nomCell(titre),
        type: typeCell(titre.type_id),
        statut: statutCell(titre),
        references: referencesCell(titre),
        titulaires: titulairesCell(titre, entreprisesIndex),
        derniereEtape: {
          type: 'text',
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
      const entreprisesIndex = props.entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
        acc[entreprise.id] = entreprise.nom

        return acc
      }, {})

      const titres = await props.apiClient.getAdministrationTitres()
      data.value = {
        status: 'LOADED',
        value: {
          administrationTitres: titresLignesBuild(
            titres.filter(titre => !titre.enAttenteDeAdministration),
            entreprisesIndex
          ),
          administrationTitresBloques: titresLignesBuild(
            titres.filter(titre => titre.enAttenteDeAdministration),
            entreprisesIndex
          ),
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
      <PageContentHeader nom="Tableau de bord" download={null} renderButton={null} />
      {isDGTM.value ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2>Statistiques</h2>
            <CaminoRouterLink to={{ name: 'statsDGTM', params: {} }} isDisabled={false} title="Voir la page de statistiques DGTM">
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
            return <TableSimple caption={{ value: 'Titres en attente de votre administration', visible: true }} columns={columnsEnAttente} rows={item.administrationTitresBloques} />
          }

          return null
        }}
      />
      <LoadingElement data={data.value} renderItem={item => <TableSimple caption={{ value: 'Titres en cours d’instruction', visible: true }} columns={columns} rows={item.administrationTitres} />} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureAdministrationDashboard.props = ['apiClient', 'user', 'entreprises']
