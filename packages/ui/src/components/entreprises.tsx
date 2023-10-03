import { computed, defineComponent, onMounted, ref } from 'vue'
import { Liste, Params } from './_common/liste'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { canCreateEntreprise } from 'camino-common/src/permissions/utilisateurs'
import { User } from 'camino-common/src/roles'
import { useStore } from 'vuex'
import { EntrepriseAddPopup } from './entreprise/add-popup'
import { GetEntreprisesEntreprise, entrepriseApiClient } from './entreprise/entreprise-api-client'
import { Siren } from 'camino-common/src/entreprise'
import { DsfrButtonIcon } from './_ui/dsfr-button'
import { ApiClient, apiClient } from '../api/api-client'
import { entreprisesDownloadFormats, entreprisesFiltresNames } from 'camino-common/src/filters'
import { Column } from './_ui/table'

const entreprisesColonnes = [
  {
    id: 'nom',
    name: 'Nom',
  },
  {
    id: 'siren',
    name: 'Siren',
  },
] as const satisfies readonly Column[]

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

  const getData = async (params: Params<string>) => {
    const values = await props.apiClient.getEntreprises({ ordre: params.ordre, colonne: params.colonne, page: params.page, nomsEntreprise: params.filtres?.nomsEntreprise ?? '' })
    const entreprises = entreprisesLignesBuild(values.elements)

    return { total: values.total, values: entreprises }
  }

  return () => (
    <Liste
      nom="entreprises"
      colonnes={entreprisesColonnes}
      download={{ id: 'entreprisesDownload', downloadRoute: '/entreprises', formats: entreprisesDownloadFormats, params: {} }}
      getData={getData}
      listeFiltre={{
        filtres: entreprisesFiltresNames,
        apiClient: props.apiClient,
        updateUrlQuery: props.updateUrlQuery,
      }}
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
