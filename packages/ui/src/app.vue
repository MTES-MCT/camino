<template>
  <div class="page relative">
    <MapPattern />
    <IconSprite />

    <Header :user="user" :currentMenuSection="currentMenuSection" :trackEvent="trackEvent" />

    <main class="main">
      <div class="container">
        <CaminoError v-if="error" :couleur="error.type" :message="error.value" />
        <RouterView v-else-if="loaded" />
      </div>
    </main>

    <Footer />

    <div class="messages">
      <Messages id="cmn-app-messages" :messages="messages" />
    </div>

    <Transition name="fade">
      <div v-if="!!popup.component" class="absolute full bg-inverse-alpha" style="z-index: 600" />
    </Transition>

    <Transition name="slide-top">
      <component :is="popup.component" v-bind="popup.props" v-if="popup.component" />
    </Transition>

    <Transition name="fade">
      <template v-if="loading || fileLoading.total">
        <div class="loaders fixed p">
          <div v-if="loading" class="loader" />
          <div v-if="fileLoading.total">
            <div class="relative loader-file">
              <div
                class="loader-file-bar"
                :style="{
                  right: `${100 - 100 * (fileLoading.loaded / fileLoading.total)}%`,
                }"
              />
            </div>
          </div>
        </div>
      </template>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import '@gouvfr/dsfr/dist/core/core.module'
import '@gouvfr/dsfr/dist/component/navigation/navigation.module'
import '@gouvfr/dsfr/dist/component/modal/modal.module'
import '@gouvfr/dsfr/dist/component/header/header.module'
import { Messages } from './components/_ui/messages'
import { Header } from './components/page/header'
import { Footer } from './components/page/footer'
import { MapPattern } from './components/_map/pattern'
import { IconSprite } from './components/_ui/iconSprite'

import { CaminoError } from './components/error'
import { computed, inject } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { TrackEventFunction } from '@/utils/matomo'

const store = useStore()
const matomo = inject('matomo', null)
const route = useRoute()

const user = computed(() => store.state.user.element)

const loaded = computed(() => store.state.user.loaded)

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
</script>
