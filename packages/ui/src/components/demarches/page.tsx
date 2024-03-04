import { defineComponent, inject, markRaw } from 'vue'
import { Liste, Params } from '../_common/liste'
import { Column, TableRow } from '../_ui/table'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { GetDemarchesDemarche } from '../titre/demarche-api-client'
import { CaminoFiltre, demarchesDownloadFormats } from 'camino-common/src/filters'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { Nom } from '../_common/nom'
import { Domaine as CaminoDomaine } from '../_common/domaine'
import { Statut } from '../_common/statut'
import { DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { TitreStatut } from '../_common/titre-statut'
import { List } from '../_ui/list'
import { ReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { ApiClient, apiClient } from '@/api/api-client'
import { Entreprise } from 'camino-common/src/entreprise'
import { entreprisesKey } from '@/moi'

const demarchesColonnes = [
  { id: 'titreNom', name: 'Titre' },
  { id: 'titreDomaine', name: '' },
  { id: 'titreType', name: 'Type de titre' },
  { id: 'titreStatut', name: 'Statut de titre' },
  { id: 'type', name: 'Type' },
  { id: 'statut', name: 'Statut' },
  { id: 'references', name: 'Références', noSort: true },
] as const satisfies readonly Column[]

type Props = Pick<PureProps, 'travaux' | 'filtres'>

interface PureProps {
  travaux: boolean
  filtres: readonly CaminoFiltre[]
  currentRoute: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  apiClient: Pick<ApiClient, 'getDemarches' | 'titresRechercherByNom' | 'getTitresByIds'>
  entreprises: Entreprise[]
}

const demarchesLignesBuild = (demarches: GetDemarchesDemarche[]): TableRow[] =>
  demarches.map(demarche => {
    const domaineId = getDomaineId(demarche.titre.typeId)
    const titreTypeType = TitresTypesTypes[getTitreTypeType(demarche.titre.typeId)]
    const demarcheType = DemarchesTypes[demarche.typeId]
    const columns = {
      titreNom: { value: demarche.titre.nom },
      titreDomaine: {
        component: markRaw(CaminoDomaine),
        props: { domaineId },
        value: domaineId,
      },
      titreType: {
        component: markRaw(Nom),
        props: { nom: titreTypeType.nom },
        value: titreTypeType.nom,
      },
      titreStatut: {
        component: markRaw(TitreStatut),
        props: {
          titreStatutId: demarche.titre.titreStatutId,
        },
        value: demarche.titre.titreStatutId,
      },
      type: {
        component: markRaw(Nom),
        props: { nom: demarcheType.nom },
        value: demarcheType.nom,
      },
      statut: {
        component: markRaw(Statut),
        props: {
          color: DemarchesStatuts[demarche.statutId].couleur,
          nom: DemarchesStatuts[demarche.statutId].nom,
        },
        value: DemarchesStatuts[demarche.statutId].nom,
      },
      references: {
        component: markRaw(List),
        props: {
          elements: demarche.titre.references.map(ref => `${ReferencesTypes[ref.referenceTypeId].nom} : ${ref.nom}`),
          mini: true,
        },
        value: demarche.titre.references.map(ref => `${ReferencesTypes[ref.referenceTypeId].nom} : ${ref.nom}`),
      },
    }

    return {
      id: demarche.id,
      link: { name: 'titre', params: { id: demarche.titre.slug }, query: { demarcheSlug: demarche.slug } },
      columns,
    }
  })

export const PurePage = defineComponent<PureProps>(props => {
  const getData = async (params: Params<string>) => {
    const demarches = await props.apiClient.getDemarches({
      travaux: props.travaux,
      page: params.page,
      colonne: params.colonne,
      ordre: params.ordre,
      ...params.filtres,
    })

    return { total: demarches.total, values: demarchesLignesBuild(demarches.elements) }
  }

  return () => (
    <Liste
      nom={props.travaux ? 'Travaux' : 'Démarches'}
      colonnes={demarchesColonnes}
      download={{
        id: `download${props.travaux ? 'Travaux' : 'Démarches'}`,
        downloadRoute: props.travaux ? '/travaux' : '/demarches',
        formats: demarchesDownloadFormats,
        params: {},
      }}
      renderButton={null}
      listeFiltre={{
        filtres: props.filtres,
        apiClient: props.apiClient,
        updateUrlQuery: props.updateUrlQuery,
        entreprises: props.entreprises,
      }}
      route={props.currentRoute}
      getData={getData}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PurePage.props = ['currentRoute', 'updateUrlQuery', 'apiClient', 'travaux', 'filtres', 'entreprises']

export const Page = defineComponent<Props>(props => {
  const router = useRouter()
  const entreprises = inject(entreprisesKey, [])

  return () => <PurePage filtres={props.filtres} entreprises={entreprises} travaux={props.travaux} apiClient={apiClient} currentRoute={router.currentRoute.value} updateUrlQuery={router} />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Page.props = ['travaux', 'filtres']
