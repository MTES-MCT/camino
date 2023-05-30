import './styles/styles.css'
import { createApp } from 'vue'
import { sync } from 'vuex-router-sync'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

import VueMatomo from './stats'
import { App } from './app'

import router from './router'
import store from './store'
import { CaminoConfig } from 'camino-common/src/static/config'
import { getWithJson } from './api/client-rest'
let caminoApplicationVersion = localStorage.getItem('caminoApplicationVersion')

Promise.resolve().then(async (): Promise<void> => {
  import('./styles/dsfr/dsfr.css')
  const app = createApp(App)
  sync(store, router)
  const configFromJson: CaminoConfig = await getWithJson('/config', {})
  const eventSource = new EventSource('/stream/version')

  eventSource.addEventListener('version', event => {
    if (caminoApplicationVersion === null || caminoApplicationVersion === undefined) {
      localStorage.setItem('caminoApplicationVersion', event.data)
      caminoApplicationVersion = event.data
    } else if (event.data !== caminoApplicationVersion) {
      localStorage.setItem('caminoApplicationVersion', event.data)
      caminoApplicationVersion = event.data
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
            tracingOrigins: ['localhost', /^\//],
          }),
        ],
        release: `camino-ui-${caminoApplicationVersion}`,
        logErrors: true,
      })
    } catch (e) {
      console.error('erreur : Sentry :', e)
    }
    try {
      if (!configFromJson.matomoHost || !configFromJson.matomoSiteId || !configFromJson.environment) throw new Error('host et/ou siteId manquant(s)')

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
        enableLinkTracking: true,
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
