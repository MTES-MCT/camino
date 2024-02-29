import { FunctionalComponent, defineAsyncComponent, defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { dashboardApiClient } from './dashboard/dashboard-api-client'
import { User, isAdministration, isEntreprise } from 'camino-common/src/roles'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userMemoized } from '@/moi'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from './_ui/functional-loader'

export const Dashboard = defineComponent({
  setup() {
    const router = useRouter()

    const user = ref<AsyncData<User>>({ status: 'LOADING' })

    onMounted(async () => {
      user.value = { status: 'LOADING' }

      user.value = { status: 'LOADED', value: await userMemoized() }

      if (!isEntreprise(user.value.value) && !isAdministration(user.value.value)) {
        router.replace({ name: 'titres' })
      }
    })

    return () => <LoadingElement data={user.value} renderItem={item => <PureDashboard user={item} />} />
  },
})

const PureDashboard: FunctionalComponent<{ user: User }> = props => {
  if (isEntreprise(props.user)) {
    const PureEntrepriseDashboard = defineAsyncComponent(async () => {
      const { PureEntrepriseDashboard } = await import('@/components/dashboard/pure-entreprise-dashboard')

      return PureEntrepriseDashboard
    })
    const entreprises = props.user.entreprises ?? []

    return <PureEntrepriseDashboard apiClient={dashboardApiClient} user={props.user} entreprises={entreprises} displayActivites={canReadActivites(props.user)} />
  } else if (isAdministration(props.user)) {
    if (props.user.administrationId === ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']) {
      const PureONFDashboard = defineAsyncComponent(async () => {
        const { PureONFDashboard } = await import('@/components/dashboard/pure-onf-dashboard')

        return PureONFDashboard
      })

      return <PureONFDashboard apiClient={dashboardApiClient} />
    } else {
      const PureAdministrationDashboard = defineAsyncComponent(async () => {
        const { PureAdministrationDashboard } = await import('@/components/dashboard/pure-administration-dashboard')

        return PureAdministrationDashboard
      })

      return <PureAdministrationDashboard apiClient={dashboardApiClient} user={props.user} />
    }
  }

  return null
}
