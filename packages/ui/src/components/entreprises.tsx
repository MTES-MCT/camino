import { computed, defineComponent, onMounted, ref } from 'vue'
import { Liste } from './_common/liste'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { canCreateEntreprise } from 'camino-common/src/permissions/utilisateurs'
import { User } from 'camino-common/src/roles'
import { useStore } from 'vuex'
import { EntrepriseAddPopup } from './entreprise/add-popup'
import { EntrepriseApiClient, GetEntreprisesEntreprise, GetEntreprisesParams, entrepriseApiClient } from './entreprise/entreprise-api-client'
import { Siren } from 'camino-common/src/entreprise'
import { DsfrButtonIcon } from './_ui/dsfr-button'
import { AsyncData } from '@/api/client-rest'
import { getInitialFiltres } from './_ui/filters/filters'
import { getInitialParams } from './_ui/table-pagination'
import { ApiClient, apiClient } from '../api/api-client'

const entreprisesColonnes = [
  {
    id: 'nom',
    name: 'Nom',
  },
  {
    id: 'siren',
    name: 'Siren',
  },
] as const

const filtres = ['nomsEntreprise'] as const
const entreprisesLignesBuild = (entreprises: GetEntreprisesEntreprise[]) =>
  entreprises.map(entreprise => {
    const columns = {
      nom: { value: entreprise.nom },
      siren: {
        value: entreprise.legalEtranger || entreprise.legalSiren || '–',
      },
    }

    return {
      id: entreprise.id,
      link: { name: 'entreprise', params: { id: entreprise.id } },
      columns,
    }
  })

interface Props {
  currentRoute: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  apiClient: Pick<ApiClient, 'creerEntreprise' | 'getEntreprises' | 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
  user: User
}
export const PureEntreprises = defineComponent<Props>(props => {
  const popupVisible = ref(false)
  const addPopupOpen = () => {
    popupVisible.value = true
  }
  const close = () => {
    popupVisible.value = !popupVisible.value
  }

  const data = ref<AsyncData<true>>({ status: 'LOADING' })

  const params = ref<GetEntreprisesParams>({
    ...getInitialParams(props.currentRoute, entreprisesColonnes),
    ...getInitialFiltres(props.currentRoute, filtres),
  })
  const entreprises = ref<ReturnType<typeof entreprisesLignesBuild>>([])
  const total = ref<number>(0)
  const loadEntreprises = async () => {
    data.value = { status: 'LOADING' }
    try {
      const values = await props.apiClient.getEntreprises(params.value)
      entreprises.value = entreprisesLignesBuild(values.elements)
      total.value = values.total
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
    await loadEntreprises()
  })

  return () => (
    <Liste
      nom="entreprises"
      colonnes={entreprisesColonnes}
      download={{ id: 'entreprisesDownload', downloadRoute: '/entreprises', formats: ['csv', 'xlsx', 'ods'], params: {} }}
      lignes={entreprises.value}
      listeFiltre={{
        filtres,
        apiClient: props.apiClient,
        updateUrlQuery: props.updateUrlQuery,
      }}
      total={total.value}
      route={props.currentRoute}
      renderButton={() => {
        if (canCreateEntreprise(props.user)) {
          return (
            <>
              <DsfrButtonIcon class="fr-ml-1w" icon="fr-icon-add-line" buttonType="secondary" title="Ajouter une entreprise" label="Ajouter une entreprise" onClick={addPopupOpen} />
              {popupVisible.value ? <EntrepriseAddPopup close={close} user={props.user} apiClient={props.apiClient} /> : null}
            </>
          )
        } else {
          return <span></span>
        }
      }}
      paramsUpdate={async newParams => {
        params.value = { ordre: newParams.ordre, colonne: newParams.colonne, page: newParams.page, nomsEntreprise: newParams.filtres?.nomsEntreprise ?? '' }
        await loadEntreprises()
      }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureEntreprises.props = ['currentRoute', 'updateUrlQuery', 'apiClient', 'user']

export const Entreprises = defineComponent(() => {
  const router = useRouter()
  const store = useStore()
  const user = computed<User>(() => store.state.user.element)

  const customApiClient = () => {
    return {
      ...apiClient,
      creerEntreprise: async (siren: Siren) => {
        try {
          await entrepriseApiClient.creerEntreprise(siren)
          store.dispatch('messageAdd', { value: `l'entreprise a été créée`, type: 'success' }, { root: true })
          router.push({ name: 'entreprise', params: { id: `fr-${siren}` } })
        } catch (e) {
          store.dispatch('messageAdd', { value: `erreur lors de la création de l'entreprise`, type: 'error' }, { root: true })
        }
      },
    }
  }
  return () => <PureEntreprises currentRoute={router.currentRoute.value} updateUrlQuery={router} user={user.value} apiClient={customApiClient()} />
})
