import { FunctionalComponent, defineAsyncComponent, defineComponent, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { dashboardApiClient } from './dashboard/dashboard-api-client'
import { User, isAdministration, isEntreprise } from 'camino-common/src/roles'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userKey } from '@/moi'

export const Dashboard = defineComponent({
  setup() {
    const router = useRouter()

    const user = inject(userKey)

    onMounted(async () => {
      if (!isEntreprise(user) && !isAdministration(user)) {
        router.replace({ name: 'titres' })
      }
    })

    return () => <PureDashboard user={user} />
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
