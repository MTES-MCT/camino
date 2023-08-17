import { computed, defineComponent, onMounted, ref } from 'vue'
import { Liste, Params } from './_common/liste'
import { User } from 'camino-common/src/roles'
import { useStore } from 'vuex'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from './_ui/functional-loader'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { Utilisateur } from 'camino-common/src/entreprise'
import { UtilisateursParams } from './utilisateur/utilisateur-api-client'
import { getInitialFiltres } from './_ui/filters/filters'
import { CaminoAccessError } from './error'
import { getInitialParams } from './_ui/table-pagination'
import { utilisateursColonnes, utilisateursLignesBuild } from './utilisateurs/table'
import { ApiClient, apiClient } from '../api/api-client'

const filtres = ['nomsUtilisateurs', 'emails', 'roles', 'administrationIds', 'entreprisesIds'] as const

interface Props {
  user: User
  apiClient: Pick<ApiClient, 'getUtilisateurs' | 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
  currentRoute: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
}
export const PureUtilisateurs = defineComponent<Props>(props => {
  const data = ref<AsyncData<true>>({ status: 'LOADING' })
  const load = async (params: UtilisateursParams) => {
    data.value = { status: 'LOADING' }

    try {
      const utilisateurs = await props.apiClient.getUtilisateurs(params)
      utilisateursRef.value.elements.splice(0, utilisateursRef.value.elements.length, ...utilisateurs.elements)
      utilisateursRef.value.total = utilisateurs.total
      data.value = { status: 'LOADED', value: true }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }

  const utilisateursRef = ref<{ elements: Utilisateur[]; total: number }>({ elements: [], total: 0 })
  const onParamsUpdate = (params: Params<string>) => {
    load({
      page: params.page,
      colonne: params.colonne,
      ordre: params.ordre,
      noms: params.filtres?.nomsUtilisateurs,
      emails: params.filtres?.emails,
      roles: params.filtres?.roles,
      administrationIds: params.filtres?.administrationIds,
      entreprisesIds: params.filtres?.entreprisesIds,
    })
  }
  onMounted(async () => {
    await load({ ...getInitialParams(props.currentRoute, utilisateursColonnes), ...getInitialFiltres(props.currentRoute, filtres) })
  })

  return () => (
    <>
      {canReadUtilisateurs(props.user) ? (
        <>
          <LoadingElement data={data.value} renderItem={data => null} />

          {/* FIXME Mettre en place des listes asynchrones qui prennent un AsyncData en entrée et gèrent le cycle de vie de la nouvelle donnée */}
          <Liste
            nom="utilisateurs"
            listeFiltre={{ filtres, updateUrlQuery: props.updateUrlQuery, apiClient: props.apiClient }}
            route={props.currentRoute}
            colonnes={utilisateursColonnes}
            lignes={utilisateursLignesBuild(utilisateursRef.value.elements)}
            total={utilisateursRef.value.total}
            download={{ id: 'utilisateursDownload', downloadRoute: '/utilisateurs', formats: ['csv', 'xlsx', 'ods'], params: {} }}
            renderButton={null}
            paramsUpdate={onParamsUpdate}
          />
        </>
      ) : (
        <CaminoAccessError user={props.user} />
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureUtilisateurs.props = ['currentRoute', 'updateUrlQuery', 'apiClient', 'user']

export const Utilisateurs = defineComponent(() => {
  const store = useStore()
  const router = useRouter()

  const user = computed<User>(() => {
    return store.state.user.element
  })

  return () => {
    return <PureUtilisateurs user={user.value} apiClient={apiClient} updateUrlQuery={router} currentRoute={router.currentRoute.value} />
  }
})
