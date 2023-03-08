import { computed, defineComponent } from 'vue'
import UserButton from '../user/button.vue'
import { MenuButton } from '../menu/button'
import { QuickAccessTitre } from '@/components/page/quick-access-titre'
import { useStore } from 'vuex'
import styles from './header.module.css'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
interface Props {
  loaded?: boolean
}
export const Header = caminoDefineComponent<Props>(['loaded'], props => {
  const loaded = computed(() => {
    return props.loaded ?? false
  })

  const store = useStore()
  const apiError = computed(() => {
    return store.state.apiError
  })

  return () => (
    <div class={`mb ${styles['header-container']}`}>
      <div class="pt-m">
        <router-link to={{ name: 'homepage' }} class="flex text-decoration-none">
          <img src="/img/logo-rf.svg" alt="logo" class="logo mr" />
          <div>
            <p class="mb-0 mt-xs title">
              camino<span class="color-neutral">.beta.gouv.fr</span>
            </p>
            <p class="h6 mb-0 bold color-text">Le cadastre minier numérique ouvert</p>
          </div>
        </router-link>
      </div>

      <div class={`pt-m ${styles.search}`} style="align-self: center">
        <QuickAccessTitre />
      </div>

      <div class="pt-m flex">
        {!apiError.value && loaded.value ? (
          <div class="flex-right">
            <div class="mt-m tablet-mb-m flex">
              <div class="ml-xs flex">
                <UserButton />
              </div>
              <div class="ml-xs">
                <MenuButton />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
})
