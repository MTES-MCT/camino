import { Journaux as JournauxData } from 'camino-common/src/journaux'
import { defineComponent } from 'vue'
import { Column, TableRow } from './_ui/table'
import { useRouter } from 'vue-router'
import { Liste, Params } from './_common/liste'
import { ApiClient, apiClient } from '@/api/api-client'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

import { Differences } from './journaux/differences'
import { CaminoRouteLocation, routesDefinitions } from '@/router/routes'
import { CaminoRouter } from '@/typings/vue-router'

export const Journaux = defineComponent(() => {
  const router = useRouter()
  return () => <PureJournaux apiClient={apiClient} updateUrlQuery={router} currentRoute={router.currentRoute.value} />
})

interface Props {
  apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds' | 'getJournaux'>
  currentRoute: CaminoRouteLocation
  updateUrlQuery: Pick<CaminoRouter, 'push'>
}

const colonnesData = [
  { id: 'date', contentTitle: 'Date', noSort: true },
  { id: 'titre', contentTitle: 'Titre', noSort: true },
  { id: 'utilisateur', contentTitle: 'Utilisateur', noSort: true },
  { id: 'operation', contentTitle: 'Action', noSort: true },
  { id: 'differences', contentTitle: 'Modifications', noSort: true },
] as const satisfies Column[]

type ColonneId = (typeof colonnesData)[number]['id']

const lignes = (journaux: JournauxData): TableRow<ColonneId>[] => {
  return journaux.elements.map(journal => {
    const date = new Date(Number.parseInt(journal.date))
    const columns: TableRow<ColonneId>['columns'] = {
      date: {
        type: 'text',
        value: date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'medium' }),
      },
      titre: {
        type: 'text',
        value: journal.titre?.nom,
      },
      utilisateur: {
        type: 'text',
        value: isNotNullNorUndefined(journal.utilisateur) ? `${journal.utilisateur.nom} ${journal.utilisateur.prenom}` : 'Système',
      },
      operation: {
        type: 'text',
        value: journal.operation,
      },
      differences: {
        type: 'jsx',
        jsxElement: <Differences journal={journal} />,
        value: journal.id,
      },
    }

    return {
      id: journal.id,
      link: { name: 'etape', params: { id: journal.elementId } },
      columns,
    }
  })
}

export const PureJournaux = defineComponent<Props>(props => {
  const getData = async (event: Params<string>) => {
    const values = await props.apiClient.getJournaux({ page: event.page ?? 1, recherche: null, ...event.filtres })

    return { total: values.total, values: lignes(values) }
  }

  return () => (
    <Liste
      listeFiltre={{
        filtres: routesDefinitions[props.currentRoute.name].meta.filtres,
        apiClient: props.apiClient,
        updateUrlQuery: props.updateUrlQuery,
        entreprises: [],
      }}
      renderButton={null}
      download={null}
      colonnes={colonnesData}
      route={props.currentRoute}
      getData={getData}
      nom="Journaux"
    />
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureJournaux.props = ['apiClient', 'currentRoute', 'updateUrlQuery']
