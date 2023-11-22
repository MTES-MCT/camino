import '@gouvfr/dsfr/dist/core/core.module'
import '@gouvfr/dsfr/dist/component/navigation/navigation.module'
import '@gouvfr/dsfr/dist/component/tab/tab.module'

import { defineComponent, Transition, computed, inject } from 'vue'
import { Messages } from './components/_ui/messages'
import { Header } from './components/page/header'
import { Footer } from './components/page/footer'
import { MapPattern } from './components/_map/pattern'
import { IconSprite } from './components/_ui/iconSprite'

import { CaminoError } from './components/error'
import { useStore } from 'vuex'
import { RouterView, useRoute } from 'vue-router'
import { TrackEventFunction } from '@/utils/matomo'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
export const App = defineComponent({
  setup: () => {
    const store = useStore()
    const matomo = inject<{ trackEvent: TrackEventFunction } | null>('matomo', null)
    const route = useRoute()

    const user = computed(() => store.state.user.element)

    const loaded = computed<boolean>(() => store.state.user.loaded)

    const error = computed(() => store.state.error)

    const messages = computed<{ type: 'error' | 'success'; value: string }[]>(() => store.state.messages)

    const popup = computed(() => store.state.popup)

    const loading = computed(() => store.state.loading.length > 0)

    const fileLoading = computed(() => store.state.fileLoading)

    const currentMenuSection = computed(() => route.meta?.menuSection)

    if (matomo) {
      // @ts-ignore
      matomo.customVariableVisitUser(user)
      // @ts-ignore
      matomo.trackPageView()
    }

    // TODO 2023-03-16 typer l’instance matomo dans un .d.ts
    const trackEvent: TrackEventFunction = (segment, subSegment, event) => {
      if (matomo) {
        matomo.trackEvent(segment, subSegment, event)
      }
    }

    return () => (
      <div class="page relative">
        <MapPattern />
        <IconSprite />

        <Header user={user.value} currentMenuSection={currentMenuSection.value} trackEvent={trackEvent} routePath={route.fullPath} />

        <main class="main" role="main">
          <div class="container">{isNotNullNorUndefined(error.value) ? <CaminoError couleur={error.value.type} message={error.value.value} /> : <>{loaded.value ? <RouterView /> : null}</>}</div>
        </main>

        <Footer />

        <div class="messages">
          <Messages messages={messages.value} />
        </div>

        <Transition name="fade">{isNotNullNorUndefined(popup.value.component) ? <div class="absolute full bg-inverse-alpha" style="z-index: 600" /> : null}</Transition>

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
  },
})
