import Mailjet from 'node-mailjet'
import { config } from '../../config/index'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

const proxy = config().HTTPS_PROXY
export const mailjet = new Mailjet({
  apiKey: config().API_MAILJET_KEY,
  apiSecret: config().API_MAILJET_SECRET,

  options: {
    proxy: isNotNullNorUndefined(proxy)
      ? {
          host: proxy.host,
          port: proxy.port,
        }
      : undefined,
  },
})
