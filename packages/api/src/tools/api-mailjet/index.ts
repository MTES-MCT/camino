import Mailjet from 'node-mailjet'
import { config } from '../../config/index'

export const mailjet = new Mailjet({
  apiKey: config().API_MAILJET_KEY,
  apiSecret: config().API_MAILJET_SECRET,
})
