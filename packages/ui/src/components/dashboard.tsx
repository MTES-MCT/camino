import { defineAsyncComponent, defineComponent, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { dashboardApiClient } from './dashboard/dashboard-api-client'
import { User, isAdministration, isEntreprise } from 'camino-common/src/roles'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userMemoized } from '@/moi'

export const Dashboard = defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()

    const user = ref<User>(null)

    onMounted(async () => {
      user.value = await userMemoized()
    })
    
    if (!isEntreprise(user.value) && !isAdministration(user.value)) {
      router.replace({ name: 'titres' })
    } else {
      let dashboard = <div>Loading</div>
      if (isEntreprise(user.value)) {
        const PureEntrepriseDashboard = defineAsyncComponent(async () => {
          const { PureEntrepriseDashboard } = await import('@/components/dashboard/pure-entreprise-dashboard')

          return PureEntrepriseDashboard
        })
        const entreprises = store.getters['user/user']?.entreprises ?? []
        dashboard = <PureEntrepriseDashboard apiClient={dashboardApiClient} user={user.value} entreprises={entreprises} displayActivites={canReadActivites(user.value)} />
      } else if (user.value.administrationId === ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']) {
        const PureONFDashboard = defineAsyncComponent(async () => {
          const { PureONFDashboard } = await import('@/components/dashboard/pure-onf-dashboard')

          return PureONFDashboard
        })
        dashboard = <PureONFDashboard apiClient={dashboardApiClient} />
      } else {
        const PureAdministrationDashboard = defineAsyncComponent(async () => {
          const { PureAdministrationDashboard } = await import('@/components/dashboard/pure-administration-dashboard')

          return PureAdministrationDashboard
        })
        dashboard = <PureAdministrationDashboard apiClient={dashboardApiClient} user={user.value} />
      }

      return () => <dashboard />
    }

    return () => null
  },
})
