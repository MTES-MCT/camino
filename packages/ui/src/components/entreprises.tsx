import { defineComponent, inject, ref } from 'vue'
import { Liste, Params } from './_common/liste'
import { RouteLocationNormalizedLoaded, Router, useRouter } from 'vue-router'
import { canCreateEntreprise } from 'camino-common/src/permissions/utilisateurs'
import { User } from 'camino-common/src/roles'
import { useStore } from 'vuex'
import { EntrepriseAddPopup } from './entreprise/add-popup'
import { entrepriseApiClient } from './entreprise/entreprise-api-client'
import { Entreprise, Siren } from 'camino-common/src/entreprise'
import { DsfrButtonIcon } from './_ui/dsfr-button'
import { ApiClient, apiClient } from '../api/api-client'
import { entreprisesDownloadFormats, entreprisesFiltresNames } from 'camino-common/src/filters'
import { Column, TableRow } from './_ui/table'
import { entreprisesKey, userKey } from '@/moi'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { getWithJson } from '@/api/client-rest'

const entreprisesColonnes = [
  {
    id: 'nom',
    name: 'Nom',
    noSort: true,
  },
  {
    id: 'siren',
    name: 'Siren',
    noSort: true,
  },
] as const satisfies readonly Column[]

type ColonneId = (typeof entreprisesColonnes)[number]['id']

interface Props {
  currentRoute: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  apiClient: Pick<ApiClient, 'creerEntreprise' | 'titresRechercherByNom' | 'getTitresByIds'>
  entreprises: Entreprise[]
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

  const getData = (options: Params<ColonneId>): Promise<{ total: number; values: TableRow<string>[] }> => {
    const lignes = [...props.entreprises]
      .filter(entreprise => {
        if (isNotNullNorUndefined(options.filtres) && isNotNullNorUndefined(options.filtres.nomsEntreprise) && options.filtres.nomsEntreprise !== '') {
          if (!entreprise.nom.toLowerCase().includes(options.filtres.nomsEntreprise) && !(entreprise.legal_siren ?? '').toLowerCase().includes(options.filtres.nomsEntreprise)) {
            return false
          }
        }

        return true
      })
      .map(entreprise => {
        const columns = {
          nom: { value: entreprise.nom },
          siren: {
            value: entreprise.legal_siren ?? '–',
          },
        }

        return {
          id: entreprise.id,
          link: { name: 'entreprise', params: { id: entreprise.id } },
          columns,
        }
      })

    return Promise.resolve({ total: lignes.length, values: lignes })
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
        entreprises: props.entreprises,
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
PureEntreprises.props = ['currentRoute', 'updateUrlQuery', 'apiClient', 'user', 'entreprises']

export const Entreprises = defineComponent(() => {
  const router = useRouter()
  const store = useStore()
  const user = inject(userKey)
  const entreprises = inject(entreprisesKey, ref([]))

  const customApiClient = () => {
    return {
      ...apiClient,
      creerEntreprise: async (siren: Siren) => {
        try {
          await entrepriseApiClient.creerEntreprise(siren)
          const newEntreprises = await getWithJson('/rest/entreprises', {})
          entreprises.value = newEntreprises

          store.dispatch('messageAdd', { value: `l'entreprise a été créée`, type: 'success' }, { root: true })
          router.push({ name: 'entreprise', params: { id: `fr-${siren}` } })
        } catch (e) {
          store.dispatch('messageAdd', { value: `erreur lors de la création de l'entreprise`, type: 'error' }, { root: true })
        }
      },
    }
  }

  return () => <PureEntreprises entreprises={entreprises.value} currentRoute={router.currentRoute.value} updateUrlQuery={router} user={user} apiClient={customApiClient()} />
})
