import { computed, defineComponent, markRaw, onMounted, ref } from 'vue'
import { Liste } from './_common/liste'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { Statut } from './_common/statut'
import { List } from './_ui/list'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { CaminoAccessError } from './error'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from './_ui/functional-loader'
import { Activite, GetActivitesParams } from './activite/activite-api-client'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { TableRow } from './_ui/table'
import { getInitialParams } from './_ui/table-pagination'
import { getInitialFiltres } from './_ui/filters/filters'
import { CaminoFiltres } from './_ui/filters/camino-filtres'
import { ApiClient, apiClient } from '@/api/api-client'

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
] as const

const activitesLignesBuild = (activites: Activite[]): TableRow[] =>
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
      link: { name: 'activite', params: { id: activite.slug } },
      columns,
    }
  })

const filtres: readonly CaminoFiltres[] = [
  'titresIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'titresTerritoires',
  'domainesIds',
  'typesIds',
  'statutsIds',
  'activiteTypesIds',
  'activiteStatutsIds',
  'annees',
] as const

interface Props {
  user: User
  currentRoute: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  apiClient: Pick<ApiClient, 'getActivites' | 'getEntreprises'>
}

export const PureActivites = defineComponent<Props>(props => {
  const meta = ref<AsyncData<unknown>>({ status: 'LOADING' })
  const data = ref<AsyncData<true>>({ status: 'LOADING' })

  const activitesRef = ref<{ elements: Activite[]; total: number }>({ elements: [], total: 0 })

  const load = async (params: GetActivitesParams) => {
    data.value = { status: 'LOADING' }

    try {
      const activites = await props.apiClient.getActivites(params)
      activitesRef.value.elements.splice(0, activitesRef.value.elements.length, ...activites.elements)
      activitesRef.value.total = activites.total
      data.value = { status: 'LOADED', value: true }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }
  onMounted(async () => {
    meta.value = { status: 'LOADING' }
    try {
      const entreprises = await props.apiClient.getEntreprises()
      meta.value = { status: 'LOADED', value: { entreprises } }
    } catch (e: any) {
      console.error('error', e)
      meta.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
    await load({ ...getInitialParams(props.currentRoute, activitesColonnes), ...getInitialFiltres(props.currentRoute, filtres) })
  })

  return () => (
    <>
      {canReadActivites(props.user) ? (
        <LoadingElement
          data={meta.value}
          renderItem={metas => (
            <>
              <LoadingElement data={data.value} renderItem={_data => null} />

              {/* FIXME Mettre en place des listes asynchrones qui prennent un AsyncData en entrée et gèrent le cycle de vie de la nouvelle donnée */}
              <Liste
                nom="activités"
                colonnes={activitesColonnes}
                lignes={activitesLignesBuild(activitesRef.value.elements)}
                total={activitesRef.value.total}
                download={{
                  id: 'downloadActivites',
                  downloadRoute: '/activites',
                  formats: ['csv', 'xlsx', 'ods'],
                  params: {},
                }}
                listeFiltre={{
                  filtres,
                  initialized: true,
                  metas,
                  updateUrlQuery: props.updateUrlQuery,
                }}
                renderButton={null}
                paramsUpdate={params => {
                  load({ ordre: params.ordre, colonne: params.colonne, page: params.page, ...params.filtres })
                }}
                route={props.currentRoute}
              />
            </>
          )}
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
