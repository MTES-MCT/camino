import { defineComponent } from 'vue'
import { PureEntrepriseDashboard } from '@/components/dashboard/pure-entreprise-dashboard'
import { PureONFDashboard } from '@/components/dashboard/pure-onf-dashboard'
import { PurePTMGDashboard } from '@/components/dashboard/pure-ptmg-dashboard'
import { PureDrealDashboard } from '@/components/dashboard/pure-dreal-dashboard'
import { fetchWithJson } from '@/api/client-rest'
import { CommonTitreDREAL, CommonTitreONF, CommonTitrePTMG } from 'camino-common/src/titres'

import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { titres } from '@/api/titres'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { EntrepriseId } from 'camino-common/src/entreprise'

const getOnfTitres = async (): Promise<CommonTitreONF[]> => fetchWithJson(CaminoRestRoutes.titresONF, {})
const getPtmgTitres = async (): Promise<CommonTitrePTMG[]> => fetchWithJson(CaminoRestRoutes.titresPTMG, {})
const getDrealTitres = async (): Promise<CommonTitreDREAL[]> => fetchWithJson(CaminoRestRoutes.titresDREAL, {})
const getDgtmStats = async (): Promise<StatistiquesDGTM> => fetchWithJson(CaminoRestRoutes.statistiquesDGTM, {})

export const Dashboard = defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()

    const user = store.state.user.element

    const entreprisesIds: EntrepriseId[] = []
    const hasEntreprises: boolean = store.getters['user/hasEntreprises']

    const isONF: boolean = store.getters['user/isONF']
    const isPTMG: boolean = store.getters['user/isPTMG']
    const isDREAL: boolean = store.getters['user/isDREAL']
    const isDGTM: boolean = store.getters['user/isDGTM']
    const entreprises = store.getters['user/user']?.entreprises ?? []
    if (hasEntreprises) {
      // TODO 2022-03-17: type the store
      entreprisesIds.push(...entreprises.map((entreprise: { id: EntrepriseId }) => entreprise.id))
    } else if (!isONF && !isPTMG && !isDREAL && !isDGTM) {
      store.commit('titres/reset')
      store.dispatch('titres/init')
      router.replace({ name: 'titres' })
    }
    const getEntreprisesTitres = async () => {
      return (await titres({ entreprisesIds })).elements
    }

    let dashboard = <div>Loading</div>
    if (hasEntreprises) {
      dashboard = <PureEntrepriseDashboard getEntreprisesTitres={getEntreprisesTitres} user={user} entreprises={entreprises} displayActivites={canReadActivites(user)} />
    } else if (isONF) {
      dashboard = <PureONFDashboard getOnfTitres={getOnfTitres} />
    } else if (isPTMG) {
      dashboard = <PurePTMGDashboard getPtmgTitres={getPtmgTitres} />
    } else if (isDREAL || isDGTM) {
      dashboard = <PureDrealDashboard getDrealTitres={getDrealTitres} isDGTM={isDGTM} getDgtmStats={getDgtmStats} />
    }
    return () => <dashboard />
  },
})
