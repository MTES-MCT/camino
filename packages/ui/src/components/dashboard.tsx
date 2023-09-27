import { defineComponent } from 'vue'
import { PureEntrepriseDashboard } from '@/components/dashboard/pure-entreprise-dashboard'
import { PureONFDashboard } from '@/components/dashboard/pure-onf-dashboard'
import { PureAdministrationDashboard } from '@/components/dashboard/pure-administration-dashboard'

import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { dashboardApiClient } from './dashboard/dashboard-api-client'
import { User, isAdministration, isEntreprise } from 'camino-common/src/roles'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'

export const Dashboard = defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()

    const user: User = store.state.user.element

    if (!isEntreprise(user) && !isAdministration(user)) {
      router.replace({ name: 'titres' })
    } else {
      let dashboard = <div>Loading</div>
      if (isEntreprise(user)) {
        const entreprises = store.getters['user/user']?.entreprises ?? []
        dashboard = <PureEntrepriseDashboard apiClient={dashboardApiClient} user={user} entreprises={entreprises} displayActivites={canReadActivites(user)} />
      } else if (user.administrationId === ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']) {
        dashboard = <PureONFDashboard apiClient={dashboardApiClient} />
      } else {
        dashboard = <PureAdministrationDashboard apiClient={dashboardApiClient} user={user} />
      }
      return () => <dashboard />
    }
    return () => null
  },
})
