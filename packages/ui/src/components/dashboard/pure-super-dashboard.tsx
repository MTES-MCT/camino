import { defineComponent, onMounted, ref } from 'vue'
import { Column, TableSimple } from '../_ui/table-simple'
import { nomColumn, nomCell, statutCell, typeCell, domaineColumn, domaineCell } from '@/components/titres/table-utils'
import { SuperTitre } from 'camino-common/src/titres'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { ComponentColumnData, JSXElementColumnData, TableRow, TextColumnData } from '../_ui/table'
import { DashboardApiClient } from './dashboard-api-client'
import { User } from 'camino-common/src/roles'
import { PageContentHeader } from '../_common/page-header-content'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { CaminoRouterLink } from '@/router/camino-router-link'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { capitalize } from 'camino-common/src/strings'
import { getDomaineId } from 'camino-common/src/static/titresTypes'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'

interface Props {
  apiClient: Pick<DashboardApiClient, 'getTitresAvecEtapeEnBrouillon'>
  user: User
}
const columns = [
  nomColumn,
  { id: 'demarche_type', contentTitle: 'Type de démarche' },
  { id: 'titre_type', contentTitle: 'Type de titre' },
  domaineColumn,
  { id: 'titre_statut', contentTitle: 'Statut du titre' },
  { id: 'etape_brouillon', contentTitle: 'Étape en brouillon' },
  { id: 'etape_date', contentTitle: "Date de l'étape" },
] as const satisfies Column[]
type ColumnId = (typeof columns)[number]['id']

export const PureSuperDashboard = defineComponent<Props>(props => {
  const data = ref<AsyncData<TableRow<ColumnId>[]>>({ status: 'LOADING' })

  type Columns = (typeof columns)[number]['id']

  const titresLignesBuild = (titres: SuperTitre[]): TableRow<Columns>[] => {
    return titres.map(titre => {
      const columns: {
        [key in Columns]: JSXElementColumnData | ComponentColumnData | TextColumnData
      } = {
        nom: nomCell({ nom: titre.titre_nom }),
        titre_type: typeCell(titre.titre_type_id),
        demarche_type: {
          type: 'jsx',
          jsxElement: (
            <CaminoRouterLink to={{ name: 'demarche', params: { demarcheId: titre.demarche_slug } }} isDisabled={false} title={DemarchesTypes[titre.demarche_type_id].nom}>
              {capitalize(DemarchesTypes[titre.demarche_type_id].nom)}
            </CaminoRouterLink>
          ),
          value: titre.demarche_type_id,
        },
        domaine: domaineCell({ domaineId: getDomaineId(titre.titre_type_id) }),
        titre_statut: statutCell(titre),
        etape_brouillon: { type: 'text', value: capitalize(EtapesTypes[titre.etape_type_id].nom) },
        etape_date: { type: 'text', value: titre.etape_date },
      }

      return {
        id: titre.titre_slug,
        link: { name: 'titre', params: { id: titre.titre_slug } },
        columns,
      }
    })
  }

  onMounted(async () => {
    const titres = await props.apiClient.getTitresAvecEtapeEnBrouillon()
    if ('message' in titres) {
      data.value = {
        status: 'NEW_ERROR',
        error: titres,
      }
    } else {
      data.value = {
        status: 'LOADED',
        value: titresLignesBuild(titres),
      }
    }
  })

  return () => (
    <div>
      <PageContentHeader nom="Tableau de bord" download={null} renderButton={null} />
      <LoadingElement
        data={data.value}
        renderItem={item => {
          if (isNotNullNorUndefinedNorEmpty(item)) {
            return <TableSimple caption={{ value: 'Titres avec une étape en brouillon', visible: true }} columns={columns} rows={item} />
          }

          return <p>Aucune étape en brouillon</p>
        }}
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureSuperDashboard.props = ['apiClient', 'user']
