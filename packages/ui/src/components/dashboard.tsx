import { FunctionalComponent, defineAsyncComponent, defineComponent, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { dashboardApiClient } from './dashboard/dashboard-api-client'
import { User, isAdministration, isEntrepriseOrBureauDEtude } from 'camino-common/src/roles'
import { entreprisesKey, userKey } from '@/moi'
import { Entreprise } from 'camino-common/src/entreprise'

export const Dashboard = defineComponent({
  setup() {
    const router = useRouter()

    const user = inject(userKey)
    const entreprises = inject(entreprisesKey, ref([]))

    onMounted(async () => {
      if (!isEntrepriseOrBureauDEtude(user) && !isAdministration(user)) {
        router.replace({ name: 'titres' })
      }
    })

    return () => <PureDashboard user={user} entreprises={entreprises.value} />
  },
})

const PureDashboard: FunctionalComponent<{ user: User; entreprises: Entreprise[] }> = props => {
  if (isEntrepriseOrBureauDEtude(props.user)) {
    const PureEntrepriseDashboard = defineAsyncComponent(async () => {
      const { PureEntrepriseDashboard } = await import('@/components/dashboard/pure-entreprise-dashboard')

      return PureEntrepriseDashboard
    })
    const entreprises = props.user.entreprises ?? []

    return <PureEntrepriseDashboard apiClient={dashboardApiClient} user={props.user} entreprises={entreprises} displayActivites={canReadActivites(props.user)} allEntreprises={props.entreprises} />
  } else if (isAdministration(props.user)) {
    const PureAdministrationDashboard = defineAsyncComponent(async () => {
      const { PureAdministrationDashboard } = await import('@/components/dashboard/pure-administration-dashboard')

      return PureAdministrationDashboard
    })

    return <PureAdministrationDashboard apiClient={dashboardApiClient} user={props.user} entreprises={props.entreprises} />
  }

  return null
}
