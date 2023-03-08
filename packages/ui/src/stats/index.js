import bootstrap from './bootstrap'
import { visitUser, pageTitre } from './custom-variables'

const defaultOptions = {
  requireConsent: false,
  disableCookies: true,
  trackInitialView: true,
  trackerFileName: 'piwik',
  enableHeartBeatTimer: false,
  enableLinkTracking: false,
  heartBeatTimerInterval: 60,
  environnement: 'dev',
}

const install = (setupOptions = {}) => {
  const options = Object.assign({}, defaultOptions, setupOptions)

  return bootstrap(options)
    .then(() => {
      const matomo = window.Piwik.getTracker(`${options.host}/${options.trackerFileName}.php`, options.siteId)

      // dimension d'environnement : https://stats.data.gouv.fr/index.php?module=CustomDimensions&action=manage&idSite=70&period=day&date=yesterday#?idDimension=1&scope=visit
      matomo.setCustomDimension(1, options.environnement)
      matomo.customVariableVisitUser = visitUser(matomo)
      matomo.customVariablePageTitre = pageTitre(matomo)

      if (options.requireConsent) {
        matomo.requireConsent()
      }

      if (options.enableHeartBeatTimer) {
        matomo.enableHeartBeatTimer()
      }

      if (options.disableCookies) {
        matomo.disableCookies()
      }

      if (options.enableLinkTracking) {
        matomo.enableLinkTracking(options.enableLinkTracking)
        matomo.setDownloadExtensions('csv|odt|xlsx|geojson')
      }

      if (options.router) {
        options.router.afterEach((to, from) => {
          // Unfortunately the window location is not yet updated here
          // We need to make our own ulr using the data provided by the router
          const loc = window.location

          // Protocol may or may not contain a colon
          let protocol = loc.protocol
          if (protocol.slice(-1) !== ':') {
            protocol += ':'
          }

          const url = protocol + '//' + loc.host + to.path
          matomo.setCustomUrl(url)

          matomo.customVariableVisitUser(options.store.state.user.element)
          matomo.trackPageView(name)

          if (to.name !== from.name) {
            // nombre d'affichage de la page
            // titre, titres, entreprises, activites, demarches, utilisateurs
            matomo.trackEvent(`page-${to.name}`, `page-${to.name}_acceder`)

            if (to.name === 'titre') {
              // nombre d'affichage de la page 'titres'
              let action = `page-titre-from-${from.name}`
              action += from.query.vue ? `-${from.query.vue}` : ''

              matomo.trackEvent('page-titre', action, to.params.id)
            }
          }
        })
      }
      return matomo
    })
    .catch(e => {
      console.error('error during matomo initialization', e)
    })
}

export default install
