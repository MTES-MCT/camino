import '@gouvfr/dsfr/dist/core/core.module'
import '@gouvfr/dsfr/dist/component/navigation/navigation.module'
import '@gouvfr/dsfr/dist/component/tab/tab.module'

import { defineComponent, Transition, computed, inject, ref, onMounted } from 'vue'
import { Messages } from './components/_ui/messages'
import { Header } from './components/page/header'
import { Footer } from './components/page/footer'
import { MapPattern } from './components/_map/pattern'
import { IconSprite } from './components/_ui/iconSprite'

import { CaminoError } from './components/error'
import { useStore } from 'vuex'
import { RouterView, useRoute } from 'vue-router'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { userMemoized } from './moi'
import { User } from 'camino-common/src/roles'
export const App = defineComponent(() => {
    const store = useStore()
    const route = useRoute()
    
    const user = ref<User>(null)
    const loaded = ref<boolean>(false)

    const error = computed(() => store.state.error)

    const messages = computed<{ type: 'error' | 'success'; value: string }[]>(() => store.state.messages)

    const popup = computed(() => store.state.popup)

    const loading = computed(() => store.state.loading.length > 0)

    const fileLoading = computed(() => store.state.fileLoading)

    const currentMenuSection = computed(() => route.meta?.menuSection)

    onMounted(async () => {
      console.log("mounted")
      user.value = await userMemoized()
      loaded.value = true
    })

    // FIXME péter tout les getter dans user, remplacer les appels dans les .vue
    const version = computed(() => {
      /* global applicationVersion */
      // @ts-ignore
      return applicationVersion
    })

    const displayNewsletter = computed<boolean>(() => {
      return isNullOrUndefined(user.value)
    })

    return () => (
      <div class="page relative">
        <MapPattern />
        <IconSprite />

        <Header user={user.value} currentMenuSection={currentMenuSection.value} routePath={route.fullPath} />

        <main class="main" role="main">
          <div class="container">{isNotNullNorUndefined(error.value) ? <CaminoError couleur={error.value.type} message={error.value.value} /> : <>{loaded.value ? <RouterView /> : null}</>}</div>
        </main>

        <Footer displayNewsletter={displayNewsletter.value} version={version.value} />

        <div class="messages">
          <Messages messages={messages.value} />
        </div>

        <Transition name="fade">{isNotNullNorUndefined(popup.value.component) ? <div class="absolute full bg-inverse-alpha" style="z-index: 100002" /> : null}</Transition>

        <Transition name="slide-top">{isNotNullNorUndefined(popup.value.component) ? <popup.value.component {...popup.value.props} /> : null}</Transition>

        <Transition name="fade">
          {loading.value || (isNotNullNorUndefined(fileLoading.value) && isNotNullNorUndefined(fileLoading.value.total) && fileLoading.value.total !== 0) ? (
            <div class="loaders fixed p">
              {loading.value ? <div class="loader" /> : null}
              {isNotNullNorUndefined(fileLoading.value) && isNotNullNorUndefined(fileLoading.value.total) && fileLoading.value.total !== 0 ? (
                <div>
                  <div class="relative loader-file">
                    <div
                      class="loader-file-bar"
                      style={{
                        right: `${100 - 100 * (fileLoading.value.loaded / fileLoading.value.total)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Transition>
      </div>
    )
})
