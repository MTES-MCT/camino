import { defineComponent, computed, inject } from 'vue'
import { useStore } from 'vuex'
import { canReadMetas } from 'camino-common/src/permissions/metas'
import { canReadJournaux } from 'camino-common/src/permissions/journaux'
import { canReadAdministrations } from 'camino-common/src/permissions/administrations'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { canReadTravaux } from 'camino-common/src/permissions/travaux'
import { User } from 'camino-common/src/roles.js'

export const MainMenu = defineComponent({
  setup() {
    const store = useStore()
    const matomo = inject('matomo', null)

    const user = computed<User>(() => store.state.user.element)
    const hasEntreprises = computed<boolean>(() => store.getters['user/hasEntreprises'])
    const isONF = computed<boolean>(() => store.getters['user/isONF'])
    const isPTMG = computed<boolean>(() => store.getters['user/isPTMG'])
    const isDREAL = computed<boolean>(() => store.getters['user/isDREAL'])

    const dashboardLabel = computed<string | null>(() => {
      if (hasEntreprises.value) {
        return 'Mes titres'
      }
      if (isONF.value) {
        return 'Tableau de bord ONF'
      }
      if (isPTMG.value) {
        return 'Tableau de bord PTMG'
      }
      if (isDREAL.value) {
        return 'Tableau de bord'
      }
      return null
    })

    const eventTrack = (id: string) => {
      if (matomo) {
        // @ts-ignore
        matomo.trackEvent('menu-sections', 'menu-section', id)
      }
    }
    return () => (
      <div class="bg-alt">
        <div class="container pt">
          <div class="tablet-blobs mb flex-align-items-stretch">
            <div class="tablet-blob-1-4 border-l pl-s">
              <ul class="list-sans mb-0">
                {dashboardLabel.value ? (
                  <li>
                    <router-link id="cmn-menu-menu-a-dashboard" to={{ name: 'dashboard' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('dashboard')}>
                      {dashboardLabel.value}
                    </router-link>
                  </li>
                ) : null}

                <li>
                  <router-link id="cmn-menu-menu-a-titres" to={{ name: 'titres' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('titres')}>
                    Titres miniers et autorisations
                  </router-link>
                </li>
                <li>
                  <router-link id="cmn-menu-menu-a-demarches" to={{ name: 'demarches' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('demarches')}>
                    Démarches
                  </router-link>
                </li>
                {canReadTravaux(user.value) ? (
                  <li>
                    <router-link id="cmn-menu-menu-a-travaux" to={{ name: 'travaux' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('travaux')}>
                      Travaux
                    </router-link>
                  </li>
                ) : null}
              </ul>
            </div>
            {canReadActivites(user.value) ? (
              <div class="tablet-blob-1-4 border-l pl-s">
                <ul class="list-sans mb-0">
                  <li>
                    <router-link id="cmn-menu-menu-a-activites" to={{ name: 'activites' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('activites')}>
                      Activités
                    </router-link>
                  </li>
                </ul>
              </div>
            ) : null}

            <div class="tablet-blob-1-4 border-l pl-s">
              <ul class="list-sans mb-0">
                {canReadAdministrations(user.value) ? (
                  <li>
                    <router-link id="cmn-menu-menu-a-administrations" to={{ name: 'administrations' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('administrations')}>
                      Administrations
                    </router-link>
                  </li>
                ) : null}
                <li>
                  <router-link id="cmn-menu-menu-a-entreprises" to={{ name: 'entreprises' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('entreprises')}>
                    Entreprises
                  </router-link>
                </li>
                {canReadUtilisateurs(user.value) ? (
                  <li>
                    <router-link id="cmn-menu-menu-a-utilisateurs" to={{ name: 'utilisateurs' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('utilisateurs')}>
                      Utilisateurs
                    </router-link>
                  </li>
                ) : null}
              </ul>
            </div>
            <div class="tablet-blob-1-4 border-l pl-s">
              <ul class="list-sans mb-0">
                {canReadMetas(user.value) ? (
                  <li>
                    <router-link id="cmn-menu-menu-a-metas" to={{ name: 'metas' }} class="btn-menu text-decoration-none bold" onClick={() => eventTrack('metas')}>
                      Métas
                    </router-link>
                  </li>
                ) : null}

                {canReadJournaux(user.value) ? (
                  <li>
                    <router-link id="cmn-menu-menu-a-journaux" to={{ name: 'journaux' }} class="btn-menu text-decoration-none bold">
                      Journaux
                    </router-link>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
})
