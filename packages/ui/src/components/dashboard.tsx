import { defineComponent } from 'vue'
import { PureEntrepriseDashboard } from '@/components/dashboard/pure-entreprise-dashboard'
import { PureONFDashboard } from '@/components/dashboard/pure-onf-dashboard'
import { PurePTMGDashboard } from '@/components/dashboard/pure-ptmg-dashboard'
import { PureDrealDashboard } from '@/components/dashboard/pure-dreal-dashboard'

import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { dashboardApiClient } from './dashboard/dashboard-api-client'

export const Dashboard = defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()

    const user = store.state.user.element

    const hasEntreprises: boolean = store.getters['user/hasEntreprises']

    const isONF: boolean = store.getters['user/isONF']
    const isPTMG: boolean = store.getters['user/isPTMG']
    const isDREAL: boolean = store.getters['user/isDREAL']
    const isDGTM: boolean = store.getters['user/isDGTM']
    const entreprises = store.getters['user/user']?.entreprises ?? []
    if (!isONF && !isPTMG && !isDREAL && !isDGTM) {
      store.commit('titres/reset')
      store.dispatch('titres/init')
      router.replace({ name: 'titres' })
    }

    let dashboard = <div>Loading</div>
    if (hasEntreprises) {
      dashboard = <PureEntrepriseDashboard apiClient={dashboardApiClient} user={user} entreprises={entreprises} displayActivites={canReadActivites(user)} />
    } else if (isONF) {
      dashboard = <PureONFDashboard apiClient={dashboardApiClient} />
    } else if (isPTMG) {
      dashboard = <PurePTMGDashboard apiClient={dashboardApiClient} />
    } else if (isDREAL || isDGTM) {
      dashboard = <PureDrealDashboard apiClient={dashboardApiClient} isDGTM={isDGTM} />
    }
    return () => <dashboard />
  },
})
