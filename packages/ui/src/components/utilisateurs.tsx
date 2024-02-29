import { defineComponent, onMounted, ref } from 'vue'
import { Liste, Params } from './_common/liste'
import { User } from 'camino-common/src/roles'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { CaminoAccessError } from './error'
import { utilisateursColonnes, utilisateursLignesBuild } from './utilisateurs/table'
import { ApiClient, apiClient } from '../api/api-client'
import { TableRow } from './_ui/table'
import { utilisateursDownloadFormats, utilisateursFiltresNames } from 'camino-common/src/filters'
import { userMemoized } from '@/moi'

interface Props {
  user: User
  apiClient: Pick<ApiClient, 'getUtilisateurs' | 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
  currentRoute: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
}
export const PureUtilisateurs = defineComponent<Props>(props => {
  const load = async (params: Params<string>): Promise<{ values: TableRow[]; total: number }> => {
    const getUtilisateursParams = {
      page: params.page,
      colonne: params.colonne,
      ordre: params.ordre,
      noms: params.filtres?.nomsUtilisateurs,
      emails: params.filtres?.emails,
      roles: params.filtres?.roles,
      administrationIds: params.filtres?.administrationIds,
      entreprisesIds: params.filtres?.entreprisesIds,
    }
    const utilisateurs = await props.apiClient.getUtilisateurs(getUtilisateursParams)

    return { values: utilisateursLignesBuild(utilisateurs.elements), total: utilisateurs.total }
  }

  return () => (
    <>
      {canReadUtilisateurs(props.user) ? (
        <Liste
          nom="utilisateurs"
          listeFiltre={{ filtres: utilisateursFiltresNames, updateUrlQuery: props.updateUrlQuery, apiClient: props.apiClient }}
          route={props.currentRoute}
          colonnes={utilisateursColonnes}
          getData={load}
          download={{ id: 'utilisateursDownload', downloadRoute: '/utilisateurs', formats: utilisateursDownloadFormats, params: {} }}
          renderButton={null}
        />
      ) : (
        <CaminoAccessError user={props.user} />
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureUtilisateurs.props = ['currentRoute', 'updateUrlQuery', 'apiClient', 'user']

export const Utilisateurs = defineComponent(() => {
  const router = useRouter()

  const user = ref<User>(null)

  onMounted(async () => {
    user.value = await userMemoized()
  })

  return () => {
    return <PureUtilisateurs user={user.value} apiClient={apiClient} updateUrlQuery={router} currentRoute={router.currentRoute.value} />
  }
})
