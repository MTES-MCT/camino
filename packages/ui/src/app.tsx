import '@codegouvfr/react-dsfr/main.css'
import '@codegouvfr/react-dsfr/dsfr/core/core.module'
import '@codegouvfr/react-dsfr/dsfr/component/navigation/navigation.module'
import '@codegouvfr/react-dsfr/dsfr/component/table/table.module'

import { defineComponent, computed, ref, onMounted, inject } from 'vue'
import { Header } from './components/page/header'
import { Footer } from './components/page/footer'
import { MapPattern } from './components/_map/pattern'

import { RouterView, useRoute } from 'vue-router'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { userKey } from './moi'
export const App = defineComponent(() => {
  const route = useRoute()

  const loaded = ref<boolean>(false)

  const currentMenuSection = computed(() => route.meta.menuSection)
  const hasGutter = computed(() => isNullOrUndefinedOrEmpty(route.meta.filtres))

  const user = inject(userKey)

  onMounted(async () => {
    loaded.value = true
  })

  const version = computed(() => {
    /* global applicationVersion */
    // @ts-ignore
    return applicationVersion
  })

  return () => (
    <div>
      <MapPattern />

      <Header user={user} currentMenuSection={currentMenuSection.value} routePath={route.fullPath} />

      <main role="main">
        <div class={hasGutter.value ? ['fr-container', 'fr-py-3w'] : null}>{loaded.value ? <RouterView /> : null}</div>
      </main>

      <Footer version={version.value} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
App.props = ['user']
