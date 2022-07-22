import './styles/styles.css'
import { createApp } from 'vue'
import { sync } from 'vuex-router-sync'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

// le polyfill ResizeObserver est nécessaire pour chart.js sur Firefox 60
// on devrait pourvoir l'injecter dans vite.config, mais ça ne marche pas…
// plugins.legacy({additionalLegacyPolyfills: ['@juggle/resize-observer']})
import { ResizeObserver as resizeObserverPolyfill } from '@juggle/resize-observer'

import VueMatomo from './stats'
import App from './app.vue'

import router from './router'
import store from './store'

window.ResizeObserver = window.ResizeObserver || resizeObserverPolyfill

Promise.resolve().then(async () => {
  const app = createApp(App)
  sync(store, router)
  if (import.meta.env.PROD) {
    try {
      const sentryResponse = await fetch('/sentryOptions')
      const options = await sentryResponse.json()
      if (!options.dsn) throw new Error('dsn manquant')
      Sentry.init({
        app,
        dsn: options.dsn,
        environment: options.environment ? options.environment : 'production',
        autoSessionTracking: false,
        integrations: [
          new BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ['localhost', options.host, /^\//]
          })
        ],
        /* global applicationVersion */
        // @ts-ignore
        release: `camino-ui-${applicationVersion}`
      })
    } catch (e) {
      console.error('erreur : Sentry :', e)
    }
    try {
      const response = await fetch('/matomoOptions')
      const options = await response.json()
      if (!options || !options.host || !options.siteId)
        throw new Error('host et/ou siteId manquant(s)')

      const matomo = await VueMatomo({
        host: options.host,
        siteId: options.siteId,
        environnement: options.environnement,
        router,
        store,
        requireConsent: false,
        disableCookies: true,
        trackInitialView: true,
        trackerFileName: 'piwik',
        enableHeartBeatTimer: true,
        enableLinkTracking: true
      })
      app.provide('matomo', matomo)
      app.config.globalProperties.$matomo = matomo
    } catch (e) {
      console.error('erreur : matomo :', e)
    }

    const eventSource = new EventSource('/stream/version')

    eventSource.addEventListener('version', event => {
      // @ts-ignore
      if (event.data !== applicationVersion) {
        eventSource.close()
        window.location.reload()
      }
    })
  }
  app.use(router)
  app.use(store)
  app.mount('app-root')
})
