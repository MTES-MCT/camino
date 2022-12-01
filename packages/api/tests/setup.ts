import 'dotenv/config'

import { mailjet } from '../src/tools/api-mailjet/index.js'

export default async () => {
  // https://github.com/mailjet/mailjet-apiv3-nodejs#disable-api-call
  mailjet.post('send', { version: 'v3.1', perform_api_call: false })
}
