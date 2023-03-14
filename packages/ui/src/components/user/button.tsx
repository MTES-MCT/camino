import { UserNotNull } from 'camino-common/src/roles'
import { computed, defineComponent, FunctionalComponent, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export const Button = defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()
    const matomo = inject('matomo', null)

    const user = computed(() => {
      return store.state.user.element
    })
    const menuActive = computed(() => {
      return (store.state.menu?.component?.name ?? '') === 'UserMenu'
    })

    const popupOpen = () => {
      window.location.replace('/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href))
    }
    const goToUser = () => {
      if (matomo) {
        // @ts-ignore
        matomo.trackEvent('menu', 'bouton', 'utilisateur')
      }
      router.push({ name: 'utilisateur', params: { id: user.value.id } })
    }

    return () => <PureButton menuActive={menuActive.value} user={user.value} onConnectionClicked={popupOpen} onUserClicked={goToUser} />
  },
})

interface Props {
  user?: Pick<UserNotNull, 'nom' | 'prenom'> | null | undefined
  menuActive: boolean
  onConnectionClicked: () => void
  onUserClicked: () => void
}
export const PureButton: FunctionalComponent<Props> = props => {
  return (
    <div class={`flex ${props.menuActive ? 'active' : ''}`}>
      {props.user ? (
        <button id="cmn-user-button-menu" class="btn-menu text-decoration-none bold p-0" aria-label="profil utilisateur" onClick={props.onUserClicked}>
          {props.user.prenom || '–'} {props.user.nom || '–'}
        </button>
      ) : (
        <button id="cmn-user-button-connexion" class="btn btn-primary small lh-2" onClick={props.onConnectionClicked}>
          Connexion
        </button>
      )}
    </div>
  )
}
