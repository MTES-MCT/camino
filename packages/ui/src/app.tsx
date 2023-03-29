import '@gouvfr/dsfr/dist/core/core.module'
import '@gouvfr/dsfr/dist/component/navigation/navigation.module'
import '@gouvfr/dsfr/dist/component/modal/modal.module'
import '@gouvfr/dsfr/dist/component/header/header.module'
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
export const App = defineComponent({
  setup: () => {
    const store = useStore()
    const matomo = inject('matomo', null)
    const route = useRoute()

    const user = computed(() => store.state.user.element)

    const loaded = computed<boolean>(() => store.state.user.loaded)

    const error = computed(() => store.state.error)

    const messages = computed(() => store.state.messages)

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
        // @ts-ignore
        matomo.trackEvent(segment, subSegment, event)
      }
    }
    return () => (
      <div class="page relative">
        <MapPattern />
        <IconSprite />

        <Header user={user.value} currentMenuSection={currentMenuSection.value} trackEvent={trackEvent} />

        <main class="main">
          <div class="container">{error.value ? <CaminoError couleur={error.value.type} message={error.value.value} /> : <>{loaded.value ? <RouterView /> : null}</>}</div>
        </main>

        <Footer />

        <div class="messages">
          <Messages id="cmn-app-messages" messages={messages.value} />
        </div>

        <Transition name="fade">{popup.value.component ? <div class="absolute full bg-inverse-alpha" style="z-index: 600" /> : null}</Transition>

        <Transition name="slide-top">{popup.value.component ? popup.value.component(popup.value.props) : null}</Transition>

        <Transition name="fade">
          {loading.value || fileLoading.value.total ? (
            <div class="loaders fixed p">
              {loading.value ? <div class="loader" /> : null}
              {fileLoading.value.total ? (
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
