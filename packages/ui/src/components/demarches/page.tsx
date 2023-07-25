import { defineComponent, markRaw, onMounted, ref } from 'vue'
import { Liste, Params } from '../_common/liste'
import { Column, TableRow } from '../_ui/table'
import { useRouter } from 'vue-router'
import { AsyncData } from '@/api/client-rest'
import { GetDemarchesDemarche, GetDemarchesParams, demarcheApiClient } from '../titre/demarche-api-client'
import { utilisateurApiClient } from '../utilisateur/utilisateur-api-client'
import { getInitialParams } from '../_ui/table-pagination'
import { getInitialFiltres } from '../_ui/filters/filters'
import { CaminoFiltres } from '../_ui/filters/camino-filtres'
import { LoadingElement } from '../_ui/functional-loader'
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

const demarchesColonnes = [
  { id: 'titreNom', name: 'Titre' },
  { id: 'titreDomaine', name: '' },
  { id: 'titreType', name: 'Type de titre' },
  { id: 'titreStatut', name: 'Statut de titre' },
  { id: 'type', name: 'Type' },
  { id: 'statut', name: 'Statut' },
  { id: 'references', name: 'Références', noSort: true },
] as const satisfies readonly Column[]

const filtres = [
  'titresIds',
  'domainesIds',
  'typesIds',
  'statutsIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'titresTerritoires',
  'demarchesTypesIds',
  'demarchesStatutsIds',
  'etapesInclues',
  'etapesExclues',
] as const satisfies readonly CaminoFiltres[]
interface Props {
  travaux: boolean
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
      link: { name: 'titre', params: { id: demarche.titre.slug } },
      columns,
    }
  })

// FIXME tests
export const Page = defineComponent<Props>(props => {
  const router = useRouter()

  const data = ref<AsyncData<true>>({ status: 'LOADING' })
  const meta = ref<AsyncData<unknown>>({ status: 'LOADING' })
  const load = async (params: GetDemarchesParams) => {
    data.value = { status: 'LOADING' }

    try {
      const demarches = await demarcheApiClient.getDemarches(params)
      demarchesRef.value.elements.splice(0, demarchesRef.value.elements.length, ...demarches.elements)
      demarchesRef.value.total = demarches.total
      data.value = { status: 'LOADED', value: true }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }

  const demarchesRef = ref<{ elements: GetDemarchesDemarche[]; total: number }>({ elements: [], total: 0 })
  const onParamsUpdate = (params: Params<string>) => {
    load({
      travaux: props.travaux,
      page: params.page,
      colonne: params.colonne,
      ordre: params.ordre,
      ...params.filtres,
    })
  }
  onMounted(async () => {
    try {
      const entreprises = await utilisateurApiClient.getEntreprises()
      meta.value = { status: 'LOADED', value: { entreprises } }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
    await load({ travaux: props.travaux, ...getInitialParams(router.currentRoute.value, demarchesColonnes), ...getInitialFiltres(router.currentRoute.value, filtres) })
  })

  return () => (
    <LoadingElement
      data={meta.value}
      renderItem={metas => (
        <Liste
          nom={props.travaux ? 'Travaux' : 'Démarches'}
          colonnes={demarchesColonnes}
          download={{
            downloadRoute: '/demarches',
            formats: ['csv', 'xlsx', 'ods'],
            params: {},
          }}
          renderButton={null}
          listeFiltre={{
            filtres,
            initialized: true,
            metas,
            updateUrlQuery: router,
          }}
          route={router.currentRoute.value}
          paramsUpdate={onParamsUpdate}
          total={demarchesRef.value.total}
          lignes={demarchesLignesBuild(demarchesRef.value.elements)}
        />
      )}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Page.props = ['travaux']
