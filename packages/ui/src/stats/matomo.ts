import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Router } from 'vue-router'

export const initMatomo = async (options: { router: Router; host: string; siteId: string; environnement: string }) => {
  const trackerFileName = 'piwik'

  await bootstrap(options.host, trackerFileName)
  // @ts-ignore
  const matomo = window.Piwik.getTracker(`${options.host}/${trackerFileName}.php`, options.siteId)

  // dimension d'environnement : https://stats.data.gouv.fr/index.php?module=CustomDimensions&action=manage&idSite=70&period=day&date=yesterday#?idDimension=1&scope=visit
  matomo.setCustomDimension(1, options.environnement)

  matomo.enableHeartBeatTimer()
  matomo.disableCookies()
  matomo.enableLinkTracking(true)
  matomo.setDownloadExtensions('csv|odt|xlsx|geojson')

  options.router.afterEach((to, from) => {
    const url = options.router.resolve(to.fullPath).href
    const referrerUrl: string | null = isNotNullNorUndefined(from) && isNotNullNorUndefined(from.fullPath) ? options.router.resolve(from.fullPath).href : null

    if (referrerUrl !== null) {
      matomo.setReferrerUrl(window.location.origin + referrerUrl)
    }
    matomo.setCustomUrl(window.location.origin + url)
    matomo.trackPageView(to.name)
  })
}

const bootstrap = (host: string, trackerFileName: string): Promise<unknown> => {
  const filename = `${host}/${trackerFileName}.js`

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = filename

    const head = document.head || document.getElementsByTagName('head')[0]
    head.appendChild(script)

    script.onload = resolve
    script.onerror = reject
  }).catch(error => {
    console.info(`Warning: ${error.target.src}. If the file exists, you may have a tracking blocker enabled.`)
  })
}
