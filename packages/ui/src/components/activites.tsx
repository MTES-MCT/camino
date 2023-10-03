import { computed, defineComponent, markRaw } from 'vue'
import { Liste, Params } from './_common/liste'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { Statut } from './_common/statut'
import { List } from './_ui/list'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { CaminoAccessError } from './error'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { Column, TableRow } from './_ui/table'
import { activitesDownloadFormats, activitesFiltresNames } from 'camino-common/src/filters'
import { ApiClient, apiClient } from '@/api/api-client'
import { UiGraphqlActivite } from './activite/activite-api-client'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'

const activitesColonnes = [
  {
    id: 'titre',
    name: 'Titre',
  },
  {
    id: 'titulaires',
    name: 'Titulaires',
  },
  {
    id: 'annee',
    name: 'Année',
  },
  {
    id: 'periode',
    name: 'Période',
  },
  {
    id: 'statut',
    name: 'Statut',
  },
] as const satisfies readonly Column[]

const activitesLignesBuild = (activites: UiGraphqlActivite[]): TableRow[] =>
  activites.map(activite => {
    const activiteStatut = ActivitesStatuts[activite.activiteStatutId]
    const columns = {
      titre: { value: activite.titre.nom },
      titulaires: {
        component: markRaw(List),
        props: {
          elements: activite.titre.titulaires.map(({ nom }) => nom),
          mini: true,
        },
        class: 'mb--xs',
        value: activite.titre.titulaires.map(({ nom }) => nom).join(', '),
      },
      annee: { value: activite.annee },
      periode: {
        value: getPeriode(ActivitesTypes[activite.typeId].frequenceId, activite.periodeId),
      },
      statut: {
        component: markRaw(Statut),
        props: {
          color: activiteStatut.couleur,
          nom: activiteStatut.nom,
        },
        value: activiteStatut.nom,
      },
    }

    return {
      id: activite.id,
      link: { name: 'activite', params: { activiteId: activite.slug } },
      columns,
    }
  })

interface Props {
  user: User
  currentRoute: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  apiClient: Pick<ApiClient, 'getActivites' | 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
}

export const PureActivites = defineComponent<Props>(props => {
  const getData = async (params: Params<string>) => {
    const activites = await props.apiClient.getActivites({ ordre: params.ordre, colonne: params.colonne, page: params.page, ...params.filtres })

    return { total: activites.total, values: activitesLignesBuild(activites.elements) }
  }

  return () => (
    <>
      {canReadActivites(props.user) ? (
        <Liste
          nom="activités"
          colonnes={activitesColonnes}
          getData={getData}
          download={{
            id: 'downloadActivites',
            downloadRoute: '/activites',
            formats: activitesDownloadFormats,
            params: {},
          }}
          listeFiltre={{
            filtres: activitesFiltresNames,
            apiClient: props.apiClient,
            updateUrlQuery: props.updateUrlQuery,
          }}
          renderButton={null}
          route={props.currentRoute}
        />
      ) : (
        <CaminoAccessError user={props.user} />
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureActivites.props = ['currentRoute', 'updateUrlQuery', 'apiClient', 'user']

export const Activites = defineComponent(() => {
  const store = useStore()
  const router = useRouter()
  const user = computed<User>(() => store.state.user.element)

  return () => <PureActivites user={user.value} apiClient={apiClient} currentRoute={router.currentRoute.value} updateUrlQuery={router} />
})
