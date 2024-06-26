import { defineComponent, inject, markRaw, ref } from 'vue'
import { Liste, Params } from './_common/liste'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { List } from './_ui/list'
import { useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { CaminoAccessError } from './error'
import { User } from 'camino-common/src/roles'
import { Column, TableRow } from './_ui/table'
import { activitesDownloadFormats, activitesFiltresNames } from 'camino-common/src/filters'
import { ApiClient, apiClient } from '@/api/api-client'
import { UiGraphqlActivite } from './activite/activite-api-client'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { capitalize } from 'camino-common/src/strings'
import { entreprisesKey, userKey } from '@/moi'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { CaminoRouteLocation } from '@/router/routes'
import { CaminoRouter } from '@/typings/vue-router'
import { ActiviteStatut } from './_common/activite-statut'

export const activitesColonneIdAnnee = 'annee'

const activitesColonnes = [
  {
    id: 'titre',
    name: 'Titre',
  },
  {
    id: 'titulaires',
    name: 'Titulaires',
    noSort: true,
  },
  {
    id: activitesColonneIdAnnee,
    name: 'Année',
  },
  {
    id: 'periode',
    name: 'Période',
  },
  {
    id: 'activite_type',
    name: 'Type de rapport',
    noSort: true,
  },
  {
    id: 'statut',
    name: 'Statut',
  },
] as const satisfies readonly Column[]

const activitesLignesBuild = (activites: UiGraphqlActivite[], entreprises: Entreprise[]): TableRow[] => {
  const entreprisesIndex = entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom

    return acc
  }, {})

  return activites.map(activite => {
    const activiteStatut = ActivitesStatuts[activite.activiteStatutId]
    const columns = {
      titre: { value: activite.titre.nom },
      titulaires: {
        component: markRaw(List),
        props: {
          elements: activite.titre.titulaireIds.map(id => entreprisesIndex[id]),
          mini: true,
        },
        class: 'mb--xs',
        value: activite.titre.titulaireIds.map(id => entreprisesIndex[id]).join(', '),
      },
      annee: { value: activite.annee },
      activite_type: { value: capitalize(ActivitesTypes[activite.typeId].nom) },
      periode: {
        value: getPeriode(ActivitesTypes[activite.typeId].frequenceId, activite.periodeId),
      },
      statut: {
        component: markRaw(ActiviteStatut),
        props: {
          activiteStatutId: activiteStatut.id,
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
}

interface Props {
  user: User
  currentRoute: CaminoRouteLocation
  updateUrlQuery: Pick<CaminoRouter, 'push'>
  apiClient: Pick<ApiClient, 'getActivites' | 'titresRechercherByNom' | 'getTitresByIds'>
  entreprises: Entreprise[]
}

export const PureActivites = defineComponent<Props>(props => {
  const getData = async (params: Params<string>) => {
    const activites = await props.apiClient.getActivites({ ordre: params.ordre, colonne: params.colonne, page: params.page, ...params.filtres })

    return { total: activites.total, values: activitesLignesBuild(activites.elements, props.entreprises) }
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
            entreprises: props.entreprises,
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
PureActivites.props = ['currentRoute', 'updateUrlQuery', 'apiClient', 'user', 'entreprises']

export const Activites = defineComponent(() => {
  const router = useRouter()
  const user = inject(userKey)
  const entreprises = inject(entreprisesKey, ref([]))

  return () => <PureActivites user={user} entreprises={entreprises.value} apiClient={apiClient} currentRoute={router.currentRoute.value} updateUrlQuery={router} />
})
