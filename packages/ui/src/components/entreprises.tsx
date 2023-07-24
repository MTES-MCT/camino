import { computed, defineComponent, onMounted, ref } from 'vue'
import { Liste } from './_common/liste'
import { useRoute, useRouter } from 'vue-router'
import { canCreateEntreprise } from 'camino-common/src/permissions/utilisateurs'
import { User } from 'camino-common/src/roles'
import { useStore } from 'vuex'
import { Icon } from './_ui/icon'
import { EntrepriseAddPopup } from './entreprise/add-popup'
import { GetEntreprisesEntreprise, GetEntreprisesParams, entrepriseApiClient } from './entreprise/entreprise-api-client'
import { Siren } from 'camino-common/src/entreprise'
import { DsfrButtonIcon } from './_ui/dsfr-button'
import { AsyncData } from '@/api/client-rest'
import { getInitialFiltres } from './_ui/filters/filters'
import { getInitialParams } from './_ui/table-pagination'

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

interface Props {}
// FIXME add storybook/pureEntreprises
export const Entreprises = defineComponent<Props>(props => {
  const router = useRouter()
  const store = useStore()
  const user = computed<User>(() => store.state.user.element)

  const popupVisible = ref(false)
  const addPopupOpen = () => {
    popupVisible.value = true
  }
  const close = () => {
    popupVisible.value = !popupVisible.value
  }

  const data = ref<AsyncData<true>>({ status: 'LOADING' })

  const params = ref<GetEntreprisesParams>({
    ...getInitialParams(router.currentRoute.value, entreprisesColonnes),
    ...getInitialFiltres(router.currentRoute.value, filtres),
  })
  const entreprises = ref<ReturnType<typeof entreprisesLignesBuild>>([])
  const total = ref<number>(0)
  const loadEntreprises = async () => {
    data.value = { status: 'LOADING' }
    try {
      const values = await entrepriseApiClient.getEntreprises(params.value)
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
  const customApiClient = () => {
    return {
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

  return () => (
    <Liste
      nom="entreprises"
      colonnes={entreprisesColonnes}
      download={{ downloadRoute: '/entreprises', formats: ['csv', 'xlsx', 'ods'], params: {} }}
      lignes={entreprises.value}
      listeFiltre={{
        filtres,
        initialized: true,
        updateUrlQuery: router,
      }}
      total={total.value}
      route={router.currentRoute.value}
      renderButton={() => {
        if (canCreateEntreprise(user.value)) {
          return (
            <>
              <DsfrButtonIcon class="fr-ml-1w" icon="fr-icon-add-line" buttonType="secondary" title="Ajouter une entreprise" label="Ajouter une entreprise" onClick={addPopupOpen} />
              {popupVisible.value ? <EntrepriseAddPopup close={close} user={user.value} apiClient={customApiClient()} /> : null}
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
