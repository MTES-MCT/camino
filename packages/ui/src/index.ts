import './styles/styles.css'
import { createApp } from 'vue'
import { sync } from 'vuex-router-sync'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

import VueMatomo from './stats'
import App from './app.vue'

import router from './router'
import store from './store'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { CaminoConfig } from 'camino-common/src/static/config'
import { fetchWithJson } from './api/client-rest'
let applicationVersion = localStorage.getItem('caminoApplicationVersion')

Promise.resolve().then(async (): Promise<void> => {
  const app = createApp(App)
  sync(store, router)
  const configFromJson: CaminoConfig = await fetchWithJson(
    CaminoRestRoutes.config,
    {}
  )
  const eventSource = new EventSource('/stream/version')

  eventSource.addEventListener('version', event => {
    if (applicationVersion === null) {
      localStorage.setItem('caminoApplicationVersion', event.data)
      applicationVersion = event.data
    }
    if (event.data !== applicationVersion) {
      localStorage.setItem('caminoApplicationVersion', event.data)
      eventSource.close()
      window.location.reload()
    }
  })
  if (configFromJson.caminoStage) {
    try {
      if (!configFromJson.sentryDsn) throw new Error('dsn manquant')
      Sentry.init({
        app,
        dsn: configFromJson.sentryDsn,
        environment: configFromJson.environment,
        autoSessionTracking: false,
        integrations: [
          new BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ['localhost', configFromJson.uiHost, /^\//]
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
      if (
        !configFromJson.matomoHost ||
        !configFromJson.matomoSiteId ||
        !configFromJson.environment
      )
        throw new Error('host et/ou siteId manquant(s)')

      const matomo = await VueMatomo({
        host: configFromJson.matomoHost,
        siteId: configFromJson.matomoSiteId,
        environnement: configFromJson.environment,
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
  }
  app.use(router)
  app.use(store)
  app.mount('app-root')
})
