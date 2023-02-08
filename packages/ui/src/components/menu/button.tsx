import { computed, defineComponent, inject } from 'vue'
import { MainMenu } from './menu'
import { Icon } from '@/components/_ui/icon'
import { useStore } from 'vuex'

export const MenuButton = defineComponent({
  setup() {
    const store = useStore()
    const matomo = inject('matomo', null)
    const menu = computed(() => store.state.menu)
    const eventTrack = () => {
      if (matomo) {
        // @ts-ignore
        matomo.trackEvent('menu', 'bouton', 'sections')
      }
    }
    const menuToggle = () => {
      eventTrack()
      store.dispatch('menuToggle', MainMenu)
    }

    return () => (
      <div
        class={`${
          menu.value.component && menu.value.component.name === 'MainMenu'
            ? 'active'
            : ''
        }`}
      >
        <button
          id="cmn-menu-button-button-menu"
          class="btn-border small pill p-s"
          onClick={() => menuToggle()}
        >
          <Icon size="M" name="menu" />
        </button>
      </div>
    )
  }
})
