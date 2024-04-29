import '@gouvfr/dsfr/dist/core/core.module'
import '@gouvfr/dsfr/dist/component/navigation/navigation.module'
import '@gouvfr/dsfr/dist/component/tab/tab.module'

import { defineComponent, computed, ref, onMounted, inject } from 'vue'
import { Header } from './components/page/header'
import { Footer } from './components/page/footer'
import { MapPattern } from './components/_map/pattern'
import { IconSprite } from './components/_ui/iconSprite'

import { RouterView, useRoute } from 'vue-router'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { userKey } from './moi'
export const App = defineComponent(() => {
  const route = useRoute()

  const loaded = ref<boolean>(false)

  const currentMenuSection = computed(() => route.meta?.menuSection)

  const user = inject(userKey)

  onMounted(async () => {
    loaded.value = true
  })

  const version = computed(() => {
    /* global applicationVersion */
    // @ts-ignore
    return applicationVersion
  })

  const displayNewsletter = computed<boolean>(() => {
    return isNullOrUndefined(user)
  })

  return () => (
    <div class="page relative">
      <MapPattern />
      <IconSprite />

      <Header user={user} currentMenuSection={currentMenuSection.value} routePath={route.fullPath} />

      <main class="main" role="main">
        <div class="container">{loaded.value ? <RouterView /> : null}</div>
      </main>

      <Footer displayNewsletter={displayNewsletter.value} version={version.value} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
App.props = ['user']
