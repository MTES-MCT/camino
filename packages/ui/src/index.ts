import './styles/styles.css'
import { createApp } from 'vue'
import { sync } from 'vuex-router-sync'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/browser'

import { App } from './app'

import router from './router'
import store from './store'
import { CaminoConfig } from 'camino-common/src/static/config'
import { getWithJson } from './api/client-rest'
import { initMatomo } from './stats/matomo'
// Le Timeout du sse côté backend est mis à 30 secondes, toujours avoir une valeur plus haute ici
const sseTimeoutInSeconds = 45

let caminoApplicationVersion = localStorage.getItem('caminoApplicationVersion')
let lastMessageReceivedFromServer = new Date()

let eventSource: EventSource | null = null

const newEventSource = () => {
  eventSource = new EventSource('/stream/version')
  lastMessageReceivedFromServer = new Date()
  eventSource.addEventListener('version', event => {
    lastMessageReceivedFromServer = new Date()
    if (caminoApplicationVersion === null || caminoApplicationVersion === undefined) {
      localStorage.setItem('caminoApplicationVersion', event.data)
      caminoApplicationVersion = event.data
    } else if (event.data !== caminoApplicationVersion) {
      localStorage.setItem('caminoApplicationVersion', event.data)
      caminoApplicationVersion = event.data
      eventSource?.close()
      eventSource = null
      window.location.reload()
    }
  })
}

const checkEventSource = () => {
  setTimeout(function () {
    if (eventSource === null) {
      newEventSource()
    } else {
      if (Math.abs(lastMessageReceivedFromServer.getTime() - new Date().getTime()) / 1000 > sseTimeoutInSeconds) {
        console.warn('le serveur est injoignable, tentative de reconnexion')
        eventSource?.close()
        eventSource = null
      }
    }

    checkEventSource()
  }, 30_000)
}

checkEventSource()
Promise.resolve().then(async (): Promise<void> => {
  import('./styles/dsfr/dsfr.css')
  const app = createApp(App)
  sync(store, router)
  const configFromJson: CaminoConfig = await getWithJson('/config', {})
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

      await initMatomo({
        host: configFromJson.matomoHost,
        siteId: configFromJson.matomoSiteId,
        environnement: configFromJson.environment,
        router,
      })
    } catch (e) {
      console.error('erreur : matomo :', e)
    }
  }
  app.use(router)
  app.use(store)
  app.mount('app-root')
})
